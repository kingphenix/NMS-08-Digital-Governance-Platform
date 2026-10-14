import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'emerald' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = 'emerald',
  size = 'md',
  icon,
  children,
  className,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5 font-semibold',
  };

  const variants = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-apple-glow shadow-emerald-600/20 border border-emerald-500/30',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-apple-sm',
    outline: 'bg-white/80 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-apple-sm',
    ghost: 'text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-800',
    glass: 'glass-panel hover:bg-white text-slate-800 border border-white/60 shadow-apple-sm',
  };

  return (
    <button
      className={twMerge(clsx(base, sizes[size], variants[variant], className))}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
