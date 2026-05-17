"use client";

import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import WithdrawModal, { formatAccountType } from '@/components/WithdrawModal';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function AITeachingAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          subject: 'Ethiopian curriculum tutoring — lesson planning and teaching strategies',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.content || 'I could not generate an answer. Please try again.',
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl overflow-hidden shadow-xl shadow-zulu-green/20 border border-zulu-green/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-gradient-to-r from-zulu-green to-green-600 px-5 sm:px-6 py-5 text-white">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">🤖 AI Teaching Assistant</h2>
            <p className="text-sm sm:text-base text-white/90 mt-1">
              Get help with lesson planning, explaining concepts, or answering student questions
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-4 sm:p-6">
        <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about teaching strategies, lesson plans, or subject concepts..."
            className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-950 focus:border-zulu-green focus:ring-1 focus:ring-zulu-green outline-none transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-zulu-green hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ask AI'}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-zulu-red">{error}</p>
        )}

        {(messages.length > 0 || isLoading) && (
          <div className="mt-4 max-h-64 overflow-y-auto space-y-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-100 dark:border-neutral-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm rounded-lg px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-zulu-green/10 text-neutral-800 dark:text-neutral-200 ml-4'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 mr-4'
                }`}
              >
                <span className="font-medium text-xs text-neutral-500 block mb-1">
                  {msg.role === 'user' ? 'You' : 'AI'}
                </span>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-zulu-green" />
                Thinking...
              </div>
            )}
            <div ref={historyEndRef} />
          </div>
        )}
      </div>
    </section>
  );
}

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
  account_type?: string | null;
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

        <AITeachingAssistant />

        <section className="mb-8 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-zulu-yellow/20 shrink-0">
                <BookOpen className="w-6 h-6 text-zulu-green" />
              </div>
              <div>
                <h2 className="text-xl font-bold">📚 Ethiopian Curriculum Resources</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Access grade 9-12 learning materials, definitions, and video tutorials for your students
                </p>
              </div>
            </div>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zulu-green text-white rounded-xl font-medium hover:bg-green-700 transition-colors shrink-0"
            >
              Browse Resources
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </section>

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
                    <th className="py-2 pr-4">Account Type</th>
                    <th className="py-2 pr-4">Account</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 pr-4">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="py-3 pr-4">{w.amount} ETB</td>
                      <td className="py-3 pr-4 text-xs">{formatAccountType(w.account_type)}</td>
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
