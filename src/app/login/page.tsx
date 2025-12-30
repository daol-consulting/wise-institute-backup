'use client';

import { FormEvent, Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';

// Secure storage keys
const STORAGE_KEY_USERNAME = 'wise_admin_username';
const STORAGE_KEY_REMEMBER = 'wise_admin_remember';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedUsername, setSavedUsername] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  // Load saved username on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const remembered = localStorage.getItem(STORAGE_KEY_REMEMBER) === 'true';
      if (remembered) {
        const username = localStorage.getItem(STORAGE_KEY_USERNAME);
        if (username) {
          setSavedUsername(username);
          setRememberMe(true);
        }
      }
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Securely handle remember me
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        // Only save username, never password
        localStorage.setItem(STORAGE_KEY_USERNAME, email);
        localStorage.setItem(STORAGE_KEY_REMEMBER, 'true');
      } else {
        // Clear saved data if user unchecks
        localStorage.removeItem(STORAGE_KEY_USERNAME);
        localStorage.removeItem(STORAGE_KEY_REMEMBER);
      }
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 transition-colors touch-manipulation mb-4"
          aria-label="Go back to home"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="bg-white rounded-3xl shadow-large border border-secondary-100 p-8 sm:p-10">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-secondary-600">
              Please sign in with your admin account
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={savedUsername}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                  Remember username
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-lg w-full flex items-center justify-center"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-secondary-600">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

