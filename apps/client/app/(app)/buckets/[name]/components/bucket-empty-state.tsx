'use client';
import { File, Upload, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { useBrowserStore } from '../store';
import { useBucketUIStore } from '../store/ui';

export function EmptyBucketState() {
  const { t } = useI18n();
  const { search, path } = useBrowserStore();
  const setUploadOpen = useBucketUIStore(s => s.setUploadOpen);
  const setNewFolderOpen = useBucketUIStore(s => s.setNewFolderOpen);

  const inFolder = path.length > 0;
  const title = search
    ? t.bucketEmptyNoResults
    : inFolder
      ? t.bucketEmptyFolder
      : t.bucketEmptyBucket;
  const description = search
    ? t.bucketEmptyNoResultsHint
    : inFolder
      ? t.bucketEmptyFolderHint
      : t.bucketEmptyBucketHint;

  return (
    <Card className="border-dashed border-border bg-transparent rounded-md">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center mb-4">
          <File size={22} className="text-muted-foreground" />
        </div>
        <p className="text-sm text-foreground font-medium mb-1">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mb-5">
          {description}
        </p>
        {!search && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload size={13} /> {t.bucketEmptyUpload}
            </Button>
            <Button variant="pearl" size="sm" onClick={() => setNewFolderOpen(true)}>
              <FolderPlus size={13} /> {t.bucketEmptyNewFolder}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
