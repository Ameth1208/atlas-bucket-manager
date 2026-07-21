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
import { Cloud, Database, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { Bucket } from '@/lib/api';

type LimitKey = 'bucketCreateLimitNone' | 'bucketCreateLimit100mb' | 'bucketCreateLimit1gb' | 'bucketCreateLimit10gb' | 'bucketCreateLimit100gb';

const LIMIT_PRESETS: { labelKey: LimitKey; value: string }[] = [
  { labelKey: 'bucketCreateLimitNone', value: '' },
  { labelKey: 'bucketCreateLimit100mb', value: '100' },
  { labelKey: 'bucketCreateLimit1gb', value: '1024' },
  { labelKey: 'bucketCreateLimit10gb', value: '10240' },
  { labelKey: 'bucketCreateLimit100gb', value: '102400' },
];

const close = () => useAppStore.getState().setCreateBucketOpen(false);

export function CreateBucketModal() {
  const { t, tx } = useI18n();
  const qc = useQueryClient();
  const open = useAppStore(s => s.createBucketOpen);
  const { providers } = useProviders();
  const { setBuckets } = useAppStore();

  const [name, setName] = useState('');
  const [providerId, setProviderId] = useState('');
  const [limit, setLimit] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const createMutation = useMutation({
    mutationFn: () =>
      api.buckets.create({
        name,
        providerId,
        limit: limit ? parseInt(limit) : undefined,
        limitUnit: 'MB',
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      const next = qc.getQueryData<Bucket[]>(['buckets']);
      if (next) setBuckets(next);
      toast.success(tx('bucketCreateSuccess', { name }));
      setName(''); setProviderId(''); setLimit('');
      setTouched({});
      close();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleClose = () => {
    setName(''); setProviderId(''); setLimit('');
    setTouched({});
    close();
  };

  const markTouched = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  return (
    <Modal open={open} onClose={handleClose} title={t.bucketCreateTitle} width="460px">
      <div className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label className="text-[13px] font-semibold">{t.bucketCreateNameLabel}</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            onBlur={() => markTouched('name')}
            invalid={touched.name && !name}
            placeholder={t.bucketCreateNamePh}
          />
        </div>

        <div className="grid gap-2">
          <Label className="text-[13px] font-semibold">{t.bucketCreateProviderLabel}</Label>
          {providers.length === 0 ? (
            <p className="text-xs text-warning">{t.bucketCreateProviderEmpty}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {providers.map(p => {
                const active = providerId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProviderId(p.id)}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all',
                      active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-card hover:border-foreground/25 hover:bg-muted'
                    )}
                  >
                    {active ? <Check size={14} /> : <Cloud size={14} />}
                    <span className="text-[13px] font-medium truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label className="text-[13px] font-semibold">{t.bucketCreateLimitLabel}</Label>
          <div className="flex flex-wrap gap-2">
            {LIMIT_PRESETS.map(preset => {
              const active = limit === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setLimit(preset.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors',
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card hover:border-foreground/25 hover:bg-muted'
                  )}
                >
                  {t[preset.labelKey]}
                </button>
              );
            })}
          </div>
          {limit && (
            <p className="text-[11px] text-muted-foreground">
              {tx('bucketCreateLimitCurrent', {
                mb: limit,
                gb: (parseInt(limit) / 1024).toFixed(2),
              })}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="pearl" className="flex-1 h-10" onClick={handleClose}>{t.cancel}</Button>
          <Button
            className="flex-1 h-10"
            disabled={!name || !providerId || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Database size={16} />}
            {t.bucketCreateSubmit}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
