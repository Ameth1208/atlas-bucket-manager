'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

export function useTeam() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { user } = useAppStore();
  const isOwner = user?.role === 'owner';

  const { data: users = [], isLoading: usersLoading } = useQuery({ queryKey: ['users'], queryFn: api.users.list });
  const { data: invites = [], isLoading: invitesLoading } = useQuery({ queryKey: ['invites'], queryFn: api.invites.list });

  const deleteMutation = useMutation({
    mutationFn: api.users.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(t.settingsTeamDeleted);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'owner' | 'admin' | 'editor' | 'viewer' }) =>
      api.users.update(id, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => api.users.resetPassword(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      navigator.clipboard.writeText(res.temporaryPassword);
      toast.success(`${t.settingsResetPasswordDone}: ${res.temporaryPassword}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    user,
    isOwner,
    users,
    invites,
    usersLoading,
    invitesLoading,
    deleteMutation,
    roleMutation,
    resetMutation,
  };
}
