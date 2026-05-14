"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { Moon, Sun, BookOpen, Menu, X, LogOut, Users, Calendar, UserCircle } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(data?.role || null);
      }
    };
    
    getUser();

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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!mounted) return null;

  const isLoggedIn = !!user;
  const isTutor = userRole === 'tutor';
  const isStudent = userRole === 'student';

  return (
    <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-zulu-green" />
          <span className="font-bold text-xl tracking-tight text-zulu-green">Zulu Tutors</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          
          {/* STUDENT LINKS */}
          {isLoggedIn && isStudent && (
            <>
              <Link href="/tutors" className="text-sm font-medium hover:text-zulu-green transition-colors">
                Find Tutors
              </Link>
            </>
          )}
          
          {/* TUTOR LINKS */}
          {isLoggedIn && isTutor && (
            <>
              <Link href="/dashboard/tutor" className="text-sm font-medium hover:text-zulu-green transition-colors">
                My Dashboard
              </Link>
              <Link href="/tutors" className="text-sm font-medium hover:text-zulu-green transition-colors">
                Browse Students
              </Link>
            </>
          )}
          
          {/* Show "Become a Tutor" only to logged-out users */}
          {!isLoggedIn && (
            <Link href="/signup?role=tutor" className="text-sm font-medium hover:text-zulu-green transition-colors">
              Become a Tutor
            </Link>
          )}
          
          {/* AUTH LINKS */}
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-zulu-green transition-colors">
                Login
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-zulu-green text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile" className="text-sm font-medium hover:text-zulu-green transition-colors">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <span className="text-sm text-neutral-500">
                👋 {user.email?.split('@')[0]}
              </span>
            </>
          )}
          
          {/* Dark Mode Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4 px-4 space-y-3">
          
          {/* STUDENT LINKS - Mobile */}
          {isLoggedIn && isStudent && (
            <Link 
              href="/tutors" 
              className="block text-sm font-medium hover:text-zulu-green transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Find Tutors
            </Link>
          )}
          
          {/* TUTOR LINKS - Mobile */}
          {isLoggedIn && isTutor && (
            <>
              <Link 
                href="/dashboard/tutor" 
                className="block text-sm font-medium hover:text-zulu-green transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Dashboard
              </Link>
              <Link 
                href="/tutors" 
                className="block text-sm font-medium hover:text-zulu-green transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Students
              </Link>
            </>
          )}
          
          {!isLoggedIn && (
            <Link 
              href="/signup?role=tutor" 
              className="block text-sm font-medium hover:text-zulu-green transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Become a Tutor
            </Link>
          )}
          
          {!isLoggedIn ? (
            <>
              <Link 
                href="/login" 
                className="block text-sm font-medium hover:text-zulu-green transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="block text-sm font-medium bg-zulu-green text-white px-4 py-2 rounded-full text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/profile" 
                className="block text-sm font-medium hover:text-zulu-green transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Logout
              </button>
              <p className="text-xs text-neutral-500 pt-2">Signed in as {user.email?.split('@')[0]}</p>
            </>
          )}
        </div>
      )}
    </nav>
  );
}