'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { User } from '@/lib/api';

const ROLES: User['role'][] = ['admin', 'editor', 'viewer'];

const close = () => useAppStore.getState().setCreateUserOpen(false);

export function CreateUserModal() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const open = useAppStore(s => s.createUserOpen);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' as User['role'] });

  const createMutation = useMutation({
    mutationFn: () => api.users.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(t.settingsTeamInvite);
      setForm({ name: '', email: '', password: '', role: 'viewer' });
      close();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleLabel = (role: User['role']) => {
    switch (role) {
      case 'owner': return t.settingsRoleOwner;
      case 'admin': return t.settingsRoleAdmin;
      case 'editor': return t.settingsRoleEditor;
      case 'viewer': return t.settingsRoleViewer;
      default: return role;
    }
  };

  return (
    <Modal open={open} onClose={close} title={t.settingsTeamInvite}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label>{t.settingsProfileName}</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="grid gap-1.5">
          <Label>{t.settingsProfileEmail}</Label>
          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="grid gap-1.5">
          <Label>{t.settingsPasswordNew}</Label>
          <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>

        <div>
          <Label className="mb-2">{t.settingsTeamRole}</Label>
          <div className="flex gap-2 mt-2">
            {ROLES.map(r => (
              <button
                type="button"
                key={r}
                onClick={() => setForm(f => ({ ...f, role: r }))}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all border',
                  form.role === r
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                {roleLabel(r)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={close}>{t.cancel}</Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!form.name || !form.email || !form.password || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending
              ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : null}
            {t.settingsTeamInvite}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
