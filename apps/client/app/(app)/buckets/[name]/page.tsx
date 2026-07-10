'use client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useBuckets } from '@/hooks/use-buckets';
import { useEffect } from 'react';
import { useURLStore } from './store/url';
import { useBrowserStore } from './store/browser';
import { BucketBrowser } from './components/bucket-browser';

export default function BucketPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = decodeURIComponent(params.name as string);
  const providerFromUrl = searchParams.get('provider') || '';

  const { buckets, isLoading } = useBuckets();
  const matches = buckets.filter((b: any) => b.name === name);
  const bucket = providerFromUrl
    ? matches.find((b: any) => b.providerId === providerFromUrl)
    : matches[0];

  const resolvedProviderId = bucket?.providerId ?? providerFromUrl;

  useEffect(() => {
    if (!providerFromUrl && bucket?.providerId) {
      const newUrl = `/buckets/${encodeURIComponent(name)}?provider=${bucket.providerId}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [providerFromUrl, bucket?.providerId, name, router]);

  useEffect(() => {
    if (!resolvedProviderId) return;
    useURLStore.getState().init(name, resolvedProviderId);
    useBrowserStore.getState().reset();
    useBrowserStore.getState().fetchObjects();
  }, [name, resolvedProviderId]);

  const crumbs = [
    { label: 'Atlas', href: '/dashboard' },
    { label: 'Buckets', href: '/dashboard' },
    { label: name },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Cargando…</p>
        </div>
      </div>
    );
  }

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
