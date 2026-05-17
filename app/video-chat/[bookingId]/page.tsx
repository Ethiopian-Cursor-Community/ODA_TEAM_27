"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Video, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function VideoChatPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          student:student_id (id, full_name),
          tutor:tutor_id (id, full_name)
        `)
        .eq('id', bookingId)
        .single();

      if (fetchError || !data) {
        setError('Session not found');
        setLoading(false);
        return;
      }

      if (data.student_id !== user.id && data.tutor_id !== user.id) {
        setError('You do not have access to this session');
        setLoading(false);
        return;
      }

      setBooking(data);
      setLoading(false);
    };
    load();
  }, [bookingId, router, supabase]);

  const meetUrl =
    (booking?.meeting_link as string) ||
    `https://meet.jit.si/zulu-tutors-${bookingId}`;

  const student = booking?.student as { full_name?: string };
  const tutor = booking?.tutor as { full_name?: string };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zulu-green" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="text-zulu-green hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Video className="w-7 h-7 text-zulu-green" />
              Video Session
            </h1>
            <p className="text-neutral-400 mt-1">
              {student?.full_name} & {tutor?.full_name}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              {booking?.session_date
                ? new Date(String(booking.session_date)).toLocaleString()
                : ''}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-zulu-green/20 text-zulu-green text-sm font-medium">
            {String(booking?.status)}
          </span>
        </div>

        <div className="aspect-video bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center p-8 text-center">
          <Video className="w-16 h-16 text-zulu-green mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Video call ready</p>
          <p className="text-neutral-400 text-sm mb-6 max-w-md">
            Click below to start your session via Jitsi Meet. Only the student and tutor of this booking can join.
          </p>
          <a
            href={meetUrl.startsWith('http') ? meetUrl : `https://meet.jit.si/zulu-tutors-${bookingId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zulu-green text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Start Call
          </a>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-4">
          Powered by Jitsi Meet • Zulu Tutors secure sessions
        </p>
      </div>
    </div>
  );
}
