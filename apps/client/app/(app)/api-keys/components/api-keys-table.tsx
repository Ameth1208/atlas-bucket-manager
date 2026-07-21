'use client';

import { Copy, Eye, EyeOff, Key, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, fmtDate, fmtRelative } from '@/lib/utils';
import type { ApiKeyInfo } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { getScopeVariant, parseScopes } from '../lib/scope';

interface ApiKeysTableProps {
  keys: ApiKeyInfo[];
  isLoading: boolean;
  revealed: Set<string>;
  onToggleReveal: (id: string) => void;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
  onCreate: () => void;
}

function copy(text: string, message: string) {
  navigator.clipboard.writeText(text);
  toast.success(message);
}

export function ApiKeysTable({
  keys,
  isLoading,
  revealed,
  onToggleReveal,
  onRevoke,
  isRevoking,
  onCreate,
}: ApiKeysTableProps) {
  const { t } = useI18n();
  return (
    <>
      <div className="grid grid-cols-[1fr_220px_140px_100px_36px] text-xs font-semibold uppercase text-muted-foreground px-4 py-2 border-b border-border tracking-wide">
        <span>{t.apiKeysColName}</span>
        <span>{t.apiKeysColToken}</span>
        <span>{t.apiKeysColScopes}</span>
        <span>{t.apiKeysColLastUsed}</span>
        <span />
      </div>

      {isLoading ? (
        <div className="p-6 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Key size={28} className="mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground mb-3">{t.apiKeysEmpty}</p>
          <Button size="sm" onClick={onCreate}>
            <Plus size={13} /> {t.apiKeysCreate}
          </Button>
        </div>
      ) : (
        keys.map((k, i) => (
          <ApiKeyRow
            key={k.id}
            apiKey={k}
            isFirst={i === 0}
            isRevealed={revealed.has(k.id)}
            onToggleReveal={onToggleReveal}
            onRevoke={onRevoke}
            isRevoking={isRevoking}
            copyMessage={t.toastCopied}
          />
        ))
      )}
    </>
  );
}

interface ApiKeyRowProps {
  apiKey: ApiKeyInfo;
  isFirst: boolean;
  isRevealed: boolean;
  onToggleReveal: (id: string) => void;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
  copyMessage: string;
}

function ApiKeyRow({
  apiKey: k,
  isFirst,
  isRevealed,
  onToggleReveal,
  onRevoke,
  isRevoking,
  copyMessage,
}: ApiKeyRowProps) {
  const { t, tx } = useI18n();
  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_220px_140px_100px_36px] items-center px-4 py-3 text-sm',
        !isFirst && 'border-t border-border',
        k.revokedAt && 'opacity-50',
      )}
    >
      <div>
        <p className="font-medium text-foreground">{k.name}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {tx('apiKeysCreated', { date: fmtDate(k.createdAt) })}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <code className="font-mono text-xs text-muted-foreground">
          {k.prefix}_••••••••
        </code>
        <button
          type="button"
          onClick={() => onToggleReveal(k.id)}
          aria-label={isRevealed ? t.apiKeysHideToken : t.apiKeysShowToken}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
        </button>
        <button
          type="button"
          onClick={() => copy(k.prefix, copyMessage)}
          aria-label={t.apiKeysCopyPrefix}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          <Copy size={11} />
        </button>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {parseScopes(k.scopes).map((s) => (
          <Badge key={s} variant={getScopeVariant(s)}>
            {s}
          </Badge>
        ))}
      </div>
      <p className="text-xs font-mono text-muted-foreground">
        {fmtRelative(k.lastUsed ?? undefined)}
      </p>
      <button
        type="button"
        disabled={!!k.revokedAt || isRevoking}
        onClick={() => onRevoke(k.id)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-30"
        title={t.apiKeysRevoke}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
