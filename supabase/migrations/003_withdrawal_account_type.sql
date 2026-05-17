-- Withdrawal account type support
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS account_details JSONB DEFAULT '{}'::jsonb;
