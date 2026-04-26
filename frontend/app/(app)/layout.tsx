'use client';
import { Sidebar } from '@/components/layout/sidebar';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { CreateBucketModal } from '@/components/modals/create-bucket';
import { ConnectProviderModal } from '@/components/modals/connect-provider';
import { CreateApiKeyModal } from '@/components/modals/create-api-key';
import { CreateUserModal } from '@/components/modals/create-user';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setUser, createBucketOpen, connectProviderOpen, createKeyOpen, createUserOpen } = useAppStore();
  const router = useRouter();

  const { data: me, error } = useQuery({
    queryKey: ['me'],
    queryFn: api.auth.me,
    retry: false,
  });

  useEffect(() => {
    if (me) setUser(me);
    if (error) router.push('/login');
  }, [me, error]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>

      <CreateBucketModal open={createBucketOpen} onClose={() => useAppStore.getState().setCreateBucketOpen(false)} />
      <ConnectProviderModal open={connectProviderOpen} onClose={() => useAppStore.getState().setConnectProviderOpen(false)} />
      <CreateApiKeyModal open={createKeyOpen} onClose={() => useAppStore.getState().setCreateKeyOpen(false)} />
      <CreateUserModal open={createUserOpen} onClose={() => useAppStore.getState().setCreateUserOpen(false)} />
    </div>
  );
}
