import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['src'];
const ALLOWED_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md']);
const IGNORE_PARTS = new Set(['node_modules', 'dist', '.git']);

const cpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b/g;
const cnpjRegex = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b|\b\d{14}\b/g;
const rgRegex = /\bRG\s*[:\-]?\s*[0-9.\-/]{5,}\b/gi;

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    if (IGNORE_PARTS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(...listFiles(full));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (ALLOWED_EXT.has(ext)) {
      result.push(full);
    }
  }

  return result;
}

function inspectFile(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const findings = [];

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const normalized = line.toLowerCase();

    // Allow known UI examples and mask docs that are not real PII.
    if (
      normalized.includes('placeholder="000.000.000-00"') ||
      normalized.includes("placeholder='000.000.000-00'") ||
      normalized.includes('cpf mask: 000.000.000-00') ||
      normalized.includes('cpf: 000.000.000-00') ||
      normalized.includes('111.111.111-11') ||
      normalized.includes('másca') ||
      normalized.includes('máscara') ||
      normalized.includes('validação') ||
      normalized.includes('validation')
    ) {
      continue;
    }

    if (line.includes('[DADO SENSIVEL]') || line.includes('[DADO SENSÍVEL]')) {
      continue;
    }

    const hasCpf = cpfRegex.test(line);
    cpfRegex.lastIndex = 0;
    const hasCnpj = cnpjRegex.test(line);
    cnpjRegex.lastIndex = 0;
    const hasRg = rgRegex.test(line);
    rgRegex.lastIndex = 0;

    if (hasCpf || hasCnpj || hasRg) {
      findings.push({
        line: i + 1,
        text: line.trim().slice(0, 180),
      });
    }
  }

  return findings.map((f) => `${rel}:${f.line} -> ${f.text}`);
}

const files = TARGET_DIRS.flatMap((dir) => listFiles(path.join(ROOT, dir)));
const issues = files.flatMap((filePath) => inspectFile(filePath));

if (issues.length > 0) {
  console.error('[sensitive-check] Dados sensiveis detectados (CPF/CNPJ/RG).');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log('[sensitive-check] OK: nenhum CPF/CNPJ/RG detectado em src/.');
