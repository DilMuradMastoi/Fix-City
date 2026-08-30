import React from 'react';
import { IssueStatus } from '../types';
import { CheckCircle2, Clock, Wrench, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const getStyles = () => {
    switch (status) {
      case 'Reported':
        return {
          bg: 'bg-blue-500/15 dark:bg-blue-500/20',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-500/30 dark:border-blue-500/40',
          icon: AlertCircle,
          dot: 'bg-blue-500',
        };
      case 'Under Review':
        return {
          bg: 'bg-amber-500/15 dark:bg-amber-500/20',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-500/30 dark:border-amber-500/40',
          icon: Clock,
          dot: 'bg-amber-500',
        };
      case 'In Progress':
        return {
          bg: 'bg-purple-500/15 dark:bg-purple-500/20',
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-500/30 dark:border-purple-500/40',
          icon: Wrench,
          dot: 'bg-purple-500 animate-pulse',
        };
      case 'Resolved':
        return {
          bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-500/30 dark:border-emerald-500/40',
          icon: CheckCircle2,
          dot: 'bg-emerald-500',
        };
      default:
        return {
          bg: 'bg-slate-500/15 dark:bg-slate-500/20',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-500/30',
          icon: AlertCircle,
          dot: 'bg-slate-500',
        };
    }
  };

  const { bg, text, border, icon: Icon, dot } = getStyles();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${bg} ${text} ${border} ${sizeClasses[size]} whitespace-nowrap shadow-xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{status}</span>
    </span>
  );
};
