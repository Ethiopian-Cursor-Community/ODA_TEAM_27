import { createClient } from '@/lib/supabase/server';

export type UserRole = 'student' | 'tutor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  balance?: number;
  pending_balance?: number;
  available_balance?: number;
  hourly_rate?: number;
  approval_status?: string;
  [key: string]: unknown;
}

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase, profile: null };
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  return { user, supabase, profile: profile as UserProfile | null };
}

export async function requireRole(allowed: UserRole[]) {
  const { user, supabase, profile } = await getAuthenticatedUser();
  if (!user) return { error: 'Unauthorized', status: 401 as const, user: null, supabase, profile: null };
  if (!profile || !allowed.includes(profile.role as UserRole)) {
    return { error: 'Forbidden', status: 403 as const, user, supabase, profile };
  }
  return { error: null, status: 200 as const, user, supabase, profile };
}

export async function requireAdmin() {
  return requireRole(['admin']);
}
