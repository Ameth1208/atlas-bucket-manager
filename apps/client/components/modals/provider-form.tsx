'use client';
import { useEffect, useState } from 'react';
import { Cloud, Server, KeyRound, ArrowLeft, Check, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { CreateProviderBody, Provider } from '@/lib/api';

type Kind = 'minio' | 'aws' | 'r2' | 'spaces' | 'wasabi';

const PROVIDERS: { id: Kind; name: string; endpoint: string; port: number; ssl: boolean }[] = [
  { id: 'minio', name: 'MinIO', endpoint: '', port: 9000, ssl: false },
  { id: 'aws', name: 'AWS S3', endpoint: 's3.amazonaws.com', port: 443, ssl: true },
  { id: 'r2', name: 'Cloudflare R2', endpoint: '', port: 443, ssl: true },
  { id: 'spaces', name: 'DigitalOcean Spaces', endpoint: '', port: 443, ssl: true },
  { id: 'wasabi', name: 'Wasabi', endpoint: 's3.wasabisys.com', port: 443, ssl: true },
];

const PROVIDER_ICONS: Record<Kind, React.ElementType> = {
  minio: Server,
  aws: Cloud,
  r2: Cloud,
  spaces: Cloud,
  wasabi: Cloud,
};

type Form = {
  name: string; endPoint: string; port: number; useSSL: boolean;
  accessKey: string; secretKey: string; region: string;
};

const EMPTY_FORM: Form = {
  name: '', endPoint: '', port: 9000, useSSL: false,
  accessKey: '', secretKey: '', region: 'us-east-1',
};

interface ProviderFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  provider?: Provider | null;
  onSuccess: (provider: Provider) => void;
}

export function ProviderFormModal({ open, onClose, mode, provider, onSuccess }: ProviderFormModalProps) {
  const [kind, setKind] = useState<Kind | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showKindPicker, setShowKindPicker] = useState(mode === 'create');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && provider) {
      setKind(((provider.kind as Kind) ?? 'minio'));
      setForm({
        name: provider.name ?? '',
        endPoint: provider.endPoint ?? '',
        port: provider.port ?? 9000,
        useSSL: provider.useSSL ?? false,
        accessKey: provider.accessKey ?? '',
        secretKey: provider.secretKey ?? '',
        region: provider.region ?? 'us-east-1',
      });
      setShowKindPicker(false);
    } else {
      setKind(null);
      setForm(EMPTY_FORM);
      setShowKindPicker(true);
    }
    setTouched({});
  }, [open, mode, provider]);

  const saveMutation = useMutation({
    mutationFn: (body: CreateProviderBody) => {
      if (mode === 'edit' && provider) {
        return api.buckets.updateProvider(provider.id, body);
      }
      return api.buckets.createProvider(body);
    },
    onSuccess: (p) => {
      onSuccess(p);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selectKind = (p: typeof PROVIDERS[0]) => {
    setKind(p.id);
    setForm(f => ({ ...f, endPoint: p.endpoint, port: p.port, useSSL: p.ssl }));
    setShowKindPicker(false);
  };

  const update = (field: keyof Form, value: string | number | boolean) =>
    setForm(f => {
      const next = { ...f, [field]: value };
      // Auto-toggle SSL based on port: 443 → true, 9000 → false (only if user hasn't manually changed it)
      if (field === 'port') {
        const port = Number(value);
        if (port === 443) next.useSSL = true;
        else if (port === 80 || port === 9000) next.useSSL = false;
      }
      return next;
    });

  const markTouched = (field: string) => setTouched(t => ({ ...t, [field]: true }));
  const isInvalid = (field: keyof Form) => touched[field] && !form[field];

  const canSubmit =
    !!form.name &&
    !!form.endPoint &&
    (mode === 'edit' || (!!form.accessKey && !!form.secretKey)) &&
    (mode === 'edit' || !!kind) &&
    !saveMutation.isPending;

  const submit = () => {
    if (!kind) return;
    saveMutation.mutate({
      name: form.name,
      kind,
      endPoint: form.endPoint,
      port: form.port,
      useSSL: form.useSSL,
      accessKey: form.accessKey,
      secretKey: form.secretKey,
      region: form.region,
    });
  };

  const title = mode === 'edit' ? `Editar proveedor · ${provider?.name ?? ''}` : 'Conectar proveedor';
  const submitLabel = mode === 'edit' ? 'Guardar cambios' : 'Conectar';
  const SubmitIcon = mode === 'edit' ? Save : Check;

  return (
    <Modal open={open} onClose={onClose} title={title} width="480px">
      {showKindPicker ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROVIDERS.map(p => {
            const Icon = PROVIDER_ICONS[p.id];
            return (
              <button
                key={p.id}
                onClick={() => selectKind(p)}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-foreground/25 hover:bg-muted transition-all text-center"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon size={18} className="text-foreground" />
                </div>
                <span className="text-[13px] font-medium text-foreground">{p.name}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {mode === 'create' && (
            <button
              onClick={() => setShowKindPicker(true)}
              className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors self-start"
            >
              <ArrowLeft size={12} /> Cambiar proveedor
            </button>
          )}

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-semibold">Nombre</Label>
              <Input
                value={form.name}
                onChange={e => update('name', e.target.value)}
                onBlur={() => markTouched('name')}
                invalid={isInvalid('name')}
                placeholder="Ej: Mi MinIO"
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-[13px] font-semibold">Endpoint</Label>
              <Input
                value={form.endPoint}
                onChange={e => update('endPoint', e.target.value)}
                onBlur={() => markTouched('endPoint')}
                invalid={isInvalid('endPoint')}
                placeholder="s3.ejemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[13px] font-semibold">Puerto</Label>
                  <div className="flex gap-1">
                    {[
                      { port: 443, label: '443' },
                      { port: 9000, label: '9000' },
                    ].map(p => (
                      <button
                        key={p.port}
                        type="button"
                        onClick={() => update('port', p.port)}
                        className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors',
                          form.port === p.port
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/70'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  type="number"
                  value={String(form.port)}
                  onChange={e => update('port', Number(e.target.value))}
                  placeholder="9000"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-[13px] font-semibold">Región</Label>
                <Input
                  value={form.region}
                  onChange={e => update('region', e.target.value)}
                  placeholder="us-east-1"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-[13px] font-semibold">
                Access Key {mode === 'edit' && <span className="text-muted-foreground font-normal">(deja en blanco para mantener)</span>}
              </Label>
              <Input
                value={form.accessKey}
                onChange={e => update('accessKey', e.target.value)}
                onBlur={() => markTouched('accessKey')}
                invalid={isInvalid('accessKey')}
                placeholder="minioadmin"
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-[13px] font-semibold">
                Secret Key {mode === 'edit' && <span className="text-muted-foreground font-normal">(deja en blanco para mantener)</span>}
              </Label>
              <Input
                type="password"
                value={form.secretKey}
                onChange={e => update('secretKey', e.target.value)}
                onBlur={() => markTouched('secretKey')}
                invalid={isInvalid('secretKey')}
                placeholder="••••••••"
              />
            </div>

            <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card cursor-pointer mt-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <KeyRound size={14} className="text-foreground" />
                  <span className="text-sm font-medium text-foreground">Usar SSL / HTTPS</span>
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  {form.useSSL
                    ? 'Conexión cifrada (HTTPS)'
                    : 'Conexión en texto plano (HTTP)'}
                </span>
              </div>
              <Switch
                checked={form.useSSL}
                onCheckedChange={checked => update('useSSL', checked)}
              />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="pearl" className="flex-1 h-10" onClick={onClose}>Cancelar</Button>
            <Button
              className="flex-1 h-10"
              disabled={!canSubmit}
              onClick={submit}
            >
              {saveMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <SubmitIcon size={16} />
              )}
              {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
