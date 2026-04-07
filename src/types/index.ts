export type TabType =
'dashboard' |
'clients_new' |
'atendimentos' |
'process_cases' |
'financeiro' |
'calendar' |
'reports' |
'admin_roles';

export type StatusType = 'pago' | 'pendente' | 'atrasado';

// ==========================================
// AUTH & RBAC TYPES
// ==========================================

export type AppRole =
'administrador' |
'advogado_total' |
'advogado_senior' |
'advogado_junior' |
'atendente';

export type Permission =
'dashboard.view' |
'clients.view' |
'clients.create' |
'clients.edit' |
'clients.delete' |
'atendimentos.view' |
'atendimentos.create' |
'atendimentos.edit' |
'atendimentos.delete' |
'financeiro.view' |
'financeiro.create' |
'financeiro.edit' |
'financeiro.delete' |
'calendar.view' |
'calendar.create' |
'calendar.edit' |
'calendar.delete' |
'reports.view' |
'reports.create' |
'admin.roles' |
'admin.users';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  active: boolean;
  createdAt: string;
}

// ==========================================
// CLIENT RECORD (Astrea-style)
// ==========================================

export type MaritalStatus =
'solteiro' |
'casado' |
'divorciado' |
'viuvo' |
'uniao_estavel';

export interface ClientRecord {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  birthDate?: string;
  maritalStatus?: MaritalStatus;
  profession?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  motherName?: string;
  cep?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  observations?: string;
  status: 'ativo' | 'inativo';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ==========================================
// ATENDIMENTOS (Attendances)
// ==========================================

export type AttendanceStatus =
'novo_contato' |
'em_analise' |
'aguardando_documentos' |
'proposta_enviada' |
'fechado' |
'nao_fechado';

export type AttendanceLogType =
'ligacao' |
'mensagem' |
'reuniao' |
'observacao';

export type AreaOfLaw =
'trabalhista' |
'civil' |
'familia' |
'criminal' |
'tributario' |
'empresarial' |
'previdenciario' |
'consumidor' |
'imobiliario' |
'outro';

export interface AttendanceLog {
  id: string;
  attendanceId: string;
  userId: string;
  type: AttendanceLogType;
  description: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  clientId: string;
  areaOfLaw: AreaOfLaw;
  description: string;
  origin?: string;
  estimatedValue?: number;
  probability?: number;
  status: AttendanceStatus;
  responsibleUserId: string;
  nextContactDate?: string;
  observations?: string;
  attachments?: Attachment[];
  logs: AttendanceLog[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ==========================================
// EXISTING TYPES (unchanged)
// ==========================================

export interface Installment {
  id: string;
  description: string;
  value: number;
  dueDate: string;
  status: StatusType;
  paidDate?: string;
}

export interface WhatsAppLog {
  id: string;
  date: string;
  phone: string;
  observation: string;
}

export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  email: string;
  installments: Installment[];
  whatsappHistory: WhatsAppLog[];
}

export type FinancialMovementDirection = 'entrada' | 'saida';

export type FinancialMovementStatus = 'a_receber' | 'recebida';

export type FinancialMovementType =
'entrada_avulsa' |
'adiantamento_despesa' |
'honorario';

export type FinancialMovementClassification =
'Adiantamento de despesas' |
'Aluguel' |
'Anuidade OAB' |
'COFINS' |
'CSLL' |
'Capitalização sócios' |
'Condomínio' |
'Contador' |
'Despesa do cliente' |
'GPS - INSS' |
'Honorários' |
'IPTU' |
'IRRF' |
'Impostos' |
'Limpeza' |
'Marketing' |
'PIS' |
'PróLabore' |
'Rendimentos financeiros' |
'Salários';

export interface FinancialMovement {
  id: string;
  direction: FinancialMovementDirection;
  status: FinancialMovementStatus;
  receivedAt: string;
  movementType: FinancialMovementType;
  receivedFrom: string;
  clientId?: string;
  description: string;
  amount: number;
  documentNumber?: string;
  classification: FinancialMovementClassification;
  account: string;
  repeatMonthly: boolean;
  installmentCount?: number;
  installmentIndex?: number;
  installmentGroupId?: string;
  printReceipt: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarNotice {
  id: string;
  date: string;
  title: string;
  description: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  url: string;
}

export interface MetricData {
  title: string;
  value: string;
  icon: React.ReactNode;
  glowColor: 'blue' | 'green' | 'red' | 'orange';
  trend?: 'up' | 'down';
}

// ==========================================
// LEGAL CALENDAR TYPES
// ==========================================

export type CalendarViewMode = 'month' | 'week' | 'day' | 'list';

export type LegalEventType =
'prazo_processual' |
'audiencia' |
'reuniao' |
'atendimento' |
'tarefa';

export type LegalEventStatus =
'pendente' |
'em_andamento' |
'concluido' |
'aguardando_autorizacao' |
'aguardando_documentacao' |
'cartorio' |
'aguardando_correcao' |
'atrasado';

export type UserRole = 'admin' | 'usuario';

export interface LegalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface LegalClient {
  id: string;
  name: string;
  cpfCnpj: string;
}

export interface LegalProcess {
  id: string;
  number: string;
  client: string;
  tribunal: string;
  description: string;
  title?: string;
  label?: string;
  instance?: '1_grau' | '2_grau' | 'superior' | 'supremo' | 'outra';
  clientQualification?: string;
  otherInvolvedName?: string;
  otherInvolvedQualification?: string;
  courtNumber?: string;
  courtDivision?: string;
  forum?: string;
  action?: string;
  tribunalLink?: string;
  subject?: string;
  claimValue?: number;
  distributedAt?: string;
  condemnationValue?: number;
  notes?: string;
  responsibleId?: string;
  responsibleName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegalEvent {
  id: string;
  title: string;
  type: LegalEventType;
  dateStart: string;
  dateEnd: string;
  timeStart?: string;
  timeEnd?: string;
  allDay: boolean;
  clientId?: string;
  processId?: string;
  tribunal?: string;
  responsibleId: string;
  responsibleIds?: string[];
  status: LegalEventStatus;
  labels?: LegalEventStatus[];
  observations?: string;
  attachments: Attachment[];
  alertDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface DeadlineCalculation {
  startDate: string;
  businessDays: number;
  resultDate: string;
  alertDate: string;
}