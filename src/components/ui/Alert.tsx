import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'error' | 'info';
  variant?: 'success' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  variant,
  message,
  onDismiss,
  onClose,
}) => {
  const alertType = type || variant || 'info';
  const dismissFn = onDismiss || onClose;

  const styles = {
    success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', Icon: CheckCircle2 },
    error: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', Icon: AlertCircle },
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', Icon: Info },
  };

  const { bg, text, Icon } = styles[alertType];

  return (
    <div className={clsx('flex items-start gap-3 rounded-xl border px-4 py-3 animate-slide-up', bg)}>
      <Icon className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', text)} />
      <p className={clsx('flex-1 text-sm font-medium', text)}>{message}</p>
      {dismissFn && (
        <button onClick={dismissFn} className={clsx('flex-shrink-0 p-0.5 rounded-lg hover:bg-black/5', text)}>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
