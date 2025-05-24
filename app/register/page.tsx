"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register(email, password, confirmPassword, firstName, lastName);
      router.push('/verification?email=' + encodeURIComponent(email));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-white shadow-lg max-w-sm w-full gap-5 p-4 border rounded-lg justify-center items-center"
      >
        <h1 className="text-2xl font-bold mb-4">Register</h1>

        {/* First Name */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="firstName">First Name</label>
          <input
            className="border border-[#000] p-2 rounded"
            type="text"
            id="firstName"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="lastName">Last Name</label>
          <input
            className="border border-[#000] p-2 rounded"
            type="text"
            id="lastName"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="email">Email</label>
          <input
            className="border border-[#000] p-2 rounded"
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="password">Password</label>
          <input
            className="border border-[#000] p-2 rounded"
            type={showPassword ? "text" : "password"}
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
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

        {/* Confirm Password */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            className="border border-[#000] p-2 rounded"
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#338cda] text-white p-2 w-full rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p>
          Already have an account?{' '}
          <Link href="/auth" className="text-[#338cda] underline">
            Login
          </Link>
        </p>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </main>
  );
}
