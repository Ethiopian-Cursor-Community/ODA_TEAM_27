import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateCommission } from '@/lib/commission';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    const filterColumn = role === 'tutor' ? 'tutor_id' : 'student_id';

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        student:student_id(id, full_name, email),
        tutor:tutor_id(id, full_name, email, subjects)
      `)
      .eq(filterColumn, userId)
      .order('session_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json(bookings);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tutor_id, session_date, duration_hours = 1 } = body;

    if (!tutor_id || !session_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, role, balance')
      .eq('id', user.id)
      .single();

    if (studentError || !student || student.role !== 'student') {
      return NextResponse.json({ error: 'Only students can book sessions' }, { status: 403 });
    }

    const { data: tutor, error: tutorError } = await supabase
      .from('users')
      .select('id, hourly_rate, approval_status, full_name')
      .eq('id', tutor_id)
      .eq('role', 'tutor')
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    if (tutor.approval_status !== 'approved') {
      return NextResponse.json({ error: 'This tutor is not yet approved' }, { status: 400 });
    }

    const hourlyRate = Number(tutor.hourly_rate ?? 0);
    const hours = Number(duration_hours) || 1;
    const { amount, platformCommission, tutorShare } = calculateCommission(hourlyRate, hours);

    const studentBalance = Number(student.balance ?? 0);

    if (studentBalance < amount) {
      return NextResponse.json(
        {
          error: 'Insufficient balance. Please recharge.',
          required: amount,
          balance: studentBalance,
        },
        { status: 400 }
      );
    }

    const service = createServiceClient();
    const db = service ?? supabase;

    const newStudentBalance = studentBalance - amount;

    const { error: deductError } = await db
      .from('users')
      .update({ balance: newStudentBalance })
      .eq('id', user.id);

    if (deductError) {
      return NextResponse.json(
        {
          error: service
            ? deductError.message
            : 'Could not update balance. Set SUPABASE_SERVICE_ROLE_KEY for booking payments.',
        },
        { status: 500 }
      );
    }

    const { data: tutorRow } = await db
      .from('users')
      .select('pending_balance')
      .eq('id', tutor_id)
      .single();

    const newPending = Number(tutorRow?.pending_balance ?? 0) + tutorShare;

    const { error: tutorUpdateError } = await db
      .from('users')
      .update({ pending_balance: newPending })
      .eq('id', tutor_id);

    if (tutorUpdateError) {
      await db.from('users').update({ balance: studentBalance }).eq('id', user.id);
      return NextResponse.json({ error: tutorUpdateError.message }, { status: 500 });
    }

    const meetingPath = `/video-chat/PLACEHOLDER`;
    const { data: booking, error: bookingError } = await db
      .from('bookings')
      .insert({
        student_id: user.id,
        tutor_id,
        session_date,
        status: 'confirmed',
        duration_hours: hours,
        amount,
        tutor_share: tutorShare,
        platform_commission: platformCommission,
        is_completed: false,
        meeting_link: meetingPath,
      })
      .select()
      .single();

    if (bookingError) {
      await db.from('users').update({ balance: studentBalance }).eq('id', user.id);
      await db
        .from('users')
        .update({ pending_balance: Number(tutorRow?.pending_balance ?? 0) })
        .eq('id', tutor_id);
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    const meetingLink = `/video-chat/${booking.id}`;
    await db.from('bookings').update({ meeting_link: meetingLink }).eq('id', booking.id);

    return NextResponse.json(
      { ...booking, meeting_link: meetingLink, balance: newStudentBalance },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
