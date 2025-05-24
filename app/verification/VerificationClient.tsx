'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function VerificationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      setStatus('verifying');
      verifyEmail(token)
        .then(() => {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          setTimeout(() => router.push('/login'), 3000);
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.message || 'Verification failed.');
        });
    }
  }, [token, verifyEmail, router]);

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">Verify Your Email</h1>
          <p>Please check your email <strong>{email}</strong> for the verification link.</p>
          <p>Click the link in the email to verify your account.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
        {status === 'verifying' && (
          <>
            <h1 className="text-xl font-semibold mb-2">Verifying...</h1>
            <p>Hold on while we verify your email.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-xl font-bold text-green-600 mb-2">Success</h1>
            <p>{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h1>
            <p>{message}</p>
          </>
        )}
      </div>
    </main>
  );
}