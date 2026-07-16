import { redirect } from 'next/navigation';
import { SetupCard } from './components/setup-card';
import { LanguageSwitcher } from '@/components/language-switcher';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  let isSetup = false;
  try {
    const res = await fetch(`${API_URL}/api/auth/status`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      isSetup = data.isSetup;
    }
  } catch {
    // If the status check fails, show the setup UI.
  }

  if (isSetup) {
    redirect('/dashboard');
  }

  return (
    <main className="light-setup relative min-h-dvh w-dvw overflow-x-hidden overflow-y-auto bg-background">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20">
        <LanguageSwitcher />
      </div>

      <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-6 sm:px-8 sm:py-10">
        <div className="w-full max-w-[440px]">
          <SetupCard />
        </div>
      </div>
    </main>
  );
}
