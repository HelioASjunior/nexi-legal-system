import React from 'react';
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}
const variantClasses = {
  primary:
  'bg-accent-blue/20 text-accent-blue border-accent-blue/30 hover:bg-accent-blue/30 glow-blue',
  secondary: 'glass text-text-primary hover:bg-white/10',
  danger:
  'bg-accent-red/20 text-accent-red border-accent-red/30 hover:bg-accent-red/30',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5'
};
const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2'
};
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl
        border border-white/10 transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}>
      
      {icon}
      {children}
    </button>);

}