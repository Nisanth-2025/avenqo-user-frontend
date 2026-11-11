import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOtpCountdownReturn {
  otpExpirySeconds: number;
  resendCooldown: number;
  canResend: boolean;
  isOtpExpired: boolean;
  startTimers: () => void;
  resetTimers: () => void;
}

const OTP_EXPIRY = 300;
const RESEND_COOLDOWN = 30;

export function useOtpCountdown(): UseOtpCountdownReturn {
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(OTP_EXPIRY);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearAll();
    setOtpExpirySeconds(OTP_EXPIRY);
    setResendCooldown(RESEND_COOLDOWN);

    intervalRef.current = setInterval(() => {
      setOtpExpirySeconds((prev) => {
        if (prev <= 1) {
          clearAll();
          return 0;
        }
        return prev - 1;
      });
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }, [clearAll]);

  const resetTimers = useCallback(() => {
    clearAll();
    setOtpExpirySeconds(OTP_EXPIRY);
    setResendCooldown(RESEND_COOLDOWN);
  }, [clearAll]);

  useEffect(() => clearAll, [clearAll]);

  return {
    otpExpirySeconds,
    resendCooldown,
    canResend: resendCooldown === 0 && otpExpirySeconds > 0,
    isOtpExpired: otpExpirySeconds === 0,
    startTimers,
    resetTimers,
  };
}
