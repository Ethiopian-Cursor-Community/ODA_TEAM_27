import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase } = auth;

  const [
    { count: studentCount },
    { count: tutorCount },
    { count: adminCount },
    { data: earnings },
    { count: completedSessions },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('platform_earnings').select('amount'),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true),
  ]);

  const totalPlatformEarnings = (earnings ?? []).reduce(
    (sum, row) => sum + Number(row.amount),
    0
  );

  return NextResponse.json({
    students: studentCount ?? 0,
    tutors: tutorCount ?? 0,
    admins: adminCount ?? 0,
    totalUsers: (studentCount ?? 0) + (tutorCount ?? 0) + (adminCount ?? 0),
    totalPlatformEarnings,
    completedSessions: completedSessions ?? 0,
  });
}
