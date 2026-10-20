'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { usePassword } from '../hooks/use-password';
import { SettingsInput } from './settings-input';
import { Spinner } from './spinner';

export function SecuritySection() {
  const { t, tx } = useI18n();
  const router = useRouter();
  const qc = useQueryClient();
  const { setUser } = useAppStore();
  const { currentPwd, setCurrentPwd, newPwd, setNewPwd, confirmPwd, setConfirmPwd, mismatch, canSubmit, mutation } =
    usePassword();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: api.users.deleteSelf,
    onSuccess: async () => {
      setUser(null);
      qc.clear();
      toast.success(t.accountDeleted);
      setConfirmOpen(false);
      router.push('/login');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <Card className="rounded-[20px] bg-card/75 backdrop-blur-2xl border border-white/[0.08] shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3.5 mb-6">
            <KeyRound size={22} className="text-[#ff3b30] shrink-0" strokeWidth={2} />
            <div>
              <p className="text-sm font-semibold text-foreground">{t.settingsPasswordChange}</p>
              <p className="text-xs text-muted-foreground">{t.settingsPasswordHint}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SettingsInput
              label={t.settingsPasswordCurrent}
              type="password"
              value={currentPwd}
              onChange={setCurrentPwd}
              placeholder={t.settingsPasswordCurrentPlaceholder}
            />
            <SettingsInput
              label={t.settingsPasswordNew}
              type="password"
              value={newPwd}
              onChange={setNewPwd}
              placeholder={t.settingsPasswordNewPlaceholder}
            />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.settingsPasswordConfirm}
              </Label>
              <Input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder={t.settingsPasswordConfirmPlaceholder}
                className={cn('h-8 rounded-sm bg-muted/30 border-border/60 focus:bg-background', mismatch && 'border-destructive')}
              />
              {mismatch && <p className="text-xs text-destructive">{t.settingsPasswordMismatch}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              size="sm"
              disabled={!canSubmit}
              onClick={() => mutation.mutate()}
              className="rounded-full px-5 py-2 bg-[#007aff] hover:bg-[#0069d9] text-white font-medium shadow-sm transition-all text-xs"
            >
              {mutation.isPending && <Spinner />}
              {t.settingsPasswordChange}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] bg-rose-500/[0.04] backdrop-blur-2xl border border-rose-500/20 shadow-sm overflow-hidden mt-6">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 px-6">
          <div className="flex items-center gap-3.5">
            <ShieldAlert size={22} className="text-rose-400 shrink-0" strokeWidth={2} />
            <div>
              <p className="text-sm font-semibold text-rose-300">{t.settingsDangerDelete}</p>
              <p className="text-xs text-muted-foreground">{t.accountDeleteHint}</p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-full px-5 py-2 shadow-sm w-fit font-medium text-xs"
            onClick={() => setConfirmOpen(true)}
          >
            {t.settingsDangerDelete}…
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.accountDeleteConfirmTitle}
        description={tx('accountDeleteConfirmDescription', { email: '—' })}
        confirmKey="delete"
        onConfirm={() => deleteMutation.mutate()}
        variant="destructive"
      />
    </>
  );
}
