"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Calendar, Clock, DollarSign, Star, Users, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import AIChatInterface from '@/components/AIChatInterface';

interface Booking {
  id: string;
  session_date: string;
  duration_minutes: number;
  subject: string;
  status: string;
  meeting_link: string | null;
  student: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function TutorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          student:users!bookings_student_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('tutor_id', user.id)
        .order('session_date', { ascending: true });

      setBookings(bookingsData || []);
    }
    
    setLoading(false);
  };

  const upcomingSessions = bookings.filter(
    b => b.status === 'confirmed' && new Date(b.session_date) > new Date()
  );
  
  const completedSessions = bookings.filter(b => b.status === 'completed');
  
  const totalEarnings = completedSessions.reduce((sum, booking) => {
    const hours = booking.duration_minutes / 60;
    return sum + (hours * (profile?.hourly_rate || 0));
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zulu-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Here's what's happening with your students.
          </p>
        </div>

        {/* ============================================================ */}
        {/* AI CHAT SECTION FOR TUTORS - BOLD AND PROMINENT */}
        {/* ============================================================ */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-zulu-green to-green-500 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-zulu-green to-green-600 bg-clip-text text-transparent">
              AI Teaching Assistant
            </h2>
            <span className="bg-zulu-green/10 text-zulu-green text-xs px-2 py-1 rounded-full font-semibold">
              Powered by Groq
            </span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Get help with lesson planning, explaining concepts, creating quizzes, or answering student questions.
          </p>
          
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border-2 border-zulu-green/30 shadow-xl shadow-zulu-green/5 overflow-hidden">
            <div className="bg-gradient-to-r from-zulu-green/10 to-transparent px-4 py-2 border-b border-zulu-green/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-zulu-green rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-zulu-green">Tutor AI Assistant • Ready to help</span>
              </div>
            </div>
            <div className="p-1">
              <AIChatInterface />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Total Students</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Users className="w-8 h-8 text-zulu-green opacity-50" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Completed Sessions</p>
                <p className="text-2xl font-bold">{completedSessions.length}</p>
              </div>
              <Star className="w-8 h-8 text-zulu-yellow opacity-50" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-zulu-green opacity-50" />
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-zulu-green" />
              <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
            </div>
            <Link href="/profile" className="text-sm text-zulu-green hover:underline flex items-center gap-1">
              Update availability <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {upcomingSessions.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border p-8 text-center">
              <p className="text-neutral-500">No upcoming sessions. Share your profile with students!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingSessions.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-neutral-900 rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{booking.student?.full_name || 'Student'}</h3>
                    <p className="text-sm text-neutral-500">{booking.subject || 'General'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm">
                      {new Date(booking.session_date).toLocaleDateString()} at {new Date(booking.session_date).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="border border-zulu-green text-zulu-green px-4 py-2 rounded-lg text-sm hover:bg-zulu-green hover:text-white transition-colors">
                      Confirm
                    </button>
                    <button className="border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-zulu-yellow" />
            <h2 className="text-xl font-semibold">Recent Reviews</h2>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-xl border p-8 text-center">
            <p className="text-neutral-500">Reviews will appear here once students leave feedback after sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}