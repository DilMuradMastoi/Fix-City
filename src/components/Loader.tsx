import React from 'react';

export const Loader: React.FC<{ message?: string; fullScreen?: boolean }> = ({
  message = 'Loading civic data...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900/40" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-pulse">
      <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
      <div className="pt-2 flex justify-between items-center">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-20" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
      </div>
    </div>
  );
};
