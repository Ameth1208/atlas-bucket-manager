'use client';
import { ChevronRight, Folder } from 'lucide-react';
import { useBrowserStore, useURLStore } from '../store';

export function PathBreadcrumb() {
  const { path, back } = useBrowserStore();
  const { bucketName } = useURLStore();

  if (path.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 py-3 text-[13px]">
      <Folder size={13} className="text-muted-foreground mr-1" />
      <button
        onClick={() => back(0)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {bucketName}
      </button>
      {path.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={12} className="text-muted-foreground/60" />
          <button
            onClick={() => back(i + 1)}
            className={
              i === path.length - 1
                ? 'font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground transition-colors'
            }
          >
            {seg}
          </button>
        </span>
      ))}
    </nav>
  );
}
