import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const isBusy = isLoading || loading;

  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'relative overflow-hidden border border-white/15 bg-gradient-to-b from-neutral-600 via-neutral-900 to-black text-white hover:from-neutral-500 hover:via-neutral-800 hover:to-neutral-950 focus:ring-brand-500 shadow-[0_5px_14px_rgba(0,0,0,0.24)] active:scale-[0.98] before:absolute before:inset-x-3 before:top-0 before:h-1/2 before:rounded-full before:bg-white/10 before:blur-sm',
    secondary:
      'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-brand-500 shadow-input',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={twMerge(
        clsx(base, variants[variant], sizes[size], fullWidth && 'w-full'),
        className,
      )}
      disabled={disabled || isBusy}
      {...props}
    >
      {isBusy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
