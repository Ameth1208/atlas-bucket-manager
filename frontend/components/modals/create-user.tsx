'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLES = ['admin', 'editor', 'viewer'];

export function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });

  const createMutation = useMutation({
    mutationFn: () => api.users.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Usuario "${form.name}" creado`);
      setForm({ name: '', email: '', password: '', role: 'viewer' });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title="Invitar usuario">
      <div className="flex flex-col gap-4">
        <div className="grid gap-1.5"><Label>Nombre completo</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div className="grid gap-1.5"><Label>Correo electrónico</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        <div className="grid gap-1.5"><Label>Contraseña temporal</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>

        <div>
          <Label className="mb-2">Rol</Label>
          <div className="flex gap-2 mt-2">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setForm(f => ({ ...f, role: r }))}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all border',
                  form.role === r
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button
            className="flex-1"
            disabled={!form.name || !form.email || !form.password || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending
              ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : null}
            Crear usuario
          </Button>
        </div>
      </div>
    </Modal>
  );
}
