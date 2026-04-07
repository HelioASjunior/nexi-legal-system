/* eslint-env node */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Buffer } from 'node:buffer';

const app = express();
const PORT = Number(process.env.PORT || 4000);

// ── CORS ─────────────────────────────────────────────────────────────────────
// Whitelist explícita — nunca usar origin: true em produção.
const rawOrigins = String(process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4000').trim();
const allowedOrigins = new Set(rawOrigins.split(',').map((o) => o.trim()).filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origin (ex: curl, mobile apps no mesmo host)
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origem não permitida — ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── HELMET / CSP ──────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...Array.from(allowedOrigins)],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
  })
);

app.use(express.json({ limit: '2mb' }));

// ── DATABASE ──────────────────────────────────────────────────────────────────
const dbDir = path.resolve(process.cwd(), 'server', 'data');
fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'crm.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const sqliteDataKey = String(process.env.SQLITE_DATA_KEY || '').trim();
if (!sqliteDataKey) {
  throw new Error('SQLITE_DATA_KEY obrigatoria. Defina no ambiente antes de iniciar a API.');
}

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  payload_encrypted TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_state (
  state_key TEXT PRIMARY KEY,
  payload_encrypted TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`);

// ── CRIPTO (dados em repouso) ─────────────────────────────────────────────────
const cipherKey = crypto.createHash('sha256').update(sqliteDataKey).digest();

function encryptText(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', cipherKey, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptText(payload) {
  const [ivHex, tagHex, encryptedHex] = String(payload).split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', cipherKey, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidPassword(pw) {
  return typeof pw === 'string' && pw.length >= 6 && pw.length <= 128;
}

// ── SESSÕES / TOKENS ──────────────────────────────────────────────────────────
// Tokens opacos de 48 hex chars com expiração de 24 h armazenados em memória.
// Em produção com múltiplos processos, migrar para Redis.
const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 horas

/** @type {Map<string, {userId: string, role: string, issuedAt: number, expiresAt: number}>} */
const authTokens = new Map();

// Limpeza periódica de tokens expirados (a cada hora)
setInterval(() => {
  const now = Date.now();
  for (const [tok, session] of authTokens.entries()) {
    if (now >= session.expiresAt) authTokens.delete(tok);
  }
}, 60 * 60 * 1000);

function extractBearerToken(req) {
  const header = String(req.headers.authorization || '');
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  return header.slice(7).trim();
}

function requireAuth(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Não autenticado.' });

  const session = authTokens.get(token);
  if (!session) return res.status(401).json({ error: 'Sessão inválida.' });

  if (Date.now() >= session.expiresAt) {
    authTokens.delete(token);
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  req.authUserId = session.userId;
  req.authUserRole = session.role;
  return next();
}

function requireAdmin(req, res, next) {
  if (req.authUserRole !== 'administrador') {
    return res.status(403).json({ error: 'Acesso negado. Requer permissão de administrador.' });
  }
  return next();
}

// ── RATE LIMITING (login) ────────────────────────────────────────────────────
// Implementação inline — sem dependência extra.
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 min
const LOGIN_MAX_ATTEMPTS = 10;
/** @type {Map<string, {count: number, windowStart: number}>} */
const loginAttempts = new Map();

// Limpeza periódica de janelas antigas
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of loginAttempts.entries()) {
    if (now - rec.windowStart > LOGIN_WINDOW_MS) loginAttempts.delete(ip);
  }
}, 60 * 60 * 1000);

function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const rec = loginAttempts.get(ip);

  if (rec) {
    if (now - rec.windowStart < LOGIN_WINDOW_MS) {
      if (rec.count >= LOGIN_MAX_ATTEMPTS) {
        const retryAfterSec = Math.ceil((rec.windowStart + LOGIN_WINDOW_MS - now) / 1000);
        res.setHeader('Retry-After', retryAfterSec);
        return res
          .status(429)
          .json({ error: `Muitas tentativas de login. Tente novamente em ${Math.ceil(retryAfterSec / 60)} minutos.` });
      }
      rec.count += 1;
    } else {
      loginAttempts.set(ip, { count: 1, windowStart: now });
    }
  } else {
    loginAttempts.set(ip, { count: 1, windowStart: now });
  }

  return next();
}

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// ── AUTENTICAÇÃO ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  const login = normalizeEmail(email);

  if (!login || login.length > 254) {
    return res.status(400).json({ error: 'Credenciais inválidas.' });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Credenciais inválidas.' });
  }

  const row = db
    .prepare(
      'SELECT id, name, email, role, active, created_at as createdAt, password_hash FROM users WHERE lower(email) = ? OR lower(name) = ? LIMIT 1'
    )
    .get(login, login);

  if (!row) return res.status(401).json({ error: 'Credenciais inválidas.' });
  if (!row.active) return res.status(403).json({ error: 'Usuário inativo.' });

  const valid = await bcrypt.compare(String(password), row.password_hash);
  if (!valid) return res.status(401).json({ error: 'Credenciais inválidas.' });

  // Login bem-sucedido — zerar contador de tentativas
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  loginAttempts.delete(ip);

  const token = crypto.randomBytes(24).toString('hex');
  authTokens.set(token, {
    userId: row.id,
    role: row.role,
    issuedAt: Date.now(),
    expiresAt: Date.now() + TOKEN_TTL,
  });

  res.json({
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      active: Boolean(row.active),
      createdAt: row.createdAt,
    },
    token,
  });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = extractBearerToken(req);
  if (token) authTokens.delete(token);
  res.json({ ok: true });
});

// ── USUÁRIOS ──────────────────────────────────────────────────────────────────
// Listagem pública apenas de campos não-sensíveis — protegida por auth.
app.get('/api/users', requireAuth, (_req, res) => {
  const rows = db
    .prepare('SELECT id, name, email, role, active, created_at as createdAt FROM users ORDER BY created_at DESC')
    .all();

  res.json({ users: rows.map((r) => ({ ...r, active: Boolean(r.active) })) });
});

// Criação individual de usuário (admin).
app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Nome é obrigatório.' });
  }
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Senha deve ter entre 6 e 128 caracteres.' });
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Já existe um usuário com este e-mail.' });
  }

  const hash = await bcrypt.hash(String(password), 12);
  const now = new Date().toISOString();
  const id = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  db.prepare(
    'INSERT INTO users (id, name, email, role, active, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?, ?)'
  ).run(id, String(name).trim(), normalizedEmail, String(role || 'atendente'), hash, now, now);

  res.status(201).json({
    user: {
      id,
      name: String(name).trim(),
      email: normalizedEmail,
      role: String(role || 'atendente'),
      active: true,
      createdAt: now,
    },
  });
});

// Redefinição de senha (admin).
app.put('/api/users/:id/password', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body || {};

  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Senha deve ter entre 6 e 128 caracteres.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const hash = await bcrypt.hash(String(password), 12);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(
    hash,
    new Date().toISOString(),
    id
  );

  res.json({ ok: true });
});

// Toggle ativo/inativo (admin).
app.put('/api/users/:id/active', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const row = db.prepare('SELECT id, active FROM users WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const newActive = row.active ? 0 : 1;
  db.prepare('UPDATE users SET active = ?, updated_at = ? WHERE id = ?').run(
    newActive,
    new Date().toISOString(),
    id
  );

  res.json({ ok: true, active: Boolean(newActive) });
});

// Sincronização em lote (admin) — usado pelo painel de administração.
app.post('/api/users/sync', requireAuth, requireAdmin, async (req, res) => {
  const { users, replace = true } = req.body || {};
  if (!Array.isArray(users)) return res.status(400).json({ error: 'Payload inválido.' });

  const now = new Date().toISOString();
  const existingHashes = new Map(
    db.prepare('SELECT id, password_hash FROM users').all().map((row) => [row.id, row.password_hash])
  );

  const upsertStmt = db.prepare(`
    INSERT INTO users (id, name, email, role, active, password_hash, created_at, updated_at)
    VALUES (@id, @name, @email, @role, @active, @password_hash, @created_at, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      role = excluded.role,
      active = excluded.active,
      password_hash = excluded.password_hash,
      updated_at = excluded.updated_at
  `);

  const deleteMissingStmt = db.prepare(
    `DELETE FROM users WHERE id NOT IN (${users.map(() => '?').join(',') || "''"})`
  );

  const tx = db.transaction(async () => {
    for (const user of users) {
      // Aceita apenas 'password' em texto claro — sem _k (base64 removido).
      const plainPassword =
        typeof user.password === 'string' && user.password.length >= 6
          ? user.password
          : null;

      const passwordHash = plainPassword
        ? await bcrypt.hash(plainPassword, 12)
        : existingHashes.get(user.id) || (await bcrypt.hash(`tmp-${user.id}`, 12));

      upsertStmt.run({
        id: String(user.id),
        name: String(user.name || '').trim(),
        email: normalizeEmail(user.email),
        role: String(user.role || 'atendente'),
        active: user.active ? 1 : 0,
        password_hash: passwordHash,
        created_at: String(user.createdAt || now),
        updated_at: now,
      });
    }

    if (replace && users.length > 0) {
      deleteMissingStmt.run(...users.map((u) => String(u.id)));
    }
  });

  await tx();
  res.json({ ok: true, count: users.length });
});

// ── CLIENTES (requer auth) ────────────────────────────────────────────────────
app.use('/api/clients', requireAuth);

app.post('/api/clients/sync', (req, res) => {
  const { clients, replace = true } = req.body || {};
  if (!Array.isArray(clients)) return res.status(400).json({ error: 'Payload inválido.' });

  const now = new Date().toISOString();
  const upsertStmt = db.prepare(`
    INSERT INTO clients (id, payload_encrypted, created_at, updated_at)
    VALUES (@id, @payload_encrypted, @created_at, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      payload_encrypted = excluded.payload_encrypted,
      updated_at = excluded.updated_at
  `);

  const deleteMissingStmt = db.prepare(
    `DELETE FROM clients WHERE id NOT IN (${clients.map(() => '?').join(',') || "''"})`
  );

  const tx = db.transaction(() => {
    for (const client of clients) {
      const payloadEncrypted = encryptText(JSON.stringify(client));
      upsertStmt.run({
        id: String(client.id),
        payload_encrypted: payloadEncrypted,
        created_at: String(client.createdAt || now),
        updated_at: now,
      });
    }

    if (replace && clients.length > 0) {
      deleteMissingStmt.run(...clients.map((c) => String(c.id)));
    }
  });

  tx();
  res.json({ ok: true, count: clients.length });
});

app.get('/api/clients', (_req, res) => {
  const rows = db.prepare('SELECT id, payload_encrypted FROM clients ORDER BY updated_at DESC').all();

  const clients = rows
    .map((row) => {
      try {
        return JSON.parse(decryptText(row.payload_encrypted));
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  res.json({ clients });
});

// ── ESTADO DA APLICAÇÃO (requer auth) ────────────────────────────────────────
app.get('/api/state', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT state_key, payload_encrypted FROM app_state').all();
  const state = {};

  for (const row of rows) {
    try {
      state[row.state_key] = JSON.parse(decryptText(row.payload_encrypted));
    } catch {
      // Ignora linhas corrompidas para não bloquear o boot.
    }
  }

  res.json({ state });
});

app.post('/api/state/sync', requireAuth, (req, res) => {
  const { state } = req.body || {};
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return res.status(400).json({ error: 'Payload inválido.' });
  }

  const now = new Date().toISOString();
  const upsertStmt = db.prepare(`
    INSERT INTO app_state (state_key, payload_encrypted, updated_at)
    VALUES (@state_key, @payload_encrypted, @updated_at)
    ON CONFLICT(state_key) DO UPDATE SET
      payload_encrypted = excluded.payload_encrypted,
      updated_at = excluded.updated_at
  `);

  const entries = Object.entries(state);

  const tx = db.transaction(() => {
    for (const [stateKey, value] of entries) {
      upsertStmt.run({
        state_key: String(stateKey),
        payload_encrypted: encryptText(JSON.stringify(value)),
        updated_at: now,
      });
    }
  });

  tx();
  res.json({ ok: true, count: entries.length });
});

// ── FRONTEND ESTÁTICO ─────────────────────────────────────────────────────────
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  app.get('/{*any}', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(distDir, 'index.html'));
  });
}

// ── BOOTSTRAP: seed admin ──────────────────────────────────────────────────────
async function seedAdminIfNeeded() {
  const seedPassword = String(process.env.SEED_ADMIN_PASSWORD || '').trim();
  if (!seedPassword) return;

  const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (row.count > 0) return;

  if (!isValidPassword(seedPassword)) {
    console.warn('[sqlite-api] SEED_ADMIN_PASSWORD deve ter entre 6 e 128 caracteres. Seed ignorado.');
    return;
  }

  const hash = await bcrypt.hash(seedPassword, 12);
  const now = new Date().toISOString();
  const seedEmail = normalizeEmail(String(process.env.SEED_ADMIN_EMAIL || 'admin'));
  const seedName = String(process.env.SEED_ADMIN_NAME || 'Administrador').trim();

  db.prepare(
    'INSERT OR IGNORE INTO users (id, name, email, role, active, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?, ?)'
  ).run('seed-admin-1', seedName, seedEmail, 'administrador', hash, now, now);

  console.log(`[sqlite-api] Seed admin criado: ${seedEmail}`);
}

// ── START ──────────────────────────────────────────────────────────────────────
await seedAdminIfNeeded();

app.listen(PORT, () => {
  console.log(`[sqlite-api] running on http://localhost:${PORT}`);
  console.log(`[sqlite-api] database: ${dbPath}`);
  if (fs.existsSync(distDir)) {
    console.log('[sqlite-api] frontend dist detectado — servido pelo processo da API');
  }
});
