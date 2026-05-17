"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Users,
  Loader2,
  Banknote,
  CheckCircle,
} from 'lucide-react';
import WithdrawModal from '@/components/WithdrawModal';

interface Booking {
  id: string;
  session_date: string;
  status: string;
  is_completed?: boolean;
  tutor_share?: number;
  meeting_link?: string | null;
  student: { id: string; full_name: string; email: string };
}

interface Withdrawal {
  id: string;
  amount: number;
  account_number: string;
  status: string;
  created_at: string;
}

export default function TutorDashboard() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`*, student:users!bookings_student_id_fkey (id, full_name, email)`)
        .eq('tutor_id', user.id)
        .order('session_date', { ascending: true });
      setBookings(bookingsData || []);

      const wRes = await fetch('/api/tutor/withdraw');
      if (wRes.ok) setWithdrawals(await wRes.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const upcomingSessions = bookings.filter(
    (b) => b.status === 'confirmed' && !b.is_completed && new Date(b.session_date) > new Date()
  );
  const completedSessions = bookings.filter((b) => b.is_completed || b.status === 'completed');

  const uniqueStudents = new Set(bookings.map((b) => b.student?.id)).size;
  const totalEarnings = completedSessions.reduce(
    (sum, b) => sum + Number(b.tutor_share ?? 0),
    0
  );
  const availableBalance = Number(profile?.available_balance ?? 0);
  const rating = Number(profile?.rating ?? 4.5);

  const markComplete = async (bookingId: string) => {
    setCompletingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to complete session');
      } else {
        await fetchData();
      }
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zulu-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome, {String(profile?.full_name || 'Tutor')}! 👋
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track earnings, sessions, and withdrawals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Students Taught', value: uniqueStudents, icon: Users },
            { label: 'Total Earnings (ETB)', value: totalEarnings.toLocaleString(), icon: DollarSign },
            { label: 'Rating', value: rating.toFixed(1), icon: Star },
            { label: 'Available Balance', value: `${availableBalance.toLocaleString()} ETB`, icon: Banknote },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <stat.icon className="w-7 h-7 text-zulu-green mb-2 opacity-70" />
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Withdrawal */}
        <div className="mb-8 bg-white dark:bg-neutral-900 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Banknote className="w-5 h-5 text-zulu-green" /> Withdrawals
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Withdrawable: {availableBalance.toLocaleString()} ETB
              </p>
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={availableBalance <= 0}
              className="px-5 py-2.5 bg-zulu-green text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Request Withdrawal
            </button>
          </div>
          {withdrawals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-neutral-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Account</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 pr-4">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="py-3 pr-4">{w.amount} ETB</td>
                      <td className="py-3 pr-4 font-mono text-xs">{w.account_number}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            w.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : w.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">No withdrawal requests yet.</p>
          )}
        </div>

        {showWithdraw && (
          <WithdrawModal
            availableBalance={availableBalance}
            onClose={() => setShowWithdraw(false)}
            onSuccess={fetchData}
          />
        )}

        {/* Upcoming */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-zulu-green" /> Upcoming Sessions
          </h2>
          {upcomingSessions.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-8 text-center text-neutral-500">
              No upcoming sessions.
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingSessions.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border p-5 flex flex-wrap justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold">{booking.student?.full_name}</h3>
                    <p className="text-sm text-neutral-500">
                      {new Date(booking.session_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                        href={`/video-chat/${booking.id}`}
                        className="px-4 py-2 border border-zulu-green text-zulu-green rounded-xl text-sm hover:bg-zulu-green hover:text-white"
                      >
                        Video Chat
                      </Link>
                    <button
                      onClick={() => markComplete(booking.id)}
                      disabled={completingId === booking.id}
                      className="px-4 py-2 bg-zulu-green text-white rounded-xl text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      {completingId === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Mark Completed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-neutral-400" /> Completed Sessions
          </h2>
          {completedSessions.length === 0 ? (
            <p className="text-neutral-500">No completed sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {completedSessions.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-neutral-900 rounded-xl border p-4 flex justify-between"
                >
                  <span>{b.student?.full_name}</span>
                  <span className="text-zulu-green font-medium">
                    +{Number(b.tutor_share ?? 0)} ETB
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
