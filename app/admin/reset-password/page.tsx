'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useCompanyBrand } from '@/hooks/use-company-brand';
import { BrandLogo } from '@/components/BrandLogo';

function ResetPasswordForm() {
  const brand = useCompanyBrand();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setChecking(false);
        setValid(false);
        setError('Missing reset token. Request a new link from the forgot password page.');
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.valid) {
          setValid(true);
          setEmail(data.email || '');
        } else {
          setValid(false);
          setError(data.error || 'Invalid or expired reset link');
        }
      } catch {
        if (!cancelled) {
          setValid(false);
          setError('Could not verify reset link');
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not update password');
        return;
      }
      setSuccess(data.message || 'Password updated');
      setTimeout(() => router.push('/admin/login'), 1500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wash-paper flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <BrandLogo height={64} className="mx-auto mb-4 h-16" />
          <h1 className="font-heading text-2xl font-semibold text-foreground">Set new password</h1>
          {email ? (
            <p className="mt-1 text-sm text-muted-foreground">Account: {email}</p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Choose a new admin password</p>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            {checking ? (
              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Verifying link…
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-700" />
                    <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
                  </div>
                )}

                {valid && !success ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-2">
                      <Label htmlFor="password">New password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-8 pr-10"
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="confirm">Confirm password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="confirm"
                          type={showPassword ? 'text' : 'password'}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          className="pl-8"
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        'Update password'
                      )}
                    </Button>
                  </form>
                ) : null}

                {!valid && (
                  <div className="text-center">
                    <Link
                      href="/admin/forgot-password"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Link
                    href="/admin/login"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
