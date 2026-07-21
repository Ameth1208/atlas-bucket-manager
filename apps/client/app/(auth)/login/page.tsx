import { redirect } from 'next/navigation';
import { LoginView } from './components/login-view';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  let isSetup = true;
  try {
    const res = await fetch(`${API_URL}/api/auth/status`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      isSetup = data.isSetup;
    }
  } catch {
    // If the status check fails, fall through to the login form.
  }

  if (!isSetup) {
    redirect('/setup');
  }

  return <LoginView />;
}
