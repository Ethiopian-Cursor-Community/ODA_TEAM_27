"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  BookOpen,
  Users,
  GraduationCap,
  ArrowRight,
  Star,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { SAMPLE_TUTORS } from '@/lib/data';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'admin') router.replace('/admin');
        else if (profile?.role === 'tutor') router.replace('/dashboard/tutor');
        else router.replace('/dashboard/student');
        return;
      }
      setChecking(false);
    };
    checkAuth();
  }, [router, supabase]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-zulu-green" />
      </div>
    );
  }

  const featured = SAMPLE_TUTORS.slice(0, 3);

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#078b48] via-zulu-green to-emerald-800 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-zulu-yellow rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-zulu-red rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-zulu-yellow" />
              Ethiopia&apos;s trusted tutoring platform
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
              Learn with expert tutors.{' '}
              <span className="text-zulu-yellow">Grow with Zulu.</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl">
              Connect with verified Ethiopian tutors, book sessions in ETB, and master Grades 9–12 curriculum—all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-zulu-yellow text-neutral-900 font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 font-semibold rounded-2xl hover:bg-white/20 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-3 gap-4">
            {[
              { n: '500+', l: 'Students' },
              { n: '100+', l: 'Tutors' },
              { n: '10%', l: 'Fair commission' },
            ].map((s) => (
              <div key={s.l} className="text-center p-4 bg-white/10 backdrop-blur rounded-2xl">
                <p className="text-3xl font-bold text-zulu-yellow">{s.n}</p>
                <p className="text-sm text-white/80">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Find a Tutor', desc: 'Browse verified tutors by subject and rate in ETB.' },
              { icon: BookOpen, title: 'Book & Pay', desc: 'Recharge your wallet and book sessions instantly.' },
              { icon: GraduationCap, title: 'Learn & Grow', desc: 'Join video sessions and ace your exams.' },
            ].map((step, i) => (
              <div
                key={step.title}
                className="p-8 bg-white dark:bg-neutral-900 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-zulu-green/10 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-zulu-green" />
                </div>
                <span className="text-xs font-bold text-zulu-red">STEP {i + 1}</span>
                <h3 className="text-xl font-bold mt-2 mb-2">{step.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Featured Tutors</h2>
          <p className="text-center text-neutral-500 mb-10">Sign up to book sessions with our community</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featured.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 hover:border-zulu-green transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zulu-green to-green-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  {t.name.charAt(0)}
                </div>
                <h3 className="font-bold text-lg">{t.name}</h3>
                <p className="text-zulu-green text-sm">{t.subject}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-zulu-yellow text-zulu-yellow" />
                  <span className="text-sm">{t.rating}</span>
                </div>
                <p className="mt-3 font-bold">{t.rate} ETB/hr</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-zulu-green font-semibold hover:underline"
            >
              Join to view all tutors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-zulu-green to-[#078b48] text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="mb-8 text-white/90">Join thousands of Ethiopian students today.</p>
          <Link
            href="/signup?role=tutor"
            className="inline-block px-6 py-3 border-2 border-zulu-yellow text-zulu-yellow font-bold rounded-xl hover:bg-zulu-yellow hover:text-neutral-900 transition-colors mr-4"
          >
            Become a Tutor
          </Link>
          <Link
            href="/signup"
            className="inline-block px-6 py-3 bg-white text-zulu-green font-bold rounded-xl hover:bg-zulu-yellow hover:text-neutral-900 transition-colors"
          >
            Sign Up as Student
          </Link>
        </div>
      </section>
    </div>
  );
}
