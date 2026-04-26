'use client';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
  const { setUser } = useAppStore();
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
    <div className="flex h-dvh overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-0">
          {children}
        </SidebarInset>

        <CreateBucketModal />
        <ConnectProviderModal />
        <CreateApiKeyModal />
        <CreateUserModal />
      </SidebarProvider>
    </div>
  );
}
