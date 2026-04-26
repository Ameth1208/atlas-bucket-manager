'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Toolbar } from '@/components/layout/toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { User, Shield, Palette, Users, Settings2, Sun, Moon, Plus, Trash2 } from 'lucide-react';
import { cn, initials } from '@/lib/utils';

const SECTIONS = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'team', label: 'Equipo', icon: Users },
  { id: 'advanced', label: 'Avanzado', icon: Settings2 },
];

export default function SettingsPage() {
  const [section, setSection] = useState('profile');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: 'Ajustes' }]} />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-52 border-r border-border p-2 flex flex-col gap-0.5 shrink-0 bg-muted/30">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none mb-1">
            Ajustes
          </p>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm w-full text-left transition-colors',
                section === s.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <s.icon size={14} className="shrink-0" />
              {s.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
          {section === 'profile' && <ProfileSection />}
          {section === 'appearance' && <AppearanceSection />}
          {section === 'security' && <SecuritySection />}
          {section === 'team' && <TeamSection />}
          {section === 'advanced' && <AdvancedSection />}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {desc && <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
      <Separator className="mt-8" />
    </div>
  );
}

function ProfileSection() {
  const { user } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  return (
    <SectionBlock title="Perfil">
      <div className="flex items-start gap-5">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {user ? initials(user.name) : '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col gap-3">
          <div className="grid gap-1.5"><Label>Nombre completo</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Correo electrónico</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.success('Guardado')}>Guardar cambios</Button>
          </div>
        </div>
      </div>
    </SectionBlock>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  return (
    <SectionBlock title="Apariencia">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Tema</p>
          <p className="text-xs text-muted-foreground">Cómo se ve Atlas.</p>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden text-sm">
          {[{ v: 'light', label: 'Claro', icon: Sun }, { v: 'dark', label: 'Oscuro', icon: Moon }].map(opt => (
            <button
              key={opt.v}
              onClick={() => setTheme(opt.v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 transition-colors',
                theme === opt.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <opt.icon size={13} /> {opt.label}
            </button>
          ))}
        </div>
      </div>
    </SectionBlock>
  );
}

function SecuritySection() {
  return (
    <SectionBlock title="Contraseña">
      <div className="flex flex-col gap-3 max-w-sm">
        <div className="grid gap-1.5"><Label>Contraseña actual</Label><Input type="password" placeholder="••••••••" /></div>
        <div className="grid gap-1.5"><Label>Nueva contraseña</Label><Input type="password" placeholder="••••••••" /></div>
        <div className="grid gap-1.5"><Label>Confirmar contraseña</Label><Input type="password" placeholder="••••••••" /></div>
        <div className="flex justify-start">
          <Button size="sm">Cambiar contraseña</Button>
        </div>
      </div>
    </SectionBlock>
  );
}

function TeamSection() {
  const qc = useQueryClient();
  const { setCreateUserOpen } = useAppStore();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: api.users.list });
  const deleteMutation = useMutation({
    mutationFn: api.users.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuario eliminado'); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SectionBlock title="Equipo" desc={`${users.length} personas en Atlas.`}>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={() => setCreateUserOpen(true)}><Plus size={12} /> Invitar</Button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <Card className="overflow-hidden">
          {users.map((u, i) => (
            <div key={u.id} className={cn('flex items-center gap-3 px-4 py-3', i > 0 && 'border-t border-border')}>
              <Avatar size="sm">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                  {initials(u.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{u.email}</p>
              </div>
              <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-md bg-muted">{u.role}</span>
              <button
                onClick={() => deleteMutation.mutate(u.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </Card>
      )}
    </SectionBlock>
  );
}

function AdvancedSection() {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-4">Zona peligrosa</h2>
      <Card className="border-destructive/30">
        <CardContent className="flex items-center justify-between pt-4 pb-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Eliminar cuenta</p>
            <p className="text-xs text-muted-foreground">Esta acción es permanente e irreversible.</p>
          </div>
          <Button variant="destructive" size="sm">Eliminar cuenta…</Button>
        </CardContent>
      </Card>
    </div>
  );
}
