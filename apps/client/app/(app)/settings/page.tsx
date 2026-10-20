'use client';

import { useMemo, useState } from 'react';
import { User, Shield, Users, Plug, Database } from 'lucide-react';
import { Toolbar } from '@/components/layout/toolbar';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { SettingsNav } from './components/settings-nav';
import { SectionHeader } from './components/section-header';
import { AccountSection } from './components/account-section';
import { TeamSection } from './components/team-section';
import { IntegrationsSection } from './components/integrations-section';
import { SecuritySection } from './components/security-section';
import type { Section } from './lib/types';

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

  const descriptions: Record<Section, string> = {
    account: t.settingsSectionAccount,
    team: t.settingsSectionTeam,
    integrations: t.settingsSectionIntegrations,
    security: t.settingsSectionSecurity,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-muted/40 via-background to-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: t.settingsTitle }]} />

      {/* ── Mobile Horizontal Navigation ── */}
      <div className="md:hidden flex items-center gap-2 p-3 overflow-x-auto border-b border-border/50 bg-background/60 backdrop-blur-xl shrink-0 no-scrollbar">
        {SECTIONS.map((s) => {
          const isSelected = section === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer',
                isSelected
                  ? 'bg-foreground text-background shadow-xs font-semibold'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              <s.icon size={13} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Desktop Settings Sidebar (Apple System Settings Style) ── */}
        <aside className="hidden md:flex w-64 border-r border-border/60 bg-background/40 backdrop-blur-xl p-4 flex-col shrink-0">
          <div className="mb-4 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {t.settingsTitle}
            </p>
          </div>
          <SettingsNav sections={SECTIONS} active={section} onSelect={setSection} />

          <div className="mt-auto pt-4 px-3 border-t border-border/40 text-[11px] text-muted-foreground/70 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Database size={13} className="text-[#007aff] shrink-0" />
              <span className="truncate font-medium">Atlas</span>
            </div>
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#007aff]/10 text-[#007aff] border border-[#007aff]/20">
              v2.0.4
            </span>
          </div>
        </aside>

        {/* ── Settings Content ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              icon={SectionIcon}
              title={titles[section]}
              description={descriptions[section]}
            />

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
