'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SetupCard } from './components';

export default function SetupPage() {
  const router = useRouter();

  useEffect(() => {
    api.auth.status()
      .then(({ isSetup }) => { if (isSetup) router.replace('/dashboard'); })
      .catch(() => {/* stay on setup */});
  }, []);

  return (
    <main className="min-h-dvh w-dvw flex items-center justify-center bg-[#F5F5F7]">
      <SetupCard />
    </main>
  );
}