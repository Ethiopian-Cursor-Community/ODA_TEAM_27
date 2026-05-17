"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { Moon, Sun, BookOpen, Menu, X, LogOut } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);

    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (u) {
        const { data } = await supabase.from('users').select('role').eq('id', u.id).single();
        setUserRole(data?.role || null);
      } else {
        setUserRole(null);
      }
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setUserRole(data?.role || null));
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!mounted) return null;

  const isLoggedIn = !!user;
  const isGuest = !isLoggedIn;
  const isStudent = userRole === 'student';
  const isTutor = userRole === 'tutor';
  const isAdmin = userRole === 'admin';

  const dashboardHref = isAdmin ? '/admin' : isTutor ? '/dashboard/tutor' : '/dashboard/student';

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${pathname === href ? 'text-zulu-green' : 'hover:text-zulu-green'}`;

  const NavLinks = () => (
    <>
      <Link href="/" className={linkClass('/')} onClick={() => setIsMobileMenuOpen(false)}>
        Home
      </Link>

      {isGuest && (
        <Link href="/signup?role=tutor" className={linkClass('/signup')} onClick={() => setIsMobileMenuOpen(false)}>
          Become a Tutor
        </Link>
      )}

      {isStudent && (
        <>
          <Link href="/tutors" className={linkClass('/tutors')} onClick={() => setIsMobileMenuOpen(false)}>
            Find Tutors
          </Link>
          <Link href="/learn" className={linkClass('/learn')} onClick={() => setIsMobileMenuOpen(false)}>
            Learn
          </Link>
          <Link href={dashboardHref} className={linkClass(dashboardHref)} onClick={() => setIsMobileMenuOpen(false)}>
            Dashboard
          </Link>
        </>
      )}

      {isTutor && (
        <>
          <Link href={dashboardHref} className={linkClass(dashboardHref)} onClick={() => setIsMobileMenuOpen(false)}>
            Dashboard
          </Link>
        </>
      )}

      {isAdmin && (
        <Link href="/admin" className={linkClass('/admin')} onClick={() => setIsMobileMenuOpen(false)}>
          Admin Dashboard
        </Link>
      )}

      {isGuest ? (
        <>
          <Link href="/login" className={linkClass('/login')} onClick={() => setIsMobileMenuOpen(false)}>
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-zulu-green text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sign Up
          </Link>
        </>
      ) : (
        <>
          <Link href="/profile" className={linkClass('/profile')} onClick={() => setIsMobileMenuOpen(false)}>
            Profile
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </>
      )}
    </>
  );

  return (
    <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-zulu-green" />
          <span className="font-bold text-xl tracking-tight text-zulu-green">Zulu Tutors</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4 px-4 space-y-3 flex flex-col">
          <NavLinks />
        </div>
      )}
    </nav>
  );
}
