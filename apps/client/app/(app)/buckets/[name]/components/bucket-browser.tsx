'use client';
import { Toolbar } from '@/components/layout/toolbar';
import { BucketHeader } from '@/components/dashboard/bucket-header';

import { BucketToolbar } from './bucket-toolbar';
import { PathBreadcrumb } from './bucket-breadcrumb';
import { ObjectGrid } from './bucket-grid';
import { ObjectList } from './bucket-list';
import { SkeletonGrid } from './bucket-skeleton';
import { EmptyBucketState } from './bucket-empty-state';
import { FilePreview } from '@/components/file-preview';
import { useBrowserStore, usePreviewStore, filteredObjects } from '../store';
import type { Bucket } from '@/lib/api';

interface BucketBrowserProps {
  bucket: Bucket;
  crumbs: { label: string; href?: string }[];
}

export function BucketBrowser({ bucket, crumbs }: BucketBrowserProps) {

  const { layout, isLoading, objects, search, filter } = useBrowserStore();
  const { file: previewFile, set: setPreviewFile } = usePreviewStore();
  const filtered = filteredObjects(objects, search, filter);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 bg-background">
        <Toolbar crumbs={crumbs} />
        <div className="px-6 pb-4 space-y-3">
          <BucketHeader bucket={bucket} />

          <div className="flex w-full items-center justify-between gap-4">
            <BucketToolbar />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-3">
          <PathBreadcrumb />
        </div>
        <div className="px-6 pb-6">
          {isLoading ? (
            <SkeletonGrid />
          ) : filtered.length === 0 ? (
            <EmptyBucketState />
          ) : layout === 'grid' ? (
            <ObjectGrid />
          ) : (
            <ObjectList />
          )}
        </div>
      </div>

      {previewFile && (
        <FilePreview
          src={previewFile.url}
          fileName={previewFile.name}
          fileType={previewFile.type}
          fileSize={previewFile.size}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
