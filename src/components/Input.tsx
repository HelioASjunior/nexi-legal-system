import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        }
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl
            glass border border-white/10
            text-text-primary placeholder-text-secondary/50
            focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30
            transition-all duration-200
            ${error ? 'border-accent-red/50' : ''}
            ${className}
          `}
          {...props} />
        
        {error && <p className="mt-1 text-sm text-accent-red">{error}</p>}
      </div>);

  }
);

Input.displayName = 'Input';