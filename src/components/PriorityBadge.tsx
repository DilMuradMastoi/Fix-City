import React from 'react';
import { IssuePriority } from '../types';
import { Flame, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface PriorityBadgeProps {
  priority: IssuePriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const getStyles = () => {
    switch (priority) {
      case 'Critical':
        return {
          bg: 'bg-rose-500/15 dark:bg-rose-500/20',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-500/30 dark:border-rose-500/40',
          icon: ShieldAlert,
        };
      case 'High':
        return {
          bg: 'bg-orange-500/15 dark:bg-orange-500/20',
          text: 'text-orange-700 dark:text-orange-300',
          border: 'border-orange-500/30 dark:border-orange-500/40',
          icon: Flame,
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/15 dark:bg-amber-500/20',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-500/30 dark:border-amber-500/40',
          icon: AlertTriangle,
        };
      case 'Low':
        return {
          bg: 'bg-slate-500/15 dark:bg-slate-500/20',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-500/30',
          icon: Info,
        };
      default:
        return {
          bg: 'bg-slate-500/15',
          text: 'text-slate-700',
          border: 'border-slate-400',
          icon: Info,
        };
    }
  };

  const { bg, text, border, icon: Icon } = getStyles();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${bg} ${text} ${border} ${sizeClasses[size]} whitespace-nowrap`}
    >
      <Icon className="w-3 h-3" />
      <span>{priority} Priority</span>
    </span>
  );
};
