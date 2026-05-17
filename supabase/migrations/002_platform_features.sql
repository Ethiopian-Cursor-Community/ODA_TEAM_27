-- Zulu Tutors Platform Features Migration
-- Run in Supabase SQL Editor after supabase_schema.sql

-- =============================================================================
-- 1. USERS TABLE UPDATES
-- =============================================================================

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('student', 'tutor', 'admin'));

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS balance DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS available_balance DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 4.50;

-- Tutors default to pending approval; students/admins approved
UPDATE public.users SET approval_status = 'pending' WHERE role = 'tutor' AND approval_status IS NULL;
UPDATE public.users SET approval_status = 'approved' WHERE role IN ('student', 'admin');

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_approval_status_check;
ALTER TABLE public.users ADD CONSTRAINT users_approval_status_check
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Use DECIMAL for hourly_rate (ETB) if still integer
ALTER TABLE public.users ALTER COLUMN hourly_rate TYPE DECIMAL(12, 2) USING hourly_rate::DECIMAL;

-- =============================================================================
-- 2. BOOKINGS TABLE UPDATES
-- =============================================================================

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount DECIMAL(12, 2);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tutor_share DECIMAL(12, 2);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(12, 2);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(4, 2) DEFAULT 1;

-- =============================================================================
-- 3. WITHDRAWALS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.users(id) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  account_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tutors view own withdrawals" ON public.withdrawals;
CREATE POLICY "Tutors view own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Tutors insert own withdrawals" ON public.withdrawals;
CREATE POLICY "Tutors insert own withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Admins manage withdrawals" ON public.withdrawals;
CREATE POLICY "Admins manage withdrawals" ON public.withdrawals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================================
-- 4. RECHARGE REQUESTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.recharge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.recharge_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own recharges" ON public.recharge_requests;
CREATE POLICY "Students view own recharges" ON public.recharge_requests
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students insert own recharges" ON public.recharge_requests;
CREATE POLICY "Students insert own recharges" ON public.recharge_requests
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins manage recharges" ON public.recharge_requests;
CREATE POLICY "Admins manage recharges" ON public.recharge_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================================
-- 5. PLATFORM EARNINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.platform_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id),
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view platform earnings" ON public.platform_earnings;
CREATE POLICY "Admins view platform earnings" ON public.platform_earnings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "System insert platform earnings" ON public.platform_earnings;
CREATE POLICY "System insert platform earnings" ON public.platform_earnings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- 6. ADMIN POLICIES ON USERS (approve tutors, update balances)
-- =============================================================================

DROP POLICY IF EXISTS "Admins manage all users" ON public.users;
CREATE POLICY "Admins manage all users" ON public.users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- =============================================================================
-- 7. STORAGE BUCKET FOR TUTOR CVs (create bucket "cvs" in Supabase dashboard)
-- =============================================================================
-- Policy example (run after creating bucket):
-- CREATE POLICY "Tutors upload own CV" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================================================
-- 8. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_withdrawals_tutor_id ON public.withdrawals(tutor_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_recharge_requests_student_id ON public.recharge_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_recharge_requests_status ON public.recharge_requests(status);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON public.users(approval_status);
CREATE INDEX IF NOT EXISTS idx_bookings_is_completed ON public.bookings(is_completed);
