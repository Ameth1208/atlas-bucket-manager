'use client';

import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { LoginForm } from './login-form';

export function LoginView() {
  const { t } = useI18n();
  return (
    <main className="h-dvh w-dvw flex items-center justify-center bg-background">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText />
        </div>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground">{t.authLoginTitle}</CardTitle>
            <CardDescription>{t.authLoginDescription}</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <LoginForm />
            <div className="mt-5 pt-4 border-t border-border flex flex-col items-center gap-2">
              <p className="text-center text-sm text-muted-foreground">
                {t.loginFirstTime}
              </p>
              <Link
                href="/setup"
                className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-[8px] border border-border bg-muted text-[13px] font-medium hover:bg-background transition-colors"
              >
                <UserPlus size={15} /> {t.authLoginSetupCta}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
