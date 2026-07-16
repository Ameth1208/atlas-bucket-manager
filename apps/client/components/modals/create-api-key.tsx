'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreatedApiKey } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const SCOPES = ['read', 'write', 'delete'];

const close = () => useAppStore.getState().setCreateKeyOpen(false);

export function CreateApiKeyModal() {
  const qc = useQueryClient();
  const open = useAppStore(s => s.createKeyOpen);

  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['read']);
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => api.apiKeys.create({ name, scopes: scopes.join(',') }),
    onSuccess: (key) => { qc.invalidateQueries({ queryKey: ['api-keys'] }); setCreated(key); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleScope = (s: string) =>
    setScopes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const copy = () => {
    if (!created) return;
    navigator.clipboard.writeText(created.fullKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setName(''); setScopes(['read']); setCreated(null); setCopied(false);
    close();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Nueva clave de API">
      {!created ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label>Nombre de la clave</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="deploy-ci, backup-bot…" />
          </div>

          <div>
            <Label className="mb-2">Permisos</Label>
            <div className="flex gap-2 mt-2">
              {SCOPES.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleScope(s)}
                  aria-pressed={scopes.includes(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all border',
                    scopes.includes(s)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="pearl" className="flex-1" onClick={handleClose}>Cancelar</Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!name || scopes.length === 0 || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending
                ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : null}
              Generar clave
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-3 bg-success/10 border border-success/30">
            <p className="text-sm font-medium text-success">
              ¡Clave creada! Cópiala ahora — no podrás verla de nuevo.
            </p>
          </div>
          <div>
            <Label className="mb-1.5">Tu clave de API</Label>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/50 mt-1.5">
              <code className="flex-1 font-mono text-xs text-foreground break-all">{created.fullKey}</code>
              <button
                type="button"
                onClick={copy}
                aria-label={copied ? 'Copiado' : 'Copiar clave'}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0"
              >
                {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
          <Button type="button" onClick={handleClose}>Entendido, la guardé</Button>
        </div>
      )}
    </Modal>
  );
}
