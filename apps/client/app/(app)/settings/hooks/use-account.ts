'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import type { User } from '@/lib/api';

export function useAccount() {
  const { t } = useI18n();
  const { user, setUser } = useAppStore();
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || user?.email || 'user');
  const [notifications, setNotifications] = useState({ email: true, activity: false, digest: false });

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Pick<User, 'name' | 'avatarSeed'>>) => api.users.update(user!.id, body),
    onSuccess: async (updated) => {
      setUser(updated);
      await qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(t.settingsProfileUpdated);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dirty = name !== user?.name || avatarSeed !== (user?.avatarSeed || user?.email || 'user');

  return {
    user,
    name,
    setName,
    avatarSeed,
    setAvatarSeed,
    notifications,
    setNotifications,
    theme,
    setTheme,
    updateMutation,
    dirty,
  };
}
