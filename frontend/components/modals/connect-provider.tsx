'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useProviders } from '@/hooks/use-providers';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Kind = 'minio' | 'aws' | 'r2' | 'spaces' | 'wasabi';

const PROVIDERS: { id: Kind; name: string; endpoint: string; port: number; ssl: boolean }[] = [
  { id: 'minio', name: 'MinIO',               endpoint: '',                    port: 9000, ssl: false },
  { id: 'aws',   name: 'AWS S3',              endpoint: 's3.amazonaws.com',    port: 443,  ssl: true  },
  { id: 'r2',    name: 'Cloudflare R2',       endpoint: '',                    port: 443,  ssl: true  },
  { id: 'spaces',name: 'DigitalOcean Spaces', endpoint: '',                    port: 443,  ssl: true  },
  { id: 'wasabi',name: 'Wasabi',              endpoint: 's3.wasabisys.com',    port: 443,  ssl: true  },
];

type Form = {
  name: string; endpoint: string; port: number; ssl: boolean;
  accessKey: string; secretKey: string; region: string;
};

export function ConnectProviderModal() {
  const qc = useQueryClient();
  const open = useAppStore(s => s.connectProviderOpen);
  const close = () => useAppStore.getState().setConnectProviderOpen(false);
  const { setProviders } = useAppStore();

  const [kind, setKind] = useState<Kind | null>(null);
  const [form, setForm] = useState<Form>({
    name: '', endpoint: '', port: 9000, ssl: false,
    accessKey: '', secretKey: '', region: 'us-east-1',
  });

  const connectMutation = useMutation({
    mutationFn: () => api.buckets.createProvider({
      name: form.name,
      kind: kind!,
      endpoint: form.endpoint,
      port: form.port,
      ssl: form.ssl,
      accessKey: form.accessKey,
      secretKey: form.secretKey,
      region: form.region,
    }),
    onSuccess: (p) => {
      const prev = qc.getQueryData<any[]>(['providers']) ?? [];
      const next = [...prev, p];
      qc.setQueryData(['providers'], next);
      setProviders(next);
      qc.invalidateQueries({ queryKey: ['buckets'] });
      toast.success(`Proveedor "${p.name}" conectado`);
      handleClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const select = (p: typeof PROVIDERS[0]) => {
    setKind(p.id);
    setForm(f => ({ ...f, name: p.name, endpoint: p.endpoint, port: p.port, ssl: p.ssl }));
  };

  const handleClose = () => {
    setKind(null);
    setForm({ name: '', endpoint: '', port: 9000, ssl: false, accessKey: '', secretKey: '', region: 'us-east-1' });
    close();
  };

  const canSubmit = form.name && form.endpoint && form.accessKey && form.secretKey && !connectMutation.isPending;

  return (
    <Modal open={open} onClose={handleClose} title="Conectar proveedor" width="520px">
      {!kind ? (
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => select(p)}
              className="text-left p-3 rounded-xl border border-border bg-muted/50 hover:border-primary/50 hover:bg-muted transition-all"
            >
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.endpoint || 'Configurar endpoint'}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button onClick={() => setKind(null)} className="text-xs text-primary hover:underline self-start">
            ← Volver
          </button>

          <div className="grid gap-1.5">
            <Label>Nombre</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label>Endpoint</Label>
            <Input
              value={form.endpoint}
              onChange={e => setForm(f => ({ ...f, endpoint: e.target.value }))}
              placeholder="s3.ejemplo.com o IP"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Puerto</Label>
              <Input
                type="number"
                value={String(form.port)}
                onChange={e => setForm(f => ({ ...f, port: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Región</Label>
              <Input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Access Key</Label>
            <Input value={form.accessKey} onChange={e => setForm(f => ({ ...f, accessKey: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label>Secret Key</Label>
            <Input
              type="password"
              value={form.secretKey}
              onChange={e => setForm(f => ({ ...f, secretKey: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.ssl}
              onChange={e => setForm(f => ({ ...f, ssl: e.target.checked }))}
              className="rounded"
            />
            Usar SSL / HTTPS
          </label>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Cancelar</Button>
            <Button
              className="flex-1"
              disabled={!canSubmit}
              onClick={() => connectMutation.mutate()}
            >
              {connectMutation.isPending
                ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : null}
              Conectar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
