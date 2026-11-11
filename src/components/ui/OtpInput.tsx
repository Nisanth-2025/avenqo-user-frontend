import React, { useRef, useCallback } from 'react';
import { clsx } from 'clsx';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  error = false,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const focusInput = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, length - 1));
      inputRefs.current[clamped]?.focus();
    },
    [length],
  );

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (!/^\d?$/.test(char)) return;
      const arr = digits.slice();
      arr[index] = char;
      const next = arr.join('');
      onChange(next.replace(/[^\d]/g, ''));
      if (char && index < length - 1) focusInput(index + 1);
    },
    [digits, onChange, length, focusInput],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        focusInput(index - 1);
      } else if (e.key === 'ArrowLeft' && index > 0) {
        focusInput(index - 1);
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        focusInput(index + 1);
      }
    },
    [digits, focusInput, length],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (pasted) {
        onChange(pasted);
        focusInput(Math.min(pasted.length, length - 1));
      }
    },
    [onChange, length, focusInput],
  );

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={clsx(
            'h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 text-center text-lg font-semibold',
            'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-gray-50 disabled:text-gray-400',
            error
              ? 'border-red-300 text-red-600 focus:border-red-400 focus:ring-red-100'
              : digit
                ? 'border-brand-400 text-brand-700 bg-brand-50/50 focus:ring-brand-200'
                : 'border-gray-200 text-gray-900 focus:border-brand-400 focus:ring-brand-100',
          )}
        />
      ))}
    </div>
  );
};
