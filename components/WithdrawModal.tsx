"use client";

import { useState } from 'react';
import { X, Loader2, Banknote } from 'lucide-react';

export type AccountType = 'telebirr' | 'cbe' | 'other';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  telebirr: '🏦 Telebirr',
  cbe: '🏦 CBE (Commercial Bank of Ethiopia)',
  other: '🏦 Other Bank',
};

interface WithdrawModalProps {
  availableBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ETHIOPIAN_PHONE = /^09\d{8}$/;

export default function WithdrawModal({ availableBalance, onClose, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [accountType, setAccountType] = useState<AccountType | ''>('');
  const [telebirrPhone, setTelebirrPhone] = useState('');
  const [cbeAccountNumber, setCbeAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string | null => {
    const value = Number(amount);
    if (!value || value <= 0) return 'Enter a valid amount';
    if (value > availableBalance) return 'Amount exceeds available balance';
    if (!accountType) return 'Please select an account type';

    if (accountType === 'telebirr') {
      if (!telebirrPhone.trim()) return 'Telebirr phone number is required';
      if (!ETHIOPIAN_PHONE.test(telebirrPhone.trim())) {
        return 'Enter a valid Ethiopian phone number (09xxxxxxxx)';
      }
    } else if (accountType === 'cbe') {
      if (!cbeAccountNumber.trim()) return 'CBE account number is required';
    } else {
      if (!bankName.trim()) return 'Bank name is required';
      if (!accountNumber.trim()) return 'Account number is required';
      if (!accountHolderName.trim()) return 'Account holder name is required';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tutor/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          account_type: accountType,
          telebirr_phone: telebirrPhone.trim(),
          cbe_account_number: cbeAccountNumber.trim(),
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_holder_name: accountHolderName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-xl dark:bg-neutral-950 mb-4 focus:border-zulu-green focus:ring-1 focus:ring-zulu-green outline-none transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="p-2 rounded-xl bg-zulu-yellow/20">
            <Banknote className="w-6 h-6 text-zulu-green" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Request Withdrawal</h2>
            <p className="text-sm text-neutral-500">
              Available: {availableBalance.toLocaleString()} ETB
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-2">Amount (ETB)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            placeholder="e.g. 500"
          />

          <label className="block text-sm font-medium mb-2">Account Type</label>
          <select
            value={accountType}
            onChange={(e) => {
              setAccountType(e.target.value as AccountType | '');
              setError('');
            }}
            className={inputClass}
            required
          >
            <option value="">Select account type...</option>
            {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((key) => (
              <option key={key} value={key}>
                {ACCOUNT_TYPE_LABELS[key]}
              </option>
            ))}
          </select>

          {accountType === 'telebirr' && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="block text-sm font-medium mb-2">Telebirr Phone Number</label>
              <input
                type="tel"
                value={telebirrPhone}
                onChange={(e) => setTelebirrPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className={inputClass}
                required
              />
            </div>
          )}

          {accountType === 'cbe' && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="block text-sm font-medium mb-2">CBE Account Number</label>
              <input
                type="text"
                value={cbeAccountNumber}
                onChange={(e) => setCbeAccountNumber(e.target.value)}
                placeholder="Your CBE account number"
                className={inputClass}
                required
              />
            </div>
          )}

          {accountType === 'other' && (
            <div className="space-y-0 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="block text-sm font-medium mb-2">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Awash Bank"
                className={inputClass}
                required
              />
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className={inputClass}
                required
              />
              <label className="block text-sm font-medium mb-2">Account Holder Name</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Full name on account"
                className={inputClass}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-zulu-green to-green-600 text-white rounded-xl font-medium flex justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function formatAccountType(type?: string | null) {
  if (type === 'telebirr') return '🏦 Telebirr';
  if (type === 'cbe') return '🏦 CBE';
  if (type === 'other') return '🏦 Other Bank';
  return '—';
}
