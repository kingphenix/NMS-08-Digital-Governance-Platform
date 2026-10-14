import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  color?: 'emerald' | 'amber' | 'blue' | 'purple';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  showPercentage = true,
  color = 'emerald',
  height = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-400',
    blue: 'bg-gradient-to-r from-sky-500 to-indigo-500',
    purple: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
  };

  return (
    <div className={twMerge(clsx('w-full space-y-1.5', className))}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {label ? <span className="text-slate-700 font-semibold">{label}</span> : <span />}
          {showPercentage && (
            <span className="text-emerald-700 font-bold tracking-tight">{percentage}%</span>
          )}
        </div>
      )}
      <div className={twMerge(clsx('w-full rounded-full bg-emerald-950/10 overflow-hidden p-0.5 border border-emerald-900/5', heights[height]))}>
        <div
          className={twMerge(clsx('h-full rounded-full transition-all duration-700 ease-out shadow-sm', colors[color]))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {sublabel && (
        <p className="text-[11px] text-slate-500 font-normal">{sublabel}</p>
      )}
    </div>
  );
}
