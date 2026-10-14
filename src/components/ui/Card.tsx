import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'emerald' | 'subtle' | 'outline';
  hoverEffect?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Card({
  variant = 'glass',
  hoverEffect = false,
  children,
  className,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-3xl transition-all duration-300 overflow-hidden';
  
  const variants = {
    glass: 'glass-card text-slate-900',
    emerald: 'glass-emerald shadow-apple-glow',
    subtle: 'bg-slate-50/80 backdrop-blur-md border border-slate-200/60 text-slate-900',
    outline: 'bg-white border border-slate-200/80 shadow-apple-sm text-slate-900',
  };

  const hoverStyles = hoverEffect ? 'glass-card-hover cursor-pointer' : '';

  return (
    <div
      className={twMerge(clsx(baseStyles, variants[variant], hoverStyles, className))}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge(clsx('p-6 pb-3 flex items-center justify-between border-b border-emerald-900/5', className))}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={twMerge(clsx('text-lg font-semibold tracking-tight text-slate-900', className))}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={twMerge(clsx('text-xs text-slate-500 font-medium leading-relaxed', className))}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge(clsx('p-6', className))}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge(clsx('p-6 pt-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between', className))}>{children}</div>;
}
