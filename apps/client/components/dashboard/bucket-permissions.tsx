'use client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Key, Globe, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from '@/components/ui/popover';
import { fmtBytes } from '@/lib/utils';
import type { Bucket } from '@/lib/api';

const PRESETS = [
  { label: 'Sin límite', value: 0 },
  { label: '1 GB', value: 1073741824 },
  { label: '10 GB', value: 10737418240 },
  { label: '100 GB', value: 107374182400 },
  { label: '1 TB', value: 1099511627776 },
];

interface BucketPermissionsProps {
  bucket: Bucket;
  onTogglePublic: (isPublic: boolean) => void;
  onSetLimit: (limit: number) => void;
  isTogglingPublic?: boolean;
  isSavingLimit?: boolean;
}

export function BucketPermissions({ 
  bucket, 
  onTogglePublic, 
  onSetLimit, 
  isTogglingPublic,
  isSavingLimit 
}: BucketPermissionsProps) {
  const [sliderValue, setSliderValue] = useState(0);
  const [limitValue, setLimitValue] = useState(bucket.limit ?? 0);

  useEffect(() => {
    if (bucket.limit === 0 || bucket.limit === undefined) {
      setSliderValue(0);
      setLimitValue(0);
    } else {
      const gb = bucket.limit / 1073741824;
      if (gb <= 1) setSliderValue(1);
      else if (gb <= 10) setSliderValue(2);
      else if (gb <= 100) setSliderValue(3);
      else setSliderValue(4);
      setLimitValue(bucket.limit);
    }
  }, [bucket.limit]);

  const onSliderChange = (val: number | readonly number[]) => {
    const nextValue = Array.isArray(val) ? val[0] : val;
    setSliderValue(nextValue);
    setLimitValue(PRESETS[nextValue]?.value ?? 0);
  };

  const onPresetClick = (index: number) => {
    setSliderValue(index);
    setLimitValue(PRESETS[index]?.value ?? 0);
  };

  return (
    <PopoverContent className="w-80 p-0" align="end">
      <PopoverHeader className="px-4 pt-4 pb-3 border-b border-border">
        <PopoverTitle>Permisos del bucket</PopoverTitle>
        <PopoverDescription className="text-xs">Configura el acceso y límite de almacenamiento.</PopoverDescription>
      </PopoverHeader>

      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2.5">
            {bucket.isPublic 
              ? <Globe size={16} className="text-green-500" /> 
              : <Lock size={16} className="text-muted-foreground" />}
            <div className="flex flex-col">
              <span className="text-sm font-medium">Acceso</span>
              <span className="text-xs text-muted-foreground">
                {bucket.isPublic ? 'Cualquiera puede acceder' : 'Solo tú puedes acceder'}
              </span>
            </div>
          </div>
          <Button
            variant={bucket.isPublic ? 'destructive' : 'default'}
            size="sm"
            onClick={() => onTogglePublic(!bucket.isPublic)}
            disabled={isTogglingPublic}
            className="h-7 text-xs"
          >
            {bucket.isPublic ? 'Hacer privado' : 'Hacer público'}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium">Límite</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {limitValue === 0 ? 'Sin límite' : fmtBytes(limitValue)}
            </span>
          </div>

          <Slider
            key={bucket.limit}
            defaultValue={[sliderValue]}
            onValueChange={onSliderChange}
            min={0}
            max={PRESETS.length - 1}
            step={1}
          />
          
          <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
            {PRESETS.map((p, i) => (
              <button
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
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Cancelar
          </Button>
          <Button 
            size="sm" 
            onClick={() => onSetLimit(limitValue)}
            disabled={limitValue === bucket.limit || isSavingLimit}
            className="h-8 text-xs"
          >
            {isSavingLimit ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </PopoverContent>
  );
}
