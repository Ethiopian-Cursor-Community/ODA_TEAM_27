import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';

export async function POST(req: Request) {
  const auth = await requireRole(['student']);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { amount, demo } = await req.json();
  const rechargeAmount = Number(amount);

  if (!rechargeAmount || rechargeAmount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const { supabase, user, profile } = auth;

  const { data: request, error: insertError } = await supabase
    .from('recharge_requests')
    .insert({
      student_id: user!.id,
      amount: rechargeAmount,
      status: demo ? 'approved' : 'pending',
      processed_at: demo ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (demo) {
    const newBalance = Number(profile?.balance ?? 0) + rechargeAmount;
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', user!.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      request,
      balance: newBalance,
      message: 'Balance recharged successfully (demo).',
    });
  }

  return NextResponse.json({
    request,
    message: 'Recharge request submitted. Awaiting admin approval.',
  });
}
