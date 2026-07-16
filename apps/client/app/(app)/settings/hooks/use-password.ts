'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

export function usePassword() {
  const { t } = useI18n();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.auth.changePassword({ currentPassword: currentPwd, newPassword: newPwd }),
    onSuccess: () => {
      toast.success(t.settingsPasswordChanged);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mismatch = confirmPwd.length > 0 && newPwd !== confirmPwd;
  const canSubmit = currentPwd.length > 0 && newPwd.length >= 6 && newPwd === confirmPwd && !mutation.isPending;

  return {
    currentPwd,
    setCurrentPwd,
    newPwd,
    setNewPwd,
    confirmPwd,
    setConfirmPwd,
    mismatch,
    canSubmit,
    mutation,
  };
}
