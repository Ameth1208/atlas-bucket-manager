'use client';
import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';

export type ConfirmVariant = 'destructive' | 'default';
type DictKey = keyof ReturnType<typeof useI18n>['t'];

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleKey?: DictKey;
  title?: string;
  descriptionKey?: DictKey;
  description?: string;
  confirmKey?: DictKey;
  confirmLabel?: string;
  cancelKey?: DictKey;
  variant?: ConfirmVariant;
  icon?: 'trash' | 'warning' | 'none';
  requireTextMatch?: string;
  placeholderKey?: DictKey;
  vars?: Record<string, string | number>;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  titleKey,
  title,
  descriptionKey,
  description,
  confirmKey,
  confirmLabel,
  cancelKey = 'cancel',
  variant = 'destructive',
  icon = 'warning',
  requireTextMatch,
  placeholderKey,
  vars = {},
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const { tx, t } = useI18n();
  const [typed, setTyped] = useState('');

  const matches = !requireTextMatch || typed === requireTextMatch;
  const handleClose = () => {
    setTyped('');
    onOpenChange(false);
  };

  const IconComp = icon === 'trash' ? Trash2 : icon === 'warning' ? AlertTriangle : null;

  const titleText = title ?? (titleKey ? tx(titleKey, vars) : '');
  const descriptionText = description ?? (descriptionKey ? tx(descriptionKey, vars) : '');
  const confirmText = confirmLabel ?? (confirmKey ? tx(confirmKey) : t.confirm);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className={variant === 'destructive' ? 'flex items-center gap-2 text-destructive' : 'flex items-center gap-2'}>
            {IconComp && <IconComp size={18} />}
            <DialogTitle>{titleText}</DialogTitle>
          </div>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>

        {requireTextMatch && (
          <div className="grid gap-1.5 py-2">
            <Label className="text-[12px]">
              {t.confirmDeleteType}{' '}
              <span className="font-mono font-semibold text-foreground">{requireTextMatch}</span>
            </Label>
            <Input
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder={placeholderKey ? tx(placeholderKey) : requireTextMatch}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && matches) onConfirm(); }}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="pearl" onClick={handleClose} disabled={isLoading}>
            {tx(cancelKey)}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={!matches || isLoading}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
