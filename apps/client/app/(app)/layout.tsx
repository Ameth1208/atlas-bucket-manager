'use client';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CreateBucketModal } from '@/components/modals/create-bucket';
import { ConnectProviderModal, EditProviderModal } from '@/components/modals/connect-provider';
import { CreateApiKeyModal } from '@/components/modals/create-api-key';
import { CreateUserModal } from '@/components/modals/create-user';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setUser } = useAppStore();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: api.auth.me,
    retry: false,
  });

  useEffect(() => {
    if (me) setUser(me);
  }, [me, setUser]);

  return (
    <div className="flex h-dvh overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-0">
          {children}
        </SidebarInset>

        <CreateBucketModal />
        <ConnectProviderModal />
        <EditProviderModal />
        <CreateApiKeyModal />
        <CreateUserModal />
      </SidebarProvider>
    </div>
  );
}
