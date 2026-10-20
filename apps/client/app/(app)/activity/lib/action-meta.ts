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
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20',
  },
  upload: {
    label: 'subió',
    short: 'Subir',
    icon: Upload,
    group: 'storage',
    badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/25 dark:border-sky-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/20',
  },
  delete: {
    label: 'eliminó',
    short: 'Eliminar',
    icon: Trash2,
    group: 'storage',
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/25 dark:border-rose-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/20',
  },
  delete_bucket: {
    label: 'eliminó el bucket',
    short: 'Eliminar bucket',
    icon: Trash2,
    group: 'storage',
    badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-200 border border-rose-500/35 backdrop-blur-md shadow-xs font-semibold',
    iconBg: 'bg-rose-500/20 text-rose-700 dark:text-rose-200 border border-rose-500/30',
  },
  clone: {
    label: 'clonó',
    short: 'Clonar',
    icon: Copy,
    group: 'storage',
    badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 dark:border-indigo-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20',
  },
  folder: {
    label: 'creó carpeta',
    short: 'Carpeta',
    icon: FolderPlus,
    group: 'storage',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/25 dark:border-amber-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/20',
  },
  policy: {
    label: 'cambió política de',
    short: 'Política',
    icon: Shield,
    group: 'storage',
    badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25 dark:border-purple-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/20',
  },
  share: {
    label: 'compartió',
    short: 'Compartir',
    icon: Share2,
    group: 'storage',
    badge: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/25 dark:border-teal-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/20',
  },
  provider: {
    label: 'configuró proveedor',
    short: 'Proveedor',
    icon: Server,
    group: 'integrations',
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/25 dark:border-blue-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/20',
  },
  webhook: {
    label: 'gestionó webhook',
    short: 'Webhook',
    icon: Webhook,
    group: 'integrations',
    badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border border-orange-500/25 dark:border-orange-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border border-orange-500/20',
  },
  user: {
    label: 'gestionó usuario',
    short: 'Usuario',
    icon: UserCog,
    group: 'team',
    badge: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-500/25 dark:border-fuchsia-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-500/20',
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
    badge: 'bg-muted/80 text-foreground border border-border backdrop-blur-md shadow-xs',
    iconBg: 'bg-muted/80 text-foreground border border-border/50',
  };
}
