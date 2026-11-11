import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'brand' | 'green' | 'amber' | 'blue' | 'red';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  className,
  dot = false,
}) => {
  const variants = {
    gray:  'bg-gray-100 text-gray-700 border-gray-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    green: 'bg-gradient-to-b from-neutral-600 via-neutral-900 to-black text-white border-white/20 shadow-[0_3px_10px_rgba(0,0,0,0.16)]',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    red:   'bg-red-50 text-red-700 border-red-200',
  };

  const dotColors = {
    gray:  'bg-gray-400',
    brand: 'bg-brand-500',
    green: 'bg-white/80',
    amber: 'bg-amber-500',
    blue:  'bg-blue-500',
    red:   'bg-red-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
