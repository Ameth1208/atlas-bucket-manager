'use client';
import { Suspense, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useBuckets } from '@/hooks/use-buckets';
import { useI18n } from '@/lib/i18n';
import { useURLStore } from './store/url';
import { useBrowserStore } from './store/browser';
import { BucketBrowser } from './components/bucket-browser';
import type { Bucket } from '@/lib/api';

function BucketPageContent({ name, buckets }: { name: string; buckets: Bucket[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();

  const providerFromUrl = searchParams.get('provider') || '';

  const matches = buckets.filter((b) => b.name === name);
  const bucket = providerFromUrl
    ? matches.find((b) => b.providerId === providerFromUrl)
    : matches[0];

  const resolvedProviderId = bucket?.providerId ?? providerFromUrl;

  useEffect(() => {
    if (!providerFromUrl && bucket?.providerId) {
      const newUrl = `/buckets/${encodeURIComponent(name)}?provider=${bucket.providerId}`;
      // react-doctor-disable-next-line nextjs-no-client-side-redirect -- needs the bucket list (client-only) to resolve the provider id; middleware can't read it.
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
    { label: t.commonAtlas, href: '/dashboard' },
    { label: t.bucketsIndexTitle, href: '/dashboard' },
    { label: name },
  ];

  if (!bucket) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t.bucketNotFound}</p>
        </div>
      </div>
    );
  }

  return <BucketBrowser bucket={bucket} crumbs={crumbs} />;
}

export default function BucketPage() {
  const { t } = useI18n();
  const params = useParams();
  const name = decodeURIComponent(params.name as string);

  const { buckets, isLoading } = useBuckets();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">{t.commonLoading}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">{t.commonLoading}</p>
          </div>
        </div>
      }
    >
      <BucketPageContent name={name} buckets={buckets} />
    </Suspense>
  );
}
