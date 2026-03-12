import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  glowColor: 'blue' | 'green' | 'red' | 'orange';
  trend?: 'up' | 'down';
  delay?: number;
}
const glowClasses = {
  blue: 'glow-blue border-accent-blue/30',
  green: 'glow-green border-accent-green/30',
  red: 'glow-red border-accent-red/30',
  orange: 'glow-orange border-accent-orange/30'
};
const iconBgClasses = {
  blue: 'bg-accent-blue/20 text-accent-blue',
  green: 'bg-accent-green/20 text-accent-green',
  red: 'bg-accent-red/20 text-accent-red',
  orange: 'bg-accent-orange/20 text-accent-orange'
};
export function MetricCard({
  title,
  value,
  icon,
  glowColor,
  trend,
  delay = 0
}: MetricCardProps) {
  return (
    <div
      className={`
        glass glass-hover rounded-2xl p-6
        border ${glowClasses[glowColor]}
        animate-fade-in
      `}
      style={{
        animationDelay: `${delay}ms`
      }}>
      
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgClasses[glowColor]}`}>
          {icon}
        </div>
        {trend &&
        <div
          className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-accent-green' : 'text-accent-red'}`}>
          
            {trend === 'up' ?
          <TrendingUpIcon className="w-4 h-4" /> :

          <TrendingDownIcon className="w-4 h-4" />
          }
          </div>
        }
      </div>
      <p className="text-text-secondary text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>);

}