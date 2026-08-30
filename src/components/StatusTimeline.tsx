import React from 'react';
import { IssueStatus, StatusHistoryItem } from '../types';
import { CheckCircle2, Clock, Wrench, AlertCircle } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: IssueStatus;
  history?: StatusHistoryItem[];
  createdAt: string;
}

const STEPS: { status: IssueStatus; label: string; icon: React.ElementType; desc: string }[] = [
  {
    status: 'Reported',
    label: 'Reported',
    icon: AlertCircle,
    desc: 'Citizen logged issue with details & geolocation',
  },
  {
    status: 'Under Review',
    label: 'Under Review',
    icon: Clock,
    desc: 'City dispatch assessing severity & jurisdiction',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    icon: Wrench,
    desc: 'Municipal repair crew deployed on-site',
  },
  {
    status: 'Resolved',
    label: 'Resolved',
    icon: CheckCircle2,
    desc: 'Fix verified and work order closed',
  },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus, history = [], createdAt }) => {
  const getStepIndex = (status: IssueStatus): number => {
    return STEPS.findIndex((s) => s.status === status);
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full py-4">
      {/* Horizontal Steps on Desktop */}
      <div className="hidden sm:grid grid-cols-4 gap-2 relative">
        {/* Continuous track line behind nodes */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
        <div
          className="absolute top-5 left-8 h-1 bg-blue-600 dark:bg-blue-500 transition-all duration-700 ease-out -z-0"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (STEPS.length - 1)) * 100))}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          // Find history entry if available
          const historyEntry = history.find((h) => h.status === step.status);

          return (
            <div key={step.status} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/20 shadow-lg scale-110'
                    : isPassed
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2.5 text-xs font-semibold ${
                  isCurrent
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : isPassed
                    ? 'text-slate-900 dark:text-slate-200'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[140px] mt-0.5 line-clamp-2">
                {step.desc}
              </span>
              {historyEntry && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                  {new Date(historyEntry.changedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Vertical Steps on Mobile */}
      <div className="sm:hidden space-y-4 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
        {STEPS.map((step, idx) => {
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;
          const historyEntry = history.find((h) => h.status === step.status);

          return (
            <div key={step.status} className="relative">
              <div
                className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/20'
                    : isPassed
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              <div className="pl-2">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-blue-600 dark:text-blue-400'
                        : isPassed
                        ? 'text-slate-900 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {historyEntry && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(historyEntry.changedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
                {historyEntry?.note && (
                  <p className="text-xs italic bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg mt-1.5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                    "{historyEntry.note}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
