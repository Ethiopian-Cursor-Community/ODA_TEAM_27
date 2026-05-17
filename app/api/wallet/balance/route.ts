import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

export async function GET() {
  const { user, profile, error } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    balance: Number(profile?.balance ?? 0),
    pending_balance: Number(profile?.pending_balance ?? 0),
    available_balance: Number(profile?.available_balance ?? 0),
    role: profile?.role,
  });
}
