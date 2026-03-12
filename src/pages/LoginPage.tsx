import React, { useState } from 'react';
import {
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  ScaleIcon } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
export function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Informe seu e-mail ou login.');
      return;
    }
    if (!password) {
      setError('Informe sua senha.');
      return;
    }
    const result = await login(email, password);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };
  return (
    <div className="min-h-screen w-full bg-dark-bg flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-blue/20 glow-blue mb-4">
            <ScaleIcon className="w-8 h-8 text-accent-blue" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Sistema Jurídico
          </h1>
          <p className="text-text-secondary mt-1">Faça login para continuar</p>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error &&
            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-red/10 border border-accent-red/30 animate-fade-in">
                <AlertCircleIcon className="w-5 h-5 text-accent-red flex-shrink-0" />
                <p className="text-sm text-accent-red">{error}</p>
              </div>
            }

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                E-mail ou Login
              </label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
                  autoComplete="username"
                  autoFocus />
                
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Senha
              </label>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
                  autoComplete="current-password" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors">
                  
                  {showPassword ?
                  <EyeOffIcon className="w-5 h-5" /> :

                  <EyeIcon className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}>
              
              {isLoading ?
              <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                  Entrando...
                </span> :

              'Entrar'
              }
            </Button>
          </form>

          {/* Hint - no passwords shown */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-text-secondary text-center">
              Utilize as credenciais fornecidas pelo administrador do sistema.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-secondary mt-6">
          © 2024 Sistema Jurídico • v1.0.0
        </p>
      </div>
    </div>);

}