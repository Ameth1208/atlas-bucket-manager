'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './api';

interface AppStore {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Language
  lang: 'es' | 'en';
  toggleLang: () => void;

  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

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
      theme: 'light',
      toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

      lang: 'es',
      toggleLang: () => set(s => ({ lang: s.lang === 'es' ? 'en' : 'es' })),

      user: null,
      setUser: (user) => set({ user }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

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
      partialize: (s) => ({ theme: s.theme, lang: s.lang }),
    }
  )
);
