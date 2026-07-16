'use client';

import { useMemo, useState } from 'react';
import { User, Shield, Users, Plug } from 'lucide-react';
import { Toolbar } from '@/components/layout/toolbar';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { SettingsNav } from './components/settings-nav';
import { SectionHeader } from './components/section-header';
import { AccountSection } from './components/account-section';
import { TeamSection } from './components/team-section';
import { IntegrationsSection } from './components/integrations-section';
import { SecuritySection } from './components/security-section';
import type { Section } from './lib/types';

const DESCRIPTIONS: Record<Section, string> = {
  account: 'Gestiona tu información personal y preferencias.',
  team: 'Invita y controla el acceso de tu equipo.',
  integrations: 'Conecta Atlas con servicios externos.',
  security: 'Protege tu cuenta y datos.',
};

export default function SettingsPage() {
  const { t } = useI18n();
  const [section, setSection] = useState<Section>('account');
  const { user } = useAppStore();
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin' || isOwner;

  const SECTIONS = useMemo(
    () => [
      { id: 'account' as Section, label: t.settingsProfile, icon: User },
      { id: 'team' as Section, label: t.settingsTeam, icon: Users, hidden: !isAdmin },
      { id: 'integrations' as Section, label: t.settingsIntegrations, icon: Plug, hidden: !isAdmin },
      { id: 'security' as Section, label: t.settingsSecurity, icon: Shield },
    ].filter((s) => !s.hidden),
    [t, isAdmin]
  );

  const SectionIcon = SECTIONS.find((s) => s.id === section)?.icon || User;

  const titles: Record<Section, string> = {
    account: t.settingsProfile,
    team: t.settingsTeam,
    integrations: t.settingsIntegrations,
    security: t.settingsSecurity,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-muted via-background to-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: t.settingsTitle }]} />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-60 border-r border-border/60 bg-background/40 backdrop-blur-sm p-4 flex flex-col shrink-0">
          <div className="mb-6">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {t.settingsTitle}
            </p>
          </div>
          <SettingsNav sections={SECTIONS} active={section} onSelect={setSection} />
        </aside>

        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <SectionHeader icon={SectionIcon} title={titles[section]} description={DESCRIPTIONS[section]} />

            {section === 'account' && <AccountSection />}
            {section === 'team' && <TeamSection />}
            {section === 'integrations' && <IntegrationsSection />}
            {section === 'security' && <SecuritySection />}
          </div>
        </div>
      </div>
    </div>
  );
}
