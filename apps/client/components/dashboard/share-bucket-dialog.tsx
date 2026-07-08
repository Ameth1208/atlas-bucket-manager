'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Lock, Link, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Bucket } from '@/lib/api';

interface ShareBucketDialogProps {
  bucket: Bucket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePublic: (isPublic: boolean) => void;
  onGenerateLink: () => Promise<void>;
  isTogglingPublic?: boolean;
  isGeneratingLink?: boolean;
  publicLink?: string;
}

export function ShareBucketDialog({
  bucket,
  open,
  onOpenChange,
  onTogglePublic,
  onGenerateLink,
  isTogglingPublic,
  isGeneratingLink,
  publicLink,
}: ShareBucketDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Compartir "{bucket.name}"</DialogTitle>
          <DialogDescription>Configura los permisos y enlaces de acceso.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2.5">
              {bucket.isPublic 
                ? <Globe size={18} className="text-green-500" /> 
                : <Lock size={18} className="text-muted-foreground" />}
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {bucket.isPublic ? 'Público' : 'Privado'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {bucket.isPublic ? 'Cualquiera puede acceder' : 'Solo tú puedes acceder'}
                </span>
              </div>
            </div>
            <Button
              variant={bucket.isPublic ? 'destructive' : 'default'}
              size="sm"
              onClick={() => onTogglePublic(!bucket.isPublic)}
              disabled={isTogglingPublic}
            >
              {bucket.isPublic ? 'Hacer privado' : 'Hacer público'}
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Enlace público
            </Label>
            <div className="flex gap-2">
              <Input 
                value={publicLink ?? ''} 
                readOnly 
                placeholder="Genera un enlace para compartir" 
                className="font-mono text-xs h-9" 
              />
              <Button 
                onClick={onGenerateLink} 
                disabled={isGeneratingLink} 
                size="sm" 
                className="h-9 w-20"
              >
                {isGeneratingLink 
                  ? <RefreshCw size={13} className="animate-spin" /> 
                  : <Link size={13} />}
              </Button>
            </div>
            {publicLink && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-9 text-xs"
                onClick={() => navigator.clipboard.writeText(publicLink)}
              >
                Copiar enlace
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}