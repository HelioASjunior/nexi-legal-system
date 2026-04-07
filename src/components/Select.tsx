import { forwardRef, type SelectHTMLAttributes } from 'react';
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: {
    value: string;
    label: string;
  }[];
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        }
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl
            glass border border-white/10
            text-text-primary bg-transparent
            focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30
            transition-all duration-200
            cursor-pointer
            ${className}
          `}
          {...props}>
          
          {options.map((option) =>
          <option
            key={option.value}
            value={option.value}
            className="bg-dark-surface text-text-primary">
            
              {option.label}
            </option>
          )}
        </select>
      </div>);

  }
);
Select.displayName = 'Select';