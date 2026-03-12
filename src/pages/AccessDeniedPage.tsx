import React from 'react';
import { ShieldXIcon, ArrowLeftIcon } from 'lucide-react';
import { Button } from '../components/Button';
interface AccessDeniedPageProps {
  onGoBack: () => void;
}
export function AccessDeniedPage({ onGoBack }: AccessDeniedPageProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent-red/20 glow-red mb-6">
          <ShieldXIcon className="w-10 h-10 text-accent-red" />
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Acesso Negado
        </h1>

        <p className="text-text-secondary mb-8">
          Você não tem permissão para acessar esta página. Entre em contato com
          o administrador se acredita que isso é um erro.
        </p>

        <div className="glass rounded-xl p-4 mb-8 border border-white/10">
          <p className="text-sm text-text-secondary">
            <strong className="text-text-primary">Código de erro:</strong> 403
            Forbidden
          </p>
        </div>

        <Button
          variant="primary"
          icon={<ArrowLeftIcon className="w-5 h-5" />}
          onClick={onGoBack}>
          
          Voltar ao Dashboard
        </Button>
      </div>
    </div>);

}