'use client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Key, Globe, Lock } from 'lucide-react';
import { useState } from 'react';
import { PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from '@/components/ui/popover';
import { fmtBytes } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { Bucket } from '@/lib/api';

type Preset = { label: string; value: number };

const PRESET_VALUES: { labelKey?: keyof import('@/lib/i18n/types').Dictionary; label?: string; value: number }[] = [
  { labelKey: 'bucketNoLimit', value: 0 },
  { label: '1 GB', value: 1073741824 },
  { label: '10 GB', value: 10737418240 },
  { label: '100 GB', value: 107374182400 },
  { label: '1 TB', value: 1099511627776 },
];

function buildPresets(t: import('@/lib/i18n/types').Dictionary): Preset[] {
  return PRESET_VALUES.map((p) => ({
    label: p.labelKey ? t[p.labelKey] : (p.label ?? ''),
    value: p.value,
  }));
}

interface BucketPermissionsProps {
  bucket: Bucket;
  onTogglePublic: (isPublic: boolean) => void;
  onSetLimit: (limit: number) => void;
  isTogglingPublic?: boolean;
  isSavingLimit?: boolean;
}

function sliderIndexForLimit(limit: number | undefined): number {
  if (!limit || limit <= 0) return 0;
  const gb = limit / 1073741824;
  if (gb <= 1) return 1;
  if (gb <= 10) return 2;
  if (gb <= 100) return 3;
  return 4;
}

export function BucketPermissions({
  bucket,
  onTogglePublic,
  onSetLimit,
  isTogglingPublic,
  isSavingLimit,
}: BucketPermissionsProps) {
  const { t } = useI18n();
  // `key` on the inner component remounts it when the bucket changes, so the
  // initial useState reads the latest props without an effect.
  return (
    <PopoverContent className="w-80 p-0" align="end">
      <PermissionsBody
        key={`${bucket.providerId}:${bucket.name}:${bucket.limit ?? 'none'}`}
        initialLimit={bucket.limit ?? 0}
        isPublic={bucket.isPublic ?? false}
        onTogglePublic={onTogglePublic}
        onSetLimit={onSetLimit}
        isTogglingPublic={isTogglingPublic}
        isSavingLimit={isSavingLimit}
        t={t}
      />
    </PopoverContent>
  );
}

function PermissionsBody({
  initialLimit,
  isPublic,
  onTogglePublic,
  onSetLimit,
  isTogglingPublic,
  isSavingLimit,
  t,
}: {
  initialLimit: number;
  isPublic: boolean;
  onTogglePublic: (isPublic: boolean) => void;
  onSetLimit: (limit: number) => void;
  isTogglingPublic?: boolean;
  isSavingLimit?: boolean;
  t: ReturnType<typeof useI18n>['t'];
}) {
  const presets = buildPresets(t);
  const [sliderValue, setSliderValue] = useState(() => sliderIndexForLimit(initialLimit));
  const [limitValue, setLimitValue] = useState(initialLimit);

  const onSliderChange = (val: number | readonly number[]) => {
    const nextValue = Array.isArray(val) ? val[0] : val;
    setSliderValue(nextValue);
    setLimitValue(presets[nextValue]?.value ?? 0);
  };

  const onPresetClick = (index: number) => {
    setSliderValue(index);
    setLimitValue(presets[index]?.value ?? 0);
  };

  return (
    <>
      <PopoverHeader className="px-4 pt-4 pb-3 border-b border-border">
        <PopoverTitle>{t.bucketPermissionsTitle}</PopoverTitle>
        <PopoverDescription className="text-xs">
          {t.bucketPermissionsDesc}
        </PopoverDescription>
      </PopoverHeader>

      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between p-3 rounded-md bg-secondary border border-border">
          <div className="flex items-center gap-2.5">
            {isPublic
              ? <Globe size={16} className="text-success" />
              : <Lock size={16} className="text-muted-foreground" />}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{t.bucketAccess}</span>
              <span className="text-xs text-muted-foreground">
                {isPublic ? t.bucketAccessPublicHint : t.bucketAccessPrivateHint}
              </span>
            </div>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={(checked) => onTogglePublic(!!checked)}
            disabled={isTogglingPublic}
            aria-label={isPublic ? t.bucketMakePrivate : t.bucketMakePublic}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium">{t.bucketLimit}</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {limitValue === 0 ? t.bucketNoLimit : fmtBytes(limitValue)}
            </span>
          </div>

          <Slider
            defaultValue={[sliderValue]}
            onValueChange={onSliderChange}
            min={0}
            max={presets.length - 1}
            step={1}
          />

          <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
            {presets.map((p, i) => (
              <button
                type="button"
                key={p.value}
                onClick={() => onPresetClick(i)}
                className={`hover:text-foreground transition-colors ${
                  sliderValue === i ? 'text-foreground font-medium' : ''
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="pearl" size="sm" className="h-8 text-xs">
            {t.cancel}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onSetLimit(limitValue)}
            disabled={limitValue === initialLimit || isSavingLimit}
            className="h-8 text-xs"
          >
            {isSavingLimit ? t.saving : t.save}
          </Button>
        </div>
      </div>
    </>
  );
}
