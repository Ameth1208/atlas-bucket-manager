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
import type { Dictionary } from '@/lib/i18n/types';

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
  groupLabel?: string;
  /** Tailwind classes for the badge background + text. */
  badge: string;
  /** Tailwind classes for the soft icon background. */
  iconBg: string;
  /** Semantic text color for the bare icon. */
  iconColor: string;
}

export const ACTION_CONFIG: Record<
  ActivityAction,
  {
    icon: LucideIcon;
    group: ActionGroup;
    badge: string;
    iconBg: string;
    iconColor: string;
    shortKey: keyof Dictionary;
    labelKey: keyof Dictionary;
    defaultShort: string;
    defaultLabel: string;
  }
> = {
  create: {
    icon: Box,
    group: 'storage',
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20',
    iconColor: 'text-emerald-500',
    shortKey: 'activityActionCreate',
    labelKey: 'activityActionLabelCreate',
    defaultShort: 'Crear',
    defaultLabel: 'creó',
  },
  upload: {
    icon: Upload,
    group: 'storage',
    badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/25 dark:border-sky-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/20',
    iconColor: 'text-sky-500',
    shortKey: 'activityActionUpload',
    labelKey: 'activityActionLabelUpload',
    defaultShort: 'Subir',
    defaultLabel: 'subió',
  },
  delete: {
    icon: Trash2,
    group: 'storage',
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/25 dark:border-rose-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/20',
    iconColor: 'text-rose-500',
    shortKey: 'activityActionDelete',
    labelKey: 'activityActionLabelDelete',
    defaultShort: 'Eliminar',
    defaultLabel: 'eliminó',
  },
  delete_bucket: {
    icon: Trash2,
    group: 'storage',
    badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-200 border border-rose-500/35 backdrop-blur-md shadow-xs font-semibold',
    iconBg: 'bg-rose-500/20 text-rose-700 dark:text-rose-200 border border-rose-500/30',
    iconColor: 'text-rose-600',
    shortKey: 'activityActionDeleteBucket',
    labelKey: 'activityActionLabelDeleteBucket',
    defaultShort: 'Eliminar bucket',
    defaultLabel: 'eliminó el bucket',
  },
  clone: {
    icon: Copy,
    group: 'storage',
    badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 dark:border-indigo-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20',
    iconColor: 'text-indigo-500',
    shortKey: 'activityActionClone',
    labelKey: 'activityActionLabelClone',
    defaultShort: 'Clonar',
    defaultLabel: 'clonó',
  },
  folder: {
    icon: FolderPlus,
    group: 'storage',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/25 dark:border-amber-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/20',
    iconColor: 'text-amber-500',
    shortKey: 'activityActionFolder',
    labelKey: 'activityActionLabelFolder',
    defaultShort: 'Carpeta',
    defaultLabel: 'creó carpeta',
  },
  policy: {
    icon: Shield,
    group: 'storage',
    badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25 dark:border-purple-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/20',
    iconColor: 'text-purple-500',
    shortKey: 'activityActionPolicy',
    labelKey: 'activityActionLabelPolicy',
    defaultShort: 'Política',
    defaultLabel: 'cambió política de',
  },
  share: {
    icon: Share2,
    group: 'storage',
    badge: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/25 dark:border-teal-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/20',
    iconColor: 'text-teal-500',
    shortKey: 'activityActionShare',
    labelKey: 'activityActionLabelShare',
    defaultShort: 'Compartir',
    defaultLabel: 'compartió',
  },
  provider: {
    icon: Server,
    group: 'integrations',
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/25 dark:border-blue-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/20',
    iconColor: 'text-blue-500',
    shortKey: 'activityActionProvider',
    labelKey: 'activityActionLabelProvider',
    defaultShort: 'Proveedor',
    defaultLabel: 'configuró proveedor',
  },
  webhook: {
    icon: Webhook,
    group: 'integrations',
    badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border border-orange-500/25 dark:border-orange-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border border-orange-500/20',
    iconColor: 'text-orange-500',
    shortKey: 'activityActionWebhook',
    labelKey: 'activityActionLabelWebhook',
    defaultShort: 'Webhook',
    defaultLabel: 'gestionó webhook',
  },
  user: {
    icon: UserCog,
    group: 'team',
    badge: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-500/25 dark:border-fuchsia-500/30 backdrop-blur-md shadow-xs',
    iconBg: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-500/20',
    iconColor: 'text-fuchsia-500',
    shortKey: 'activityActionUser',
    labelKey: 'activityActionLabelUser',
    defaultShort: 'Usuario',
    defaultLabel: 'gestionó usuario',
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

export function getGroupLabel(group: ActionGroup, t?: Dictionary): string {
  if (t) {
    if (group === 'storage') return t.activityGroupStorage;
    if (group === 'team') return t.activityGroupTeam;
    if (group === 'integrations') return t.activityGroupIntegrations;
  }
  const fallback: Record<ActionGroup, string> = {
    storage: 'Almacenamiento',
    team: 'Equipo',
    integrations: 'Integraciones',
  };
  return fallback[group] || group;
}

export const GROUP_LABELS: Record<ActionGroup, string> = {
  storage: 'Almacenamiento',
  team: 'Equipo',
  integrations: 'Integraciones',
};

export function getActionMeta(action: string, t?: Dictionary): ActionMeta {
  const conf = ACTION_CONFIG[action as ActivityAction];
  if (conf) {
    return {
      label: t ? (t[conf.labelKey] as string) || conf.defaultLabel : conf.defaultLabel,
      short: t ? (t[conf.shortKey] as string) || conf.defaultShort : conf.defaultShort,
      icon: conf.icon,
      group: conf.group,
      groupLabel: getGroupLabel(conf.group, t),
      badge: conf.badge,
      iconBg: conf.iconBg,
      iconColor: conf.iconColor,
    };
  }
  return {
    label: action,
    short: action,
    icon: Cloud,
    group: 'storage',
    groupLabel: getGroupLabel('storage', t),
    badge: 'bg-muted/80 text-foreground border border-border backdrop-blur-md shadow-xs',
    iconBg: 'bg-muted/80 text-foreground border border-border/50',
    iconColor: 'text-muted-foreground',
  };
}

export const ACTION_META = new Proxy(
  {},
  {
    get: (_, prop: string) => getActionMeta(prop),
  }
) as Record<ActivityAction, ActionMeta>;
