"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, User, GraduationCap, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError('An unexpected error occurred.');
      setLoading(false);
      return;
    }

    // 2. Create record in users table
    const { error: dbError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: authData.user.email,
      full_name: fullName,
      role: role,
      balance: role === 'student' ? 0 : undefined,
      approval_status: role === 'tutor' ? 'pending' : 'approved',
    });

    if (dbError) {
      console.error('Error inserting user:', dbError);
      setError('Failed to create user profile. Please contact support.');
      setLoading(false);
      return;
    }

    router.refresh();

    // 3. Redirect based on role
    if (role === 'tutor') {
      router.push('/signup/tutor-onboarding');
    } else {
      router.push('/dashboard/student');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BookOpen className="w-12 h-12 text-zulu-green" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-white">
          Join Zulu Tutors
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-zulu-green hover:text-green-700">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 py-8 px-4 shadow-sm border border-neutral-200 dark:border-neutral-800 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex flex-col items-center p-4 border-2 rounded-xl transition-colors ${role === 'student' ? 'border-zulu-green bg-zulu-green/5' : 'border-neutral-200 dark:border-neutral-800 hover:border-zulu-green/50'}`}
              >
                <User className={`w-8 h-8 mb-2 ${role === 'student' ? 'text-zulu-green' : 'text-neutral-400'}`} />
                <span className={`text-sm font-bold ${role === 'student' ? 'text-zulu-green' : 'text-neutral-500'}`}>Student</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('tutor')}
                className={`flex flex-col items-center p-4 border-2 rounded-xl transition-colors ${role === 'tutor' ? 'border-zulu-green bg-zulu-green/5' : 'border-neutral-200 dark:border-neutral-800 hover:border-zulu-green/50'}`}
              >
                <GraduationCap className={`w-8 h-8 mb-2 ${role === 'tutor' ? 'text-zulu-green' : 'text-neutral-400'}`} />
                <span className={`text-sm font-bold ${role === 'tutor' ? 'text-zulu-green' : 'text-neutral-500'}`}>Tutor</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-zulu-green focus:border-zulu-green sm:text-sm bg-white dark:bg-neutral-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-zulu-green focus:border-zulu-green sm:text-sm bg-white dark:bg-neutral-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-zulu-green focus:border-zulu-green sm:text-sm bg-white dark:bg-neutral-950"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-zulu-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zulu-green disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
