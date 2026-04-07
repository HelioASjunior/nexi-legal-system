# NeXi Sistema Jurídico

Web system for legal office operations, combining client management, case workflow, legal calendar, finance, role-based access, and a SQLite API with encrypted data at rest.

![Language](https://img.shields.io/badge/language-TypeScript-blue)
![Frontend](https://img.shields.io/badge/frontend-React%2018-61DAFB)
![Build](https://img.shields.io/badge/build-Vite%205-646CFF)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.0.1-informational)

---

## English

## 1) Project Header

NeXi Sistema Jurídico is a legal-office platform focused on client lifecycle, attendance pipeline, calendar deadlines, financial tracking, and admin permissions.
It runs as a React + Vite frontend and an Express + SQLite backend with authenticated API access.

## 2) About the Project

### What the system does

- Manages client records with detailed personal/contact/address fields.
- Tracks attendance workflow (pipeline-style statuses, logs, responsible users).
- Organizes legal events in multiple calendar views (month/week/day/list), with deadline calculator support.
- Controls financial movements (income/expense, status, installments, classifications, account).
- Provides user/role administration with customizable permissions.
- Persists data through a backend API in SQLite with AES-256-GCM encrypted payloads for clients and app state.

### Problem it solves

Legal offices often split work across spreadsheets, chat history, and disconnected tools. This project centralizes operational, legal, and financial workflows in one system with permission control and authenticated data access.

### Main features (from code)

- Authentication and session bootstrap via backend token.
- Role and permission checks before page/module access.
- Dashboard with metrics and charts from real application state.
- Client import/export (CSV/XLS/XLSX), filtering, and detailed record handling.
- Attendance list and kanban views with status transitions.
- Calendar filtering by type/status/client/process/responsible and event detail panels.
- Financial tab segmentation (all/open/paid), grouped balances per day, movement presets, and entry modal.
- Reports page with chart-based analytics and PDF export.
- Sensitive data pre-check script for CPF/CNPJ/RG patterns before build/commit.

## 3) Technologies Used

Dependencies and versions were taken from package.json.

### Runtime dependencies

| Package | Version |
|---|---|
| @emotion/react | ^11.13.3 |
| bcryptjs | ^3.0.3 |
| better-sqlite3 | ^12.8.0 |
| cors | ^2.8.6 |
| dotenv | ^17.4.1 |
| express | ^5.2.1 |
| helmet | ^8.1.0 |
| jspdf | ^2.5.1 |
| lucide-react | 0.522.0 |
| react | ^18.3.1 |
| react-dom | ^18.3.1 |
| recharts | ^2.12.7 |
| xlsx | ^0.18.5 |

### Development dependencies

| Package | Version |
|---|---|
| @types/node | ^20.11.18 |
| @types/react | ^18.3.1 |
| @types/react-dom | ^18.3.1 |
| @typescript-eslint/eslint-plugin | ^5.54.0 |
| @typescript-eslint/parser | ^5.54.0 |
| @vitejs/plugin-react | ^4.2.1 |
| autoprefixer | latest |
| eslint | ^8.50.0 |
| eslint-plugin-react-hooks | ^4.6.0 |
| eslint-plugin-react-refresh | ^0.4.1 |
| gif-encoder-2 | ^1.0.5 |
| gifenc | ^1.0.3 |
| playwright | ^1.58.2 |
| pngjs | ^7.0.0 |
| postcss | latest |
| tailwindcss | 3.4.17 |
| typescript | ^5.5.4 |
| vite | ^5.2.0 |

## 4) Prerequisites and Installation

### Environment requirements

- Node.js
- npm

No Python runtime is required by this codebase.

### Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file from the template:

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

3. Fill required environment variables.

### Environment variables (from .env.example)

#### Backend

- PORT
- SQLITE_DATA_KEY
- ALLOWED_ORIGINS
- SEED_ADMIN_EMAIL
- SEED_ADMIN_NAME
- SEED_ADMIN_PASSWORD

#### Frontend (public at build time)

- VITE_API_BASE_URL
- VITE_REQUIRE_DATABASE
- VITE_VIA_CEP_API_BASE_URL

#### Optional local scripting

- SCREENSHOT_LOGIN
- SCREENSHOT_PASSWORD

Important:

- SQLITE_DATA_KEY is required for API startup.
- Variables with VITE_ prefix are embedded into frontend bundles.

### Run locally

Frontend only:

```bash
npm run dev
```

Backend only:

```bash
npm run api
```

Frontend + backend together:

```bash
npm run dev:full
```

Build:

```bash
npm run build
```

Production start (serves API and dist when available):

```bash
npm run start
```

## 5) How to Use

### Main functional flow

1. Start API and frontend.
2. Log in using a seeded or existing user.
3. Manage clients, attendances, processes, calendar events, and financial movements.
4. Access reports for chart analytics and PDF export.
5. Admin users can manage users/roles and permission toggles.

### API routes available (from server/index.js)

#### Health

- GET /api/health

#### Auth

- POST /api/auth/login
- POST /api/auth/logout

#### Users

- GET /api/users
- POST /api/users
- PUT /api/users/:id/password
- PUT /api/users/:id/active
- POST /api/users/sync

#### Clients

- GET /api/clients
- POST /api/clients/sync

#### App state

- GET /api/state
- POST /api/state/sync

### Screenshot / output examples

Current repository already contains visual assets in docs/screenshots:

- docs/screenshots/dashboard-real.png
- docs/screenshots/calendario-real.png
- docs/screenshots/navegacao.gif

If you want to add more screenshots, place them under docs/screenshots and reference them in this README.

## 6) Folder Structure

```text
.
├─ assets/                           # Static image assets used by the UI
├─ docs/
│  └─ screenshots/                   # README/demo images and GIF frames
├─ scripts/
│  ├─ check-sensitive-data.mjs       # CPF/CNPJ/RG scan in source files
│  ├─ dev-full.mjs                   # Runs API + frontend together
│  ├─ import-contatos-xlsx.mjs       # Helper for spreadsheet import workflow
│  ├─ capture-readme-assets.mjs      # Capture utility for README assets
│  └─ build-readme-gif.mjs           # Generates navigation GIF
├─ server/
│  ├─ index.js                       # Express API, auth, SQLite persistence, static serving
│  └─ data/                          # SQLite database directory (runtime)
├─ src/
│  ├─ App.tsx                        # App bootstrap, DB readiness gate, provider composition
│  ├─ components/                    # Reusable UI and domain-specific components
│  ├─ config/
│  │  └─ env.ts                      # Environment assertions/guards
│  ├─ context/                       # Auth, data, theme, language providers
│  ├─ data/                          # Seed/mock datasets and auth data access helpers
│  ├─ locales/                       # i18n dictionaries (pt/en)
│  ├─ pages/                         # Feature pages (dashboard, clients, attendances, etc.)
│  ├─ services/
│  │  └─ sqliteApi.ts                # Frontend API client layer
│  ├─ types/                         # Shared domain types
│  └─ utils/                         # Auth, masks, legal deadlines, crypto utilities
├─ .githooks/
│  └─ pre-commit                     # Runs npm run check:sensitive before commit
├─ .env.example                      # Environment template
├─ package.json                      # Scripts and dependency declarations
├─ tailwind.config.js                # Tailwind config
├─ postcss.config.js                 # PostCSS config
└─ vite.config.ts                    # Vite config
```

## 7) How to Contribute

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes with clear messages.
4. Run lint and build locally.
5. Open a Pull Request describing scope and impact.

Recommended local checks before PR:

```bash
npm run lint
npm run check:sensitive
npm run build
```

---

## Português-BR

## 1) Cabeçalho

NeXi Sistema Jurídico é uma plataforma para operação de escritório jurídico, unificando gestão de clientes, atendimentos, agenda jurídica, financeiro e administração de permissões.
O projeto executa com frontend React + Vite e backend Express + SQLite com API autenticada.

## 2) Sobre o projeto

### O que o sistema faz

- Gerencia cadastro de clientes com dados pessoais, contato e endereço.
- Controla funil de atendimentos com histórico e responsáveis.
- Organiza eventos jurídicos em visões mensal/semanal/diária/lista, com calculadora de prazos.
- Controla lançamentos financeiros (entrada/saída, status, parcelamento, classificação, conta).
- Permite administração de usuários, cargos e permissões customizadas.
- Persiste dados via API no SQLite com payloads criptografados em repouso.

### Problema que resolve

Reduz a fragmentação operacional do escritório (planilhas, controles manuais e ferramentas desconectadas), centralizando fluxo jurídico, comercial e financeiro com autenticação e controle de acesso.

### Principais funcionalidades

- Login autenticado com token e restauração de sessão.
- Controle de acesso por papel/permissão antes de liberar módulos.
- Dashboard com métricas e gráficos baseados no estado real do sistema.
- Clientes com importação/exportação e formulários detalhados.
- Atendimentos em lista e kanban com transição de status.
- Calendário com filtros por tipo/status/cliente/processo/responsável.
- Financeiro com abas de status, agrupamento diário e modal de lançamento.
- Relatórios com exportação em PDF.
- Verificação automática de padrões sensíveis (CPF/CNPJ/RG) no pipeline local.

## 3) Tecnologias utilizadas

As dependências e versões estão listadas na seção em inglês deste README, extraídas diretamente de package.json.

## 4) Pré-requisitos e instalação

### Requisitos de ambiente

- Node.js
- npm

### Instalação local

1. Instale dependências:

```bash
npm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Preencha as variáveis necessárias.

### Variáveis de ambiente

Backend:

- PORT
- SQLITE_DATA_KEY
- ALLOWED_ORIGINS
- SEED_ADMIN_EMAIL
- SEED_ADMIN_NAME
- SEED_ADMIN_PASSWORD

Frontend:

- VITE_API_BASE_URL
- VITE_REQUIRE_DATABASE
- VITE_VIA_CEP_API_BASE_URL

Opcional para scripts locais:

- SCREENSHOT_LOGIN
- SCREENSHOT_PASSWORD

## 5) Como usar

### Fluxo principal

1. Inicie API e frontend.
2. Faça login com usuário existente/seed.
3. Use os módulos de clientes, atendimentos, processos, calendário e financeiro.
4. Gere análises na página de relatórios.
5. Se for admin, gerencie usuários, cargos e permissões.

### Rotas de API

As rotas disponíveis estão listadas na seção em inglês, todas extraídas de server/index.js.

### Screenshots e outputs

Arquivos já presentes para documentação visual:

- docs/screenshots/dashboard-real.png
- docs/screenshots/calendario-real.png
- docs/screenshots/navegacao.gif

## 6) Estrutura de pastas

A árvore comentada está na seção em inglês e representa a estrutura real atual do repositório.

## 7) Como contribuir

1. Faça fork do projeto.
2. Crie uma branch de feature.
3. Commit suas alterações.
4. Execute lint/check/build localmente.
5. Abra um Pull Request com descrição objetiva.

---

## License

MIT License. See LICENSE.
