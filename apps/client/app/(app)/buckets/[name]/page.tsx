'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useBuckets } from '@/hooks/use-buckets';
import { useEffect } from 'react';
import { useURLStore } from './store/url';
import { useBrowserStore } from './store/browser';
import { BucketBrowser } from './components/bucket-browser';

export default function BucketPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const name = decodeURIComponent(params.name as string);
  const providerId = searchParams.get('provider') || '';

  const { buckets } = useBuckets();
  const bucket = buckets.find((b: any) => b.name === name && b.providerId === providerId);

  useEffect(() => {
    useURLStore.getState().init(name, providerId);
    useBrowserStore.getState().fetchObjects();
  }, [name, providerId]);

  const crumbs = [
    { label: 'Atlas', href: '/dashboard' },
    { label: 'Buckets', href: '/dashboard' },
    { label: name },
  ];

  if (!bucket) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Bucket no encontrado</p>
        </div>
      </div>
    );
  }

  return <BucketBrowser bucket={bucket} crumbs={crumbs} />;
}
