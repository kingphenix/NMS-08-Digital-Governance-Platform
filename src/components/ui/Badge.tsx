import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'subtle' | 'outline' | 'amber' | 'blue' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'emerald',
  size = 'md',
  className,
  dot = false,
}: BadgeProps) {
  const base = 'inline-flex items-center rounded-full font-medium transition-colors tracking-wide';

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const variants = {
    emerald: 'bg-emerald-100/80 text-emerald-800 border border-emerald-300/50',
    subtle: 'bg-slate-100 text-slate-700 border border-slate-200/60',
    outline: 'bg-white/90 text-slate-700 border border-slate-200/90 shadow-apple-sm',
    amber: 'bg-amber-100/80 text-amber-900 border border-amber-300/50',
    blue: 'bg-sky-100/80 text-sky-900 border border-sky-300/50',
    rose: 'bg-rose-100/80 text-rose-900 border border-rose-300/50',
  };

  return (
    <span className={twMerge(clsx(base, sizes[size], variants[variant], className))}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
      )}
      {children}
    </span>
  );
}
