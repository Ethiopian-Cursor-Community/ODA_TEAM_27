"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight, Loader2, Wallet, Video } from 'lucide-react';
import RechargeModal from '@/components/RechargeModal';

interface Booking {
  id: string;
  session_date: string;
  status: string;
  meeting_link: string | null;
  amount?: number;
  tutor: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function StudentDashboard() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [balance, setBalance] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecharge, setShowRecharge] = useState(false);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);

    if (authUser) {
      const balanceRes = await fetch('/api/wallet/balance');
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setBalance(Number(data.balance ?? 0));
      }

      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tutor:users!bookings_tutor_id_fkey (id, full_name, email)
        `)
        .eq('student_id', authUser.id)
        .order('session_date', { ascending: true });

      if (!error) setBookings(bookingsData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const upcomingSessions = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.session_date) > new Date()
  );
  const pastSessions = bookings.filter(
    (b) => b.status === 'completed' || new Date(b.session_date) < new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zulu-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your wallet and upcoming tutoring sessions.
          </p>
        </div>

        {/* Wallet */}
        <div className="mb-10 bg-gradient-to-br from-[#078b48] via-zulu-green to-green-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-zulu-green/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-zulu-yellow/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-zulu-red/20 rounded-full blur-2xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Wallet Balance</p>
                <p className="text-3xl sm:text-4xl font-bold">{balance.toLocaleString()} ETB</p>
              </div>
            </div>
            <button
              onClick={() => setShowRecharge(true)}
              className="px-6 py-3 bg-white text-zulu-green font-bold rounded-xl hover:bg-zulu-yellow hover:text-neutral-900 transition-colors shadow-lg"
            >
              Recharge Balance
            </button>
          </div>
        </div>

        {showRecharge && (
          <RechargeModal
            onClose={() => setShowRecharge(false)}
            onSuccess={(newBal) => {
              setBalance(newBal);
              fetchData();
            }}
          />
        )}

        {/* Upcoming */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-zulu-green" />
              <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
            </div>
            <Link href="/tutors" className="text-sm text-zulu-green hover:underline flex items-center gap-1">
              Find tutors <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-8 text-center">
              <p className="text-neutral-500">
                No upcoming sessions.{' '}
                <Link href="/tutors" className="text-zulu-green font-medium">
                  Find a tutor
                </Link>{' '}
                to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingSessions.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold">{booking.tutor?.full_name || 'Tutor'}</h3>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4" />
                      {new Date(booking.session_date).toLocaleString()}
                    </p>
                    {booking.amount != null && (
                      <p className="text-sm text-zulu-green mt-1">{booking.amount} ETB</p>
                    )}
                  </div>
                  {booking.meeting_link && (
                    <Link
                      href={booking.meeting_link}
                      className="inline-flex items-center gap-2 bg-zulu-green text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700"
                    >
                      <Video className="w-4 h-4" /> Join Session
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-neutral-400" />
            <h2 className="text-xl font-semibold">Session History</h2>
          </div>
          {pastSessions.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-8 text-center text-neutral-500">
              No past sessions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {pastSessions.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-neutral-900 rounded-xl border p-4 flex justify-between items-center opacity-80"
                >
                  <div>
                    <h3 className="font-medium">{booking.tutor?.full_name}</h3>
                    <p className="text-sm text-neutral-500">
                      {new Date(booking.session_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
