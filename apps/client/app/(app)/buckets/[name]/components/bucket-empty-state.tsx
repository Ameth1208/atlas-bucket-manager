'use client';
import { File, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBrowserStore } from '../store';
import { useActionsStore } from '../store/actions';

export function EmptyBucketState() {
  const { search } = useBrowserStore();
  const { handleFiles } = useActionsStore();

  return (
    <Card className="border-dashed">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <File size={32} className="mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground mb-4">
          {search ? 'Sin resultados para tu búsqueda' : 'Este bucket está vacío'}
        </p>
        {!search && (
          <Button size="sm" onClick={() => document.getElementById('file-input')?.click()}>
            <Upload size={13} /> Subir archivos
          </Button>
        )}
      </div>
    </Card>
  );
}
