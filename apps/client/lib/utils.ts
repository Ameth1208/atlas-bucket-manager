export function fmtBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

export function fmtDate(ts: number | string | undefined): string {
  if (!ts) return '—';
  const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtRelative(ts: number | undefined): string {
  if (!ts) return 'nunca';
  const diff = Date.now() / 1000 - ts;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

export function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const actionColors: Record<string, string> = {
  upload: 'var(--green)',
  delete: 'var(--red)',
  clone: 'var(--accent)',
  share: 'var(--accent)',
  policy: 'var(--orange)',
  login: 'var(--green)',
  create_bucket: 'var(--accent)',
  delete_bucket: 'var(--red)',
};

export const actionLabels: Record<string, string> = {
  upload: 'subió',
  delete: 'eliminó',
  clone: 'clonó',
  share: 'compartió',
  policy: 'actualizó política en',
  login: 'inició sesión',
  create_bucket: 'creó bucket',
  delete_bucket: 'eliminó bucket',
};
