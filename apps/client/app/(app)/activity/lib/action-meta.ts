import {
  Upload,
  Trash2,
  Copy,
  Share2,
  Shield,
  Cloud,
  FolderPlus,
  Box,
  Server,
  UserCog,
  Webhook,
  type LucideIcon,
} from 'lucide-react';

export type ActivityAction =
  | 'create'
  | 'delete'
  | 'delete_bucket'
  | 'upload'
  | 'folder'
  | 'policy'
  | 'clone'
  | 'share'
  | 'provider'
  | 'user'
  | 'webhook';

export type ActionGroup = 'storage' | 'team' | 'integrations';

export interface ActionMeta {
  label: string;
  short: string;
  icon: LucideIcon;
  group: ActionGroup;
  /** Tailwind classes for the badge background + text. */
  badge: string;
  /** Tailwind classes for the soft icon background. */
  iconBg: string;
}

export const ACTION_META: Record<ActivityAction, ActionMeta> = {
  create: {
    label: 'creó',
    short: 'Crear',
    icon: Box,
    group: 'storage',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
  upload: {
    label: 'subió',
    short: 'Subir',
    icon: Upload,
    group: 'storage',
    badge: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    iconBg: 'bg-sky-50 text-sky-700',
  },
  delete: {
    label: 'eliminó',
    short: 'Eliminar',
    icon: Trash2,
    group: 'storage',
    badge: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    iconBg: 'bg-rose-50 text-rose-700',
  },
  delete_bucket: {
    label: 'eliminó el bucket',
    short: 'Eliminar bucket',
    icon: Trash2,
    group: 'storage',
    badge: 'bg-rose-100 text-rose-800 ring-rose-700/30',
    iconBg: 'bg-rose-100 text-rose-800',
  },
  clone: {
    label: 'clonó',
    short: 'Clonar',
    icon: Copy,
    group: 'storage',
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    iconBg: 'bg-indigo-50 text-indigo-700',
  },
  folder: {
    label: 'creó carpeta',
    short: 'Carpeta',
    icon: FolderPlus,
    group: 'storage',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    iconBg: 'bg-amber-50 text-amber-700',
  },
  policy: {
    label: 'cambió política de',
    short: 'Política',
    icon: Shield,
    group: 'storage',
    badge: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    iconBg: 'bg-violet-50 text-violet-700',
  },
  share: {
    label: 'compartió',
    short: 'Compartir',
    icon: Share2,
    group: 'storage',
    badge: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    iconBg: 'bg-teal-50 text-teal-700',
  },
  provider: {
    label: 'configuró proveedor',
    short: 'Proveedor',
    icon: Server,
    group: 'integrations',
    badge: 'bg-slate-50 text-slate-700 ring-slate-600/20',
    iconBg: 'bg-slate-50 text-slate-700',
  },
  webhook: {
    label: 'gestionó webhook',
    short: 'Webhook',
    icon: Webhook,
    group: 'integrations',
    badge: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    iconBg: 'bg-orange-50 text-orange-700',
  },
  user: {
    label: 'gestionó usuario',
    short: 'Usuario',
    icon: UserCog,
    group: 'team',
    badge: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20',
    iconBg: 'bg-fuchsia-50 text-fuchsia-700',
  },
};

export const ALL_ACTIONS: ActivityAction[] = [
  'create',
  'upload',
  'delete',
  'delete_bucket',
  'clone',
  'folder',
  'policy',
  'share',
  'provider',
  'webhook',
  'user',
];

export const GROUP_LABELS: Record<ActionGroup, string> = {
  storage: 'Almacenamiento',
  team: 'Equipo',
  integrations: 'Integraciones',
};

export function getActionMeta(action: string): ActionMeta {
  return (ACTION_META as Record<string, ActionMeta>)[action] ?? {
    label: action,
    short: action,
    icon: Cloud,
    group: 'storage',
    badge: 'bg-muted text-foreground ring-border',
    iconBg: 'bg-muted text-foreground',
  };
}
