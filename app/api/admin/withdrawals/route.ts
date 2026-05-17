import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('withdrawals')
    .select(`
      *,
      tutor:tutor_id (id, full_name, email)
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

  const status = action === 'approve' ? 'completed' : 'rejected';

  const { data: withdrawal, error: fetchError } = await auth.supabase
    .from('withdrawals')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !withdrawal) {
    return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
  }

  const { error: updateError } = await auth.supabase
    .from('withdrawals')
    .update({
      status,
      processed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (action === 'reject') {
    const { data: tutor } = await auth.supabase
      .from('users')
      .select('available_balance')
      .eq('id', withdrawal.tutor_id)
      .single();

    await auth.supabase
      .from('users')
      .update({
        available_balance: Number(tutor?.available_balance ?? 0) + Number(withdrawal.amount),
      })
      .eq('id', withdrawal.tutor_id);
  }

  return NextResponse.json({ success: true, status });
}
