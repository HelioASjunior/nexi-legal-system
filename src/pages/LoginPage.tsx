import React, { useState } from 'react';
import {
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/Button';
import nexilogo from '../../assets/images/nexilogo.png';
import backgroundnexis from '../../assets/images/backgroundnexis.png';
import flagBr from '../../assets/images/flag-br.svg';
import flagUs from '../../assets/images/flag-us.svg';
export function LoginPage() {
  const { login, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError(t('auth.login.emailRequired'));
      return;
    }
    if (!password) {
      setError(t('auth.login.passwordRequired'));
      return;
    }
    const result = await login(email, password);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };
  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundnexis})` }}
    >
      <div className="absolute inset-0 bg-black/55" />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage('pt')}
              className={`flex items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition-all ${language === 'pt' ? 'border-white/40 bg-white/15 text-white' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}
              aria-label={t('sidebar.language.pt')}>
              <img src={flagBr} alt="Brasil" className="h-4 w-4 rounded-sm object-cover" />
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`flex items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition-all ${language === 'en' ? 'border-white/40 bg-white/15 text-white' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}
              aria-label={t('sidebar.language.en')}>
              <img src={flagUs} alt="United States" className="h-4 w-4 rounded-sm object-cover" />
            </button>
          </div>
          <img
            src={nexilogo}
            alt="Nexi Logo"
            className="mx-auto mb-4 block w-30 h-30 object-contain"
          />
          <h1 className="login-hero-title text-2xl font-bold">
            {t('auth.login.title')}
          </h1>
          <p className="login-hero-subtitle mt-1">{t('auth.login.subtitle')}</p>
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
                {t('auth.login.emailLabel')}
              </label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.login.emailPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
                  autoComplete="username"
                  autoFocus />
                
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                {t('auth.login.passwordLabel')}
              </label>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.login.passwordPlaceholder')}
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
                  {t('auth.login.submitting')}
                </span> :

              t('auth.login.submit')
              }
            </Button>
          </form>

          {/* Hint - no passwords shown */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-text-secondary text-center">
              {t('auth.login.hint')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-secondary mt-6">
          {t('auth.login.footer')}
        </p>
      </div>
    </div>);

}