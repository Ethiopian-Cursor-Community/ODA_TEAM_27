import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';

export async function GET() {
  const auth = await requireRole(['tutor']);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('withdrawals')
    .select('*')
    .eq('tutor_id', auth.user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const auth = await requireRole(['tutor']);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { amount, account_number } = await req.json();
  const withdrawAmount = Number(amount);

  if (!withdrawAmount || withdrawAmount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  if (!account_number?.trim()) {
    return NextResponse.json({ error: 'Account number is required' }, { status: 400 });
  }

  const available = Number(auth.profile?.available_balance ?? 0);
  if (withdrawAmount > available) {
    return NextResponse.json(
      { error: 'Insufficient available balance for withdrawal' },
      { status: 400 }
    );
  }

  const { data, error } = await auth.supabase
    .from('withdrawals')
    .insert({
      tutor_id: auth.user!.id,
      amount: withdrawAmount,
      account_number: account_number.trim(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const newAvailable = available - withdrawAmount;
  await auth.supabase
    .from('users')
    .update({ available_balance: newAvailable })
    .eq('id', auth.user!.id);

  return NextResponse.json({ withdrawal: data, available_balance: newAvailable });
}
