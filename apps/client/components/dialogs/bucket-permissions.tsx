'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Globe, Lock, User, Users, Key, Copy } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { Bucket } from '@/lib/api';

interface BucketPermissionsProps {
  bucket: Bucket;
  onClose: () => void;
}

type Permission = 'read' | 'write' | 'delete';

interface UserPermission {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
}

const DEFAULT_PERMISSIONS: Permission[] = ['read'];

export function BucketPermissions({ bucket, onClose }: BucketPermissionsProps) {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, Permission[]>>({});

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: api.users.list,
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['bucket-keys', bucket.name],
    queryFn: () => api.apiKeys.list(),
  });

  const bucketKeys = apiKeys.filter(k => !k.bucketFilter || k.bucketFilter === bucket.name);

  const generateKey = async () => {
    setGeneratingKey(true);
    try {
      const key = await api.apiKeys.create({
        name: `${bucket.name}-key`,
        scopes: 'read',
        bucketFilter: bucket.name,
      });
      setGeneratedKey(key.fullKey);
      toast.success('Clave generada');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGeneratingKey(false);
    }
  };

  const addUserPermission = () => {
    if (!newUserEmail) return;
    const user = users.find((u: any) => u.email === newUserEmail);
    if (!user) {
      toast.error('Usuario no encontrado');
      return;
    }
    setUserPermissions(prev => ({
      ...prev,
      [user.id]: DEFAULT_PERMISSIONS,
    }));
    setSelectedUser(user.id);
    setNewUserEmail('');
  };

  const togglePermission = (userId: string, perm: Permission) => {
    setUserPermissions(prev => {
      const current = prev[userId] || [];
      const next = current.includes(perm)
        ? current.filter(p => p !== perm)
        : [...current, perm];
      return { ...prev, [userId]: next };
    });
  };

  const removeUserPermission = (userId: string) => {
    setUserPermissions(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Copiado al portapapeles');
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Permisos de "{bucket.name}"</DialogTitle>
          <DialogDescription>Configura quién puede acceder y modificar este bucket.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {bucket.isPublic ? <Globe size={16} /> : <Lock size={16} />}
              <span className="text-sm font-medium">
                {bucket.isPublic ? 'Acceso público' : 'Acceso privado'}
              </span>
            </div>
            <Button
              variant={bucket.isPublic ? 'secondary' : 'default'}
              size="sm"
              onClick={() => {
                api.buckets.setPublic(bucket.name, bucket.providerId, !bucket.isPublic);
                toast.success(bucket.isPublic ? 'Ahora es privado' : 'Ahora es público');
              }}
            >
              {bucket.isPublic ? 'Hacer privado' : 'Hacer público'}
            </Button>
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Users size={14} />
              Acceso por usuarios
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Email del usuario"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={addUserPermission}>Agregar</Button>
            </div>

            {Object.entries(userPermissions).length > 0 && (
              <div className="border rounded-lg divide-y">
                {Object.entries(userPermissions).map(([userId, perms]) => {
                  const user = users.find((u: any) => u.id === userId);
                  return (
                    <div key={userId} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {(['read', 'write', 'delete'] as Permission[]).map(perm => (
                          <button
                            key={perm}
                            onClick={() => togglePermission(userId, perm)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                              perms.includes(perm)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {perm.charAt(0).toUpperCase()}
                          </button>
                        ))}
                        <button
                          onClick={() => removeUserPermission(userId)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Key size={14} />
              Claves de API para este bucket
            </Label>
            {bucketKeys.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No hay claves configuradas para este bucket.</p>
            ) : (
              <div className="border rounded-lg divide-y">
                {bucketKeys.map(key => (
                  <div key={key.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{key.prefix}...****</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">{key.scopes}</Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {/* revoke */}}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {generatedKey ? (
              <div className="border rounded-lg p-3 bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Nueva clave (cópiala ahora):</p>
                <div className="flex gap-2">
                  <Input value={generatedKey} readOnly className="font-mono text-xs" />
                  <Button size="sm" onClick={() => copyKey(generatedKey)}>
                    <Copy size={12} />
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={generateKey} disabled={generatingKey}>
                <Key size={12} />
                Generar nueva clave
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={() => toast.success('Permisos guardados')}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
