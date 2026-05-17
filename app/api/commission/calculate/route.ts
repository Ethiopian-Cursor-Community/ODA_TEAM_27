import { NextResponse } from 'next/server';
import { calculateCommission } from '@/lib/commission';

export async function POST(req: Request) {
  try {
    const { hourlyRate, durationHours } = await req.json();
    const rate = Number(hourlyRate);
    const hours = Number(durationHours ?? 1);

    if (!rate || rate <= 0) {
      return NextResponse.json({ error: 'Invalid hourly rate' }, { status: 400 });
    }

    const breakdown = calculateCommission(rate, hours);
    return NextResponse.json(breakdown);
  } catch {
    return NextResponse.json({ error: 'Failed to calculate commission' }, { status: 500 });
  }
}
