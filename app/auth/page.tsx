'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.push('/'); // redirect to home/profile page
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-white shadow-lg max-w-sm w-full gap-5 p-4 border rounded-lg justify-center items-center  "
      >
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        
        <div className="w-full h-max flex flex-col ">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded w-full border-[#000] "
            autoComplete="email"
          />
        </div>
        <div className="w-full h-max flex flex-col ">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded w-full border-[#000] "
            autoComplete="current-password"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_pass"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="show_pass" className="select-none cursor-pointer">
              Show Password
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#338cda] text-white p-2 w-full rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <h1 className="">
          Forgot <span><Link href={'/'} className="  text-[#338cda]" >username / password</Link></span>?
        </h1>
        <h1 className="">
          Don&apos;t have an account? <span><Link href={'/register'} className=" text-[#338cda]" > Sign Up</Link></span>
        </h1>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </main>
  );
}
