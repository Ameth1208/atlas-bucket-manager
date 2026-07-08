'use client';
import { ChevronRight } from 'lucide-react';
import { useBrowserStore, useURLStore } from '../store';

export function PathBreadcrumb() {
  const { path, back } = useBrowserStore();
  const { bucketName } = useURLStore();

  if (path.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 mb-4 text-sm">
      <button onClick={() => back(0)} className="text-primary hover:underline flex items-center gap-1">
        <ChevronRight size={12} className="rotate-180" /> {bucketName}
      </button>
      {path.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={12} className="text-muted-foreground" />
          <button onClick={() => back(i + 1)} className={i === path.length - 1 ? 'font-medium text-foreground' : 'text-primary hover:underline'}>
            {seg}
          </button>
        </span>
      ))}
    </nav>
  );
}
