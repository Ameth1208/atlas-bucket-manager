'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

function AcceptInviteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const { t } = useI18n();
  const setUser = useAppStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const validateQuery = useQuery({
    queryKey: ['invite-validate', token],
    queryFn: () => api.invites.validate(token),
    enabled: !!token,
    retry: false,
  });

  const invite = validateQuery.data;
  const validating = validateQuery.isLoading;
  const seededEmail = invite?.email && email === '' ? invite.email : email;

  const mismatch = confirm.length > 0 && confirm !== password;
  const tooShort = password.length > 0 && password.length < 8;
  const canSubmit =
    invite?.valid && name.trim().length > 0 && seededEmail.trim().length > 0 && password.length >= 8 && !mismatch;

  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    if (!canSubmit) return;
    setAccepting(true);
    try {
      const user = await api.invites.accept(token, { name, email: seededEmail, password });
      setUser(user);
      toast.success(t.inviteAccepted);
      router.push('/dashboard');
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.toLowerCase().includes('used')) {
        toast.error(t.inviteAlreadyUsed);
      } else {
        toast.error(msg);
      }
    } finally {
      setAccepting(false);
    }
  };

  return (
    <main className="min-h-dvh w-dvw flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center mb-6">
          <Logo size="lg" showText />
        </div>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground">{t.inviteTitle}</CardTitle>
            <CardDescription>
              {validating
                ? t.inviteValidating
                : !token
                ? t.inviteInvalid
                : invite?.valid
                ? `${t.inviteRole}: ${invite.role}`
                : t.inviteInvalid}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {validating ? (
              <div className="py-10 flex justify-center">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : !token || (invite && !invite.valid) ? (
              <div className="py-6 text-center space-y-3">
                <XCircle size={32} className="mx-auto text-destructive" />
                <p className="text-[13px] text-muted-foreground">{t.inviteInvalid}</p>
                <Button variant="pearl" onClick={() => router.push('/login')}>
                  {t.authLoginSubmit}
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAccept();
                }}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <Label>{t.inviteName}</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.inviteNamePh}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.inviteEmail}</Label>
                  <Input
                    type="email"
                    value={seededEmail}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.inviteEmailPh}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.invitePassword}</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.invitePasswordPh}
                    autoComplete="new-password"
                    required
                  />
                  {tooShort && (
                    <p className="text-[11px] text-destructive">{t.invitePasswordTooShort}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>{t.inviteConfirm}</Label>
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder={t.inviteConfirmPh}
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
                  disabled={!canSubmit || accepting}
                >
                  {accepting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      {t.inviteSubmit}
                      <ArrowRight size={14} className="ml-1" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh w-dvw flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </main>
    }>
      <AcceptInviteInner />
    </Suspense>
  );
}
