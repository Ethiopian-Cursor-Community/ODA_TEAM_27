import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('users')
    .select('*')
    .eq('role', 'tutor')
    .eq('approval_status', 'pending')
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

  const approval_status = action === 'approve' ? 'approved' : 'rejected';

  const { error } = await auth.supabase
    .from('users')
    .update({ approval_status })
    .eq('id', id)
    .eq('role', 'tutor');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, approval_status });
}
