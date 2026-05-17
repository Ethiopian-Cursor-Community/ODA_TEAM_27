import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('recharge_requests')
    .select(`
      *,
      student:student_id (id, full_name, email)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id, action } = await req.json();
  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: recharge, error: fetchError } = await auth.supabase
    .from('recharge_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !recharge) {
    return NextResponse.json({ error: 'Recharge request not found' }, { status: 404 });
  }

  const status = action === 'approve' ? 'approved' : 'rejected';

  const { error: updateError } = await auth.supabase
    .from('recharge_requests')
    .update({
      status,
      processed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (action === 'approve') {
    const { data: student } = await auth.supabase
      .from('users')
      .select('balance')
      .eq('id', recharge.student_id)
      .single();

    await auth.supabase
      .from('users')
      .update({
        balance: Number(student?.balance ?? 0) + Number(recharge.amount),
      })
      .eq('id', recharge.student_id);
  }

  return NextResponse.json({ success: true, status });
}
