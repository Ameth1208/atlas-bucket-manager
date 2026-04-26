'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Bucket, Provider } from './api';

interface AppStore {
  // Language
  lang: 'es' | 'en';
  toggleLang: () => void;

  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Data (cached from API, managed here for reactivity)
  providers: Provider[];
  setProviders: (providers: Provider[]) => void;
  buckets: Bucket[];
  setBuckets: (buckets: Bucket[]) => void;

  // Modals
  createBucketOpen: boolean;
  setCreateBucketOpen: (open: boolean) => void;
  connectProviderOpen: boolean;
  setConnectProviderOpen: (open: boolean) => void;
  createKeyOpen: boolean;
  setCreateKeyOpen: (open: boolean) => void;
  createUserOpen: boolean;
  setCreateUserOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      lang: 'es',
      toggleLang: () => set(s => ({ lang: s.lang === 'es' ? 'en' : 'es' })),

      user: null,
      setUser: (user) => set({ user }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      providers: [],
      setProviders: (providers) => set({ providers }),
      buckets: [],
      setBuckets: (buckets) => set({ buckets }),

      createBucketOpen: false,
      setCreateBucketOpen: (open) => set({ createBucketOpen: open }),
      connectProviderOpen: false,
      setConnectProviderOpen: (open) => set({ connectProviderOpen: open }),
      createKeyOpen: false,
      setCreateKeyOpen: (open) => set({ createKeyOpen: open }),
      createUserOpen: false,
      setCreateUserOpen: (open) => set({ createUserOpen: open }),
    }),
    {
      name: 'atlas-store',
      partialize: (s) => ({ lang: s.lang }),
    }
  )
);
