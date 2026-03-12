import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';

const root = process.cwd();
const inputPath = path.join(root, 'contatos.xlsx');
const outPath = path.join(root, 'src', 'data', 'clientRecords.ts');

const wb = XLSX.readFile(inputPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

function toIsoDate(brDate) {
  const s = String(brDate || '').trim();
  if (!s) return new Date().toISOString();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return new Date().toISOString();
  const [, dd, mm, yyyy] = m;
  return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`).toISOString();
}

function mapMaritalStatus(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v.startsWith('solteir')) return 'solteiro';
  if (v.startsWith('casad')) return 'casado';
  if (v.startsWith('divorc')) return 'divorciado';
  if (v.startsWith('viuv')) return 'viuvo';
  if (v.includes('uni') && v.includes('est')) return 'uniao_estavel';
  return undefined;
}

function cleanPhone(value) {
  const raw = String(value || '').replace(/^"|"$/g, '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  return digits || raw;
}

function parseAddress(rawAddress) {
  const raw = String(rawAddress || '').replace(/^"|"$/g, '').trim();
  if (!raw) {
    return {
      street: 'Nao informado',
      number: 'S/N',
      neighborhood: 'Nao informado',
      city: 'Nao informado',
      state: 'NI',
      cep: undefined
    };
  }

  const parts = raw.split(' - ').map((p) => p.trim()).filter(Boolean);

  let street = 'Nao informado';
  let number = 'S/N';
  let neighborhood = 'Nao informado';
  let city = 'Nao informado';
  let state = 'NI';
  let cep;

  if (parts.length >= 1) {
    const first = parts[0].split(',').map((p) => p.trim());
    street = first[0] || street;
    if (first[1]) number = first[1] || number;
  }

  if (parts.length >= 2) neighborhood = parts[1] || neighborhood;
  if (parts.length >= 3) city = parts[2] || city;
  if (parts.length >= 4) state = (parts[3] || state).toUpperCase().slice(0, 2);
  if (parts.length >= 5) {
    const d = (parts[4] || '').replace(/\D/g, '');
    if (d.length === 8) cep = `${d.slice(0, 5)}-${d.slice(5)}`;
  }

  return { street, number, neighborhood, city, state, cep };
}

const now = new Date().toISOString();
const clients = rows.map((r, idx) => {
  const name = String(r['Nome/Empresa'] || '').trim() || `Contato ${idx + 1}`;
  const cpfCnpj = String(r['CPF/CNPJ'] || '').trim();
  const phoneRaw = String(r['Telefone'] || '').trim();
  const addressRaw = String(r['Endereço'] || '').trim();
  const cadastro = String(r['Data de cadastro'] || '').trim();
  const address = parseAddress(addressRaw);

  return {
    id: `cr-import-${idx + 1}`,
    name,
    cpf: cpfCnpj,
    rg: String(r['RG/IE'] || '').trim() || undefined,
    birthDate: toIsoDate(String(r['Nascimento'] || '').trim()).split('T')[0] || undefined,
    maritalStatus: mapMaritalStatus(r['Estado cívil']),
    profession: String(r['Profissão/Cargo'] || '').trim() || undefined,
    phone: cleanPhone(phoneRaw) || undefined,
    whatsapp: cleanPhone(phoneRaw) || undefined,
    email: String(r['Email'] || '').trim() || undefined,
    motherName: String(r['Nome da mãe'] || '').trim() || undefined,
    cep: address.cep,
    street: address.street,
    number: address.number,
    complement: undefined,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    observations: String(r['Comentários'] || '').trim() || undefined,
    status: 'ativo',
    createdBy: 'import-xlsx',
    createdAt: cadastro ? toIsoDate(cadastro) : now,
    updatedAt: now
  };
});

const content = `import { ClientRecord } from '../types';\n\nexport const mockClientRecords: ClientRecord[] = ${JSON.stringify(clients, null, 2)};\n`;
fs.writeFileSync(outPath, content, 'utf8');
console.log(`Importados ${clients.length} contatos para src/data/clientRecords.ts`);
