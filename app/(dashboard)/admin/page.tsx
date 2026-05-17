"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Loader2,
  Users,
  DollarSign,
  Calendar,
  Check,
  X,
  Shield,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    tutors: 0,
    admins: 0,
    totalUsers: 0,
    totalPlatformEarnings: 0,
    completedSessions: 0,
  });
  const [tutors, setTutors] = useState<Record<string, unknown>[]>([]);
  const [recharges, setRecharges] = useState<Record<string, unknown>[]>([]);
  const [withdrawals, setWithdrawals] = useState<Record<string, unknown>[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      router.push('/');
      return;
    }
    await loadAll();
    setLoading(false);
  };

  const loadAll = async () => {
    const [statsRes, tutorsRes, rechargesRes, withdrawalsRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/tutors'),
      fetch('/api/admin/recharges'),
      fetch('/api/admin/withdrawals'),
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (tutorsRes.ok) setTutors(await tutorsRes.json());
    if (rechargesRes.ok) setRecharges(await rechargesRes.json());
    if (withdrawalsRes.ok) setWithdrawals(await withdrawalsRes.json());
  };

  const act = async (
    url: string,
    body: Record<string, string>,
    key: string
  ) => {
    setActionLoading(key);
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    await loadAll();
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zulu-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-zulu-green" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
          <StatCard icon={Users} label="Students" value={stats.students} />
          <StatCard icon={Users} label="Tutors" value={stats.tutors} />
          <StatCard
            icon={DollarSign}
            label="Platform Earnings"
            value={`${stats.totalPlatformEarnings.toLocaleString()} ETB`}
          />
          <StatCard icon={Calendar} label="Completed Sessions" value={stats.completedSessions} />
        </div>

        <Section title="Pending Tutor Approvals">
          {tutors.length === 0 ? (
            <p className="text-neutral-500 text-sm">No pending tutors.</p>
          ) : (
            <div className="space-y-3">
              {tutors.map((t) => (
                <div
                  key={String(t.id)}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-900 rounded-xl border"
                >
                  <div>
                    <p className="font-semibold">{String(t.full_name)}</p>
                    <p className="text-sm text-neutral-500">{String(t.email)}</p>
                    {t.cv_url ? (
                      <a
                        href={String(t.cv_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zulu-green hover:underline"
                      >
                        Download CV
                      </a>
                    ) : (
                      <p className="text-xs text-neutral-400">No CV uploaded</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={!!actionLoading}
                      onClick={() =>
                        act('/api/admin/tutors', { id: String(t.id), action: 'approve' }, `t-${t.id}`)
                      }
                      className="px-3 py-1.5 bg-zulu-green text-white rounded-lg text-sm flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      disabled={!!actionLoading}
                      onClick={() =>
                        act('/api/admin/tutors', { id: String(t.id), action: 'reject' }, `tr-${t.id}`)
                      }
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Pending Student Recharges">
          {recharges.length === 0 ? (
            <p className="text-neutral-500 text-sm">No pending recharges.</p>
          ) : (
            <div className="space-y-3">
              {recharges.map((r) => {
                const student = r.student as { full_name?: string; email?: string };
                return (
                  <div
                    key={String(r.id)}
                    className="flex flex-wrap justify-between gap-3 p-4 bg-white dark:bg-neutral-900 rounded-xl border"
                  >
                    <div>
                      <p className="font-semibold">{student?.full_name}</p>
                      <p className="text-sm text-neutral-500">{student?.email}</p>
                      <p className="text-zulu-green font-bold">{Number(r.amount)} ETB</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          act('/api/admin/recharges', { id: String(r.id), action: 'approve' }, `r-${r.id}`)
                        }
                        className="px-3 py-1.5 bg-zulu-green text-white rounded-lg text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          act('/api/admin/recharges', { id: String(r.id), action: 'reject' }, `rr-${r.id}`)
                        }
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="Pending Tutor Withdrawals">
          {withdrawals.length === 0 ? (
            <p className="text-neutral-500 text-sm">No pending withdrawals.</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => {
                const tutor = w.tutor as { full_name?: string; email?: string };
                return (
                  <div
                    key={String(w.id)}
                    className="flex flex-wrap justify-between gap-3 p-4 bg-white dark:bg-neutral-900 rounded-xl border"
                  >
                    <div>
                      <p className="font-semibold">{tutor?.full_name}</p>
                      <p className="text-sm text-neutral-500">Account: {String(w.account_number)}</p>
                      <p className="text-zulu-green font-bold">{Number(w.amount)} ETB</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          act('/api/admin/withdrawals', { id: String(w.id), action: 'approve' }, `w-${w.id}`)
                        }
                        className="px-3 py-1.5 bg-zulu-green text-white rounded-lg text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          act('/api/admin/withdrawals', { id: String(w.id), action: 'reject' }, `wr-${w.id}`)
                        }
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-5">
      <Icon className="w-6 h-6 text-zulu-green mb-2" />
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}
