import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { OtpInput } from '../components/ui/OtpInput';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useOtpCountdown } from '../features/auth/hooks/useOtpCountdown';
import { authService } from '../features/auth/services/authService';
import { ApiClientError } from '../api/client';
import type { AuthMode, AuthStep } from '../types/auth.types';

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

type EmailForm = z.infer<typeof emailSchema>;

/* ─────────────── Animated background blobs ─────────────── */
const BackgroundDecor: React.FC = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50" />

    {/* Animated gradient mesh blobs */}
    <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand-200/40 to-purple-200/30 blur-3xl animate-float" />
    <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-100/40 to-brand-100/30 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-brand-100/20 to-fuchsia-100/20 blur-3xl animate-pulse-slow" />

    {/* Subtle dot pattern overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: 'radial-gradient(circle, #7c3aed 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  </div>
);

/* ─────────────── Main Auth Page ─────────────── */
const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const { otpExpirySeconds, resendCooldown, canResend, isOtpExpired, startTimers, resetTimers } =
    useOtpCountdown();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });

  /* ── mode switch ── */
  const switchMode = useCallback(
    (newMode: AuthMode) => {
      setMode(newMode);
      setStep('email');
      setOtp('');
      setAlert(null);
      resetForm();
      resetTimers();
    },
    [resetForm, resetTimers],
  );

  /* ── back to email ── */
  const backToEmail = useCallback(() => {
    setStep('email');
    setOtp('');
    setAlert(null);
    resetTimers();
  }, [resetTimers]);

  /* ── submit email (request OTP) ── */
  const onEmailSubmit = useCallback(
    async (data: EmailForm) => {
      setIsSubmitting(true);
      setAlert(null);
      try {
        if (mode === 'signup') {
          await authService.signUp({ email: data.email });
        } else {
          await authService.signIn({ email: data.email });
        }
        setEmail(data.email);
        setStep('otp');
        startTimers();
        setAlert({ type: 'info', message: `Verification code sent to ${data.email}` });
      } catch (err) {
        const msg = err instanceof ApiClientError ? err.message : 'Something went wrong';
        setAlert({ type: 'error', message: msg });
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, startTimers],
  );

  /* ── verify OTP ── */
  const onVerifyOtp = useCallback(async () => {
    if (otp.length !== 6) return;
    setIsSubmitting(true);
    setAlert(null);
    try {
      if (mode === 'signup') {
        await authService.verifySignUpOtp({ email, otp });
        setAlert({ type: 'success', message: 'Account created! Sign in to continue.' });
        setStep('email');
        setMode('signin');
        setOtp('');
        resetTimers();
        resetForm();
      } else {
        const tokens = await authService.verifySignInOtp({ email, otp });
        loginWithTokens(tokens);
        navigate('/home', { replace: true });
      }
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Verification failed';
      setAlert({ type: 'error', message: msg });
      setOtp('');
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, mode, email, loginWithTokens, navigate, resetTimers, resetForm]);

  /* ── resend OTP ── */
  const onResend = useCallback(async () => {
    setIsSubmitting(true);
    setAlert(null);
    try {
      if (mode === 'signup') {
        await authService.signUp({ email });
      } else {
        await authService.signIn({ email });
      }
      startTimers();
      setOtp('');
      setAlert({ type: 'info', message: 'A new code has been sent to your email' });
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to resend';
      setAlert({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, email, startTimers]);

  /* ── helpers ── */
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const isSignin = mode === 'signin';

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <BackgroundDecor />

      <div className="w-full max-w-md animate-fade-in">
        {/* ── Logo ── */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-lg shadow-brand-500/25 mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Avenquo</h1>
          <p className="mt-1 text-sm text-gray-500">Your marketplace, simplified</p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-glass p-6 sm:p-8">
          {step === 'email' ? (
            /* ═══════════ EMAIL STEP ═══════════ */
            <div className="animate-slide-up" key={`email-${mode}`}>
              {/* Tab switcher */}
              <div className="flex rounded-xl bg-gray-100/80 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                    isSignin
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                    !isSignin
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Create account
                </button>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {isSignin ? 'Welcome back' : 'Get started'}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {isSignin
                  ? 'Enter your email to receive a sign-in code'
                  : 'Enter your email to create an account'}
              </p>

              {alert && (
                <div className="mb-5">
                  <Alert type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
                </div>
              )}

              <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
                  <Mail className="h-4 w-4" />
                  {isSignin ? 'Send sign-in code' : 'Send verification code'}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-400">
                By continuing, you agree to our{' '}
                <span className="text-brand-600 hover:underline cursor-pointer">Terms</span> &{' '}
                <span className="text-brand-600 hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          ) : (
            /* ═══════════ OTP STEP ═══════════ */
            <div className="animate-slide-up" key="otp">
              <button
                type="button"
                onClick={backToEmail}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex items-center gap-2.5 mb-1">
                <ShieldCheck className="h-5 w-5 text-brand-600" />
                <h2 className="text-xl font-semibold text-gray-900">Verify your email</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Enter the 6-digit code sent to{' '}
                <span className="font-medium text-gray-700">{email}</span>
              </p>

              {alert && (
                <div className="mb-5">
                  <Alert type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
                </div>
              )}

              <div className="space-y-6">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  error={isOtpExpired}
                  disabled={isOtpExpired || isSubmitting}
                />

                {/* Timer & resend */}
                <div className="text-center">
                  {isOtpExpired ? (
                    <p className="text-sm text-red-500 font-medium">Code expired</p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Code expires in{' '}
                      <span className="font-mono font-medium text-gray-600">{fmtTime(otpExpirySeconds)}</span>
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={otp.length !== 6 || isOtpExpired}
                  onClick={onVerifyOtp}
                >
                  {mode === 'signup' ? 'Create account' : 'Sign in'}
                </Button>

                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={onResend}
                      disabled={isSubmitting}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Resend code
                    </button>
                  ) : !isOtpExpired ? (
                    <p className="text-xs text-gray-400">
                      Resend available in{' '}
                      <span className="font-mono">{resendCooldown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={onResend}
                      disabled={isSubmitting}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Send a new code
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Avenquo · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
