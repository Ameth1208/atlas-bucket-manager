'use client';

import { useState } from 'react';
import { Check, ChevronDown, Copy, HardDrive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useI18n } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Bucket, Provider } from '@/lib/api';

interface CloneBucketDialogProps {
  bucket: Bucket;
  providers: Provider[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClone: (input: { destProviderId: string; destBucketName: string }) => void;
  isCloning?: boolean;
}

export function CloneBucketDialog({
  bucket,
  providers,
  open,
  onOpenChange,
  onClone,
  isCloning,
}: CloneBucketDialogProps) {
  const { t } = useI18n();
  const sourceProvider = providers.find((p) => p.id === bucket.providerId);
  const [destProviderId, setDestProviderId] = useState(bucket.providerId);
  const [destBucketName, setDestBucketName] = useState(`${bucket.name}-copy`);
  const [selectOpen, setSelectOpen] = useState(false);

  const destProvider = providers.find((p) => p.id === destProviderId);
  const canSubmit = destBucketName.trim().length > 0 && !isCloning;

  const handleClone = () => {
    const name = destBucketName.trim();
    if (!name) return;
    onClone({ destProviderId, destBucketName: name });
  };

  const handleOpenChange = (newOpen: boolean) => onOpenChange(newOpen);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} key={`${bucket.providerId}:${bucket.name}`}>
      <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 grid place-items-center text-primary">
              <Copy size={16} />
            </div>
            <div>
              <DialogTitle>{t.cloneDialogTitle}</DialogTitle>
              <DialogDescription>{t.shareDescription}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Origen
            </Label>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/40">
              <div className="size-8 rounded-lg bg-background grid place-items-center text-muted-foreground ring-1 ring-border">
                <HardDrive size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{bucket.name}</p>
                <p className="text-[11.5px] text-muted-foreground truncate">
                  {sourceProvider?.name ?? bucket.providerId}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Proveedor de destino
            </Label>
            <Popover open={selectOpen} onOpenChange={setSelectOpen}>
              <PopoverTrigger
                render={(props) => (
                  <button
                    {...props}
                    type="button"
                    aria-label="Seleccionar proveedor de destino"
                    className={cn(
                      'w-full h-10 px-3 rounded-xl border border-input bg-canvas text-[13px] outline-none text-left',
                      'flex items-center gap-2.5',
                      'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20',
                      'hover:border-border-strong transition-colors'
                    )}
                  >
                    <div className="size-6 rounded-md bg-muted grid place-items-center text-muted-foreground text-[10px] font-semibold uppercase">
                      {destProvider?.name?.[0] ?? '?'}
                    </div>
                    <span className="flex-1 truncate text-foreground">
                      {destProvider?.name ?? 'Selecciona un proveedor'}
                    </span>
                    {destProviderId !== bucket.providerId && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        remoto
                      </span>
                    )}
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </button>
                )}
              />
              <PopoverContent className="w-[--anchor-width] p-1.5" align="start">
                <div className="space-y-0.5 max-h-64 overflow-y-auto">
                  {providers.map((p) => {
                    const active = p.id === destProviderId;
                    const isCurrent = p.id === bucket.providerId;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setDestProviderId(p.id);
                          setSelectOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left text-[13px] transition-colors',
                          active ? 'bg-primary/5 text-foreground' : 'hover:bg-muted'
                        )}
                      >
                        <div className="size-6 rounded-md bg-muted grid place-items-center text-muted-foreground text-[10px] font-semibold uppercase">
                          {p.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{p.name}</div>
                          {isCurrent && (
                            <div className="text-[10.5px] text-muted-foreground">mismo proveedor</div>
                          )}
                        </div>
                        {active && <Check size={14} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Nombre del bucket destino
            </Label>
            <Input
              value={destBucketName}
              onChange={(e) => setDestBucketName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleClone()}
              placeholder="mi-bucket-clonado"
              className="h-10"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="pearl" onClick={() => handleOpenChange(false)} disabled={isCloning}>
            Cancelar
          </Button>
          <Button onClick={handleClone} disabled={!canSubmit}>
            {isCloning ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Iniciando…
              </>
            ) : (
              <>
                <Copy size={13} />
                Iniciar clonado
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
