import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireRole(['tutor']);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: booking, error: fetchError } = await auth.supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .eq('tutor_id', auth.user!.id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.is_completed) {
    return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
  }

  const tutorShare = Number(booking.tutor_share ?? 0);
  const platformCommission = Number(booking.platform_commission ?? 0);

  const { data: tutor } = await auth.supabase
    .from('users')
    .select('pending_balance, available_balance')
    .eq('id', auth.user!.id)
    .single();

  const pending = Number(tutor?.pending_balance ?? 0);
  const available = Number(tutor?.available_balance ?? 0);

  const { error: bookingError } = await auth.supabase
    .from('bookings')
    .update({
      is_completed: true,
      status: 'completed',
    })
    .eq('id', id);

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  await auth.supabase
    .from('users')
    .update({
      pending_balance: Math.max(0, pending - tutorShare),
      available_balance: available + tutorShare,
    })
    .eq('id', auth.user!.id);

  if (platformCommission > 0) {
    await auth.supabase.from('platform_earnings').insert({
      booking_id: id,
      amount: platformCommission,
    });
  }

  return NextResponse.json({ success: true });
}
