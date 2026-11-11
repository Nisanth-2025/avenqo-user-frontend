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
      'border border-[#173b70] bg-[#173b70] text-white hover:bg-[#10284a] focus:ring-brand-500 shadow-[0_5px_14px_rgba(16,40,74,0.18)] active:scale-[0.98]',
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
