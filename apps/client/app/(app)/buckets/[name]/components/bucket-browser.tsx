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
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="shrink-0 bg-background border-b border-border">
        <Toolbar crumbs={crumbs} />
        <div className="px-6 pt-6 pb-5 space-y-5 max-w-[1600px] mx-auto w-full">
          <BucketHeader bucket={bucket} />
          <BucketToolbar />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 max-w-[1600px] mx-auto w-full">
          <PathBreadcrumb />
          <div className="pt-2 pb-10">
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
