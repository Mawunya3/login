'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function HomePage() {
  const { user, loading, accessToken } = useAuth();
  const router = useRouter();

  // Redirect to login if not logged in (and not loading)
  useEffect(() => {
    if (!loading && !accessToken) {
      router.replace('/auth');
    }
  }, [loading, accessToken, router]);

  useEffect(() => {
    console.log('User data:', user);
  }, [user]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="border rounded bg-white shadow-lg p-6 max-w-sm w-full">
        <h1 className="text-xl font-bold mb-4">
          Welcome, {user.firstName} {user.lastName}
        </h1>
        <p>
          <strong>Department:</strong> {user.department?.name || 'N/A'}
        </p>
        <p>
          <strong>Rank:</strong> {user.rank?.name || 'N/A'}
        </p>
      </div>
    </main>
  );
}
