import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, KeyRound, Laptop, ShieldCheck } from 'lucide-react';
import { UserNavbar } from '../components/navigation/UserNavbar';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authService } from '../features/auth/services/authService';
import { useAuth } from '../features/auth/hooks/useAuth';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S{8,72}$/;

export const AccountSecurityPage: React.FC = () => {
  const [passwordMode, setPasswordMode] = useState<'set' | 'change'>('set');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const sessionsQuery = useQuery({
    queryKey: ['account-sessions', page],
    queryFn: () => authService.listSessions(page, 10),
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: number) => authService.revokeSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account-sessions'] }),
  });

  const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (!passwordPattern.test(newPassword)) {
      setNotice({ type: 'error', message: 'Use 8–72 characters with uppercase and lowercase letters, a number, and a special character. Spaces are not allowed.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: 'error', message: 'The password confirmation does not match.' });
      return;
    }

    try {
      const payload = { newPassword, confirmPassword };
      if (passwordMode === 'set') {
        await authService.setPassword(payload);
        setNotice({ type: 'success', message: 'Password set. You can now sign in with either your email code or password.' });
      } else {
        await authService.changePassword(payload);
        logout();
        navigate('/auth', { replace: true, state: { message: 'Password changed. Sign in again with your new password.' } });
      }
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Unable to update your password.' });
    }
  };

  const sessionError = sessionsQuery.error instanceof Error ? sessionsQuery.error.message : 'Unable to load sessions.';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserNavbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-28 pt-8 sm:px-6 sm:pb-8">
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/profile" className="flex items-center gap-1 hover:text-brand-600">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">Security</span>
        </div>

        {notice && <div className="mb-5"><Alert variant={notice.type} message={notice.message} onClose={() => setNotice(null)} /></div>}

        <section className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="password-heading">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><KeyRound className="size-5" /></div>
            <div>
              <h1 id="password-heading" className="text-lg font-bold text-gray-900">Password</h1>
              <p className="text-sm text-gray-500">Set or change the password for your account.</p>
            </div>
          </div>
          <div className="mb-5 flex gap-2" role="group" aria-label="Password action">
            <Button type="button" variant={passwordMode === 'set' ? 'primary' : 'secondary'} size="sm" onClick={() => setPasswordMode('set')}>Set password</Button>
            <Button type="button" variant={passwordMode === 'change' ? 'primary' : 'secondary'} size="sm" onClick={() => setPasswordMode('change')}>Change password</Button>
          </div>
          <form onSubmit={submitPassword} className="max-w-xl space-y-4">
            <Input label="New password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            <p className="text-xs text-gray-500">8–72 characters, uppercase and lowercase letters, a number, and a special character. No spaces.</p>
            <Button type="submit" disabled={revokeSessionMutation.isPending}>
              {passwordMode === 'set' ? 'Set password' : 'Change password'}
            </Button>
          </form>
          {passwordMode === 'change' && <p className="mt-4 text-xs text-amber-700">Changing your password revokes all refresh sessions. You will be signed out and must sign in again.</p>}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="sessions-heading">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><ShieldCheck className="size-5" /></div>
            <div>
              <h2 id="sessions-heading" className="text-lg font-bold text-gray-900">Sessions</h2>
              <p className="text-sm text-gray-500">Review and revoke sessions for this account.</p>
            </div>
          </div>
          <p className="mb-5 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">The API does not identify which session is this device. Revoking a session prevents refresh; an existing access token may remain valid until it expires.</p>

          {sessionsQuery.isPending ? (
            <p className="py-6 text-sm text-gray-500" role="status">Loading sessions…</p>
          ) : sessionsQuery.isError ? (
            <div className="py-4"><p className="mb-3 text-sm text-red-700">{sessionError}</p><Button variant="secondary" size="sm" onClick={() => void sessionsQuery.refetch()}>Try again</Button></div>
          ) : sessionsQuery.data.content.length === 0 ? (
            <p className="py-6 text-sm text-gray-500">No sessions found.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sessionsQuery.data.content.map((session) => {
                const expired = new Date(session.expiresAt).getTime() <= Date.now();
                const revoked = Boolean(session.revokedAt);
                return (
                  <li key={session.sessionId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <Laptop className="mt-1 size-4 shrink-0 text-gray-400" />
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-gray-900">{session.deviceInfo || 'Unknown device'}</p>
                        <p className="mt-1 text-xs text-gray-500">Started {new Date(session.createdAt).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Expires {new Date(session.expiresAt).toLocaleString()}</p>
                        {session.revokedAt && <p className="text-xs text-gray-500">Revoked {new Date(session.revokedAt).toLocaleString()}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:justify-end">
                      <span className={`text-xs font-medium ${revoked ? 'text-gray-500' : expired ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {revoked ? 'Revoked' : expired ? 'Expired' : 'Active'}
                      </span>
                      {!revoked && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={revokeSessionMutation.isPending}
                          onClick={() => revokeSessionMutation.mutate(session.sessionId, {
                            onError: (error) => setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Unable to revoke session.' }),
                            onSuccess: () => setNotice({ type: 'success', message: 'Session revoked.' }),
                          })}
                        >Revoke</Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {sessionsQuery.data && sessionsQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous</Button>
              <span className="text-xs text-gray-500">Page {sessionsQuery.data.pageNumber + 1} of {sessionsQuery.data.totalPages}</span>
              <Button variant="secondary" size="sm" disabled={sessionsQuery.data.lastPage} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AccountSecurityPage;
