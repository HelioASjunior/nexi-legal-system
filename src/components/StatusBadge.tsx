import React from 'react';
import { StatusType } from '../types';
interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}
const statusConfig = {
  pago: {
    label: 'Pago',
    classes: 'bg-accent-green/20 text-accent-green border-accent-green/30'
  },
  pendente: {
    label: 'Pendente',
    classes: 'bg-accent-orange/20 text-accent-orange border-accent-orange/30'
  },
  atrasado: {
    label: 'Atrasado',
    classes: 'bg-accent-red/20 text-accent-red border-accent-red/30'
  }
};
export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses =
  size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${config.classes}
        ${sizeClasses}
      `}>
      
      {config.label}
    </span>);

}