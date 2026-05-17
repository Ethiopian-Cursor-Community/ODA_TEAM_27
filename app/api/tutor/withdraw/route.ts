import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';

const ETHIOPIAN_PHONE = /^09\d{8}$/;

type AccountType = 'telebirr' | 'cbe' | 'other';

function validateWithdrawalPayload(body: {
  amount?: number;
  account_type?: string;
  telebirr_phone?: string;
  cbe_account_number?: string;
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
}) {
  const withdrawAmount = Number(body.amount);
  if (!withdrawAmount || withdrawAmount <= 0) {
    return { error: 'Invalid amount' };
  }

  const accountType = body.account_type as AccountType;
  if (!['telebirr', 'cbe', 'other'].includes(accountType)) {
    return { error: 'Please select an account type' };
  }

  let account_number = '';
  let account_details: Record<string, string> = {};

  if (accountType === 'telebirr') {
    const phone = body.telebirr_phone?.trim() ?? '';
    if (!ETHIOPIAN_PHONE.test(phone)) {
      return { error: 'Enter a valid Telebirr phone number (09xxxxxxxx)' };
    }
    account_number = phone;
    account_details = { telebirr_phone: phone };
  } else if (accountType === 'cbe') {
    const cbe = body.cbe_account_number?.trim() ?? '';
    if (!cbe) {
      return { error: 'CBE account number is required' };
    }
    account_number = cbe;
    account_details = { cbe_account_number: cbe };
  } else {
    const bankName = body.bank_name?.trim() ?? '';
    const accNum = body.account_number?.trim() ?? '';
    const holder = body.account_holder_name?.trim() ?? '';
    if (!bankName || !accNum || !holder) {
      return { error: 'Bank name, account number, and account holder name are required' };
    }
    account_number = accNum;
    account_details = {
      bank_name: bankName,
      account_number: accNum,
      account_holder_name: holder,
    };
  }

  return { withdrawAmount, accountType, account_number, account_details };
}

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

  const body = await req.json();
  const validated = validateWithdrawalPayload(body);

  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { withdrawAmount, accountType, account_number, account_details } = validated;

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
      account_type: accountType,
      account_number,
      account_details,
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
