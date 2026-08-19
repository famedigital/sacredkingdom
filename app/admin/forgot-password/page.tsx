'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, UserRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCompanyBrand } from '@/hooks/use-company-brand';
import { BrandLogo } from '@/components/BrandLogo';
import { AdminTheme } from '@/components/admin/AdminTheme';

type Mode = 'password' | 'username';

export default function ForgotPasswordPage() {
  const brand = useCompanyBrand();
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devHint, setDevHint] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevHint(null);
    setLoading(true);

    try {
      if (mode === 'password') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Request failed');
          return;
        }
        setSuccess(data.message || 'Check your email for reset instructions.');
        if (data.resetUrl) setDevHint(data.resetUrl);
      } else {
        const res = await fetch('/api/auth/forgot-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Request failed');
          return;
        }
        setSuccess(data.message || 'Check your email for your login address.');
        if (data.loginEmail) {
          setDevHint(`Login email: ${data.loginEmail}`);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wash-paper flex min-h-screen items-center justify-center p-4">
      <AdminTheme />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <BrandLogo height={64} className="mx-auto mb-4 h-16" />
          <h1 className="font-heading text-2xl font-semibold text-foreground">Account recovery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reset your password or recover your login email
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('password');
                  setError('');
                  setSuccess('');
                  setDevHint(null);
                }}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  mode === 'password'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Forgot password
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('username');
                  setError('');
                  setSuccess('');
                  setDevHint(null);
                }}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  mode === 'username'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Forgot login email
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-700" />
                <div className="min-w-0 space-y-2">
                  <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
                  {devHint && (
                    <p className="break-all text-xs text-muted-foreground">
                      Dev only: {devHint}
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'password' ? (
                <div className="grid gap-2">
                  <Label htmlFor="email">Admin email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@sacredkingdom.travel"
                      className="pl-8"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll email a one-hour link to set a new password.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="identifier">Your name or email</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Registered name or email"
                      className="pl-8"
                      required
                      autoComplete="username"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Admin login uses your email address. If we find your account, we email that
                    address to you.
                  </p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : mode === 'password' ? (
                  'Send reset link'
                ) : (
                  'Email my login'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
