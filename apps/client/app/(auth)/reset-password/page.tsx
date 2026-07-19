'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const mismatch = confirm.length > 0 && confirm !== password;
  const tooShort = password.length > 0 && password.length < 6;
  const canSubmit = token.length > 0 && password.length >= 6 && !mismatch;

  const mutation = useMutation({
    mutationFn: () => api.auth.resetPassword({ token, password }),
    onSuccess: () => {
      toast.success(t.resetDone);
      router.push('/login');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!token) {
    return (
      <main className="min-h-dvh w-dvw flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-[440px]">
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText />
          </div>
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <p className="text-[13px] text-muted-foreground">{t.resetInvalidToken}</p>
              <Button variant="pearl" className="mt-3" onClick={() => router.push('/login')}>
                {t.authLoginSubmit}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh w-dvw flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center mb-6">
          <Logo size="lg" showText />
        </div>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 grid place-items-center text-primary">
                <KeyRound size={16} />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">{t.resetTitle}</CardTitle>
                <CardDescription>{t.resetDescription}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit) mutation.mutate();
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label>{t.resetNewPassword}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {tooShort && (
                  <p className="text-[11px] text-destructive">{t.invitePasswordTooShort}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>{t.resetConfirm}</Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {mismatch && (
                  <p className="text-[11px] text-destructive">{t.invitePasswordMismatch}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={!canSubmit || mutation.isPending}
              >
                {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : t.resetSubmit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh w-dvw flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </main>
    }>
      <ResetInner />
    </Suspense>
  );
}
