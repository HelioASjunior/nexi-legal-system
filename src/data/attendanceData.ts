import { Attendance, AttendanceStatus, AreaOfLaw } from '../types';

export const mockAttendances: Attendance[] = [];

export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  {label: string;color: string;bgColor: string;}> =
{
  novo_contato: {
    label: 'Novo Contato',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  em_analise: {
    label: 'Em Análise',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20'
  },
  aguardando_documentos: {
    label: 'Aguardando Documentos',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  },
  proposta_enviada: {
    label: 'Proposta Enviada',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  fechado: {
    label: 'Fechado',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  nao_fechado: {
    label: 'Não Fechado',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  }
};

export const AREA_OF_LAW_CONFIG: Record<AreaOfLaw, string> = {
  trabalhista: 'Trabalhista',
  civil: 'Civil',
  familia: 'Família',
  criminal: 'Criminal',
  tributario: 'Tributário',
  empresarial: 'Empresarial',
  previdenciario: 'Previdenciário',
  consumidor: 'Consumidor',
  imobiliario: 'Imobiliário',
  outro: 'Outro'
};

export const LOG_TYPE_CONFIG: Record<string, {label: string;icon: string;}> =
{
  ligacao: { label: 'Ligação', icon: 'phone' },
  mensagem: { label: 'Mensagem', icon: 'message' },
  reuniao: { label: 'Reunião', icon: 'users' },
  observacao: { label: 'Observação', icon: 'file-text' }
};