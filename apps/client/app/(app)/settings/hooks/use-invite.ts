'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { User } from '@/lib/api';

export function useInvite() {
  const qc = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<{ email: string; role: User['role'] }>({
    email: '',
    role: 'viewer',
  });
  const [inviteResult, setInviteResult] = useState<{ url: string; token: string } | null>(null);

  const createInviteMutation = useMutation({
    mutationFn: () => api.invites.create({ email: inviteForm.email || undefined, role: inviteForm.role }),
    onSuccess: (res) => {
      setInviteResult({ url: res.url, token: res.invite.token });
      qc.invalidateQueries({ queryKey: ['invites'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeInviteMutation = useMutation({
    mutationFn: api.invites.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invites'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    inviteOpen,
    setInviteOpen,
    inviteForm,
    setInviteForm,
    inviteResult,
    setInviteResult,
    createInviteMutation,
    revokeInviteMutation,
  };
}
