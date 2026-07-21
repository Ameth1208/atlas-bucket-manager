import type { BadgeVariantProps } from '@/lib/badge-variants';

export const SCOPE_VARIANT: Record<string, NonNullable<BadgeVariantProps['variant']>> = {
  read: 'outline',
  write: 'secondary',
  delete: 'destructive',
};

export function getScopeVariant(scope: string): NonNullable<BadgeVariantProps['variant']> {
  return SCOPE_VARIANT[scope] ?? 'outline';
}

export function parseScopes(scopes: string): string[] {
  return scopes
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
