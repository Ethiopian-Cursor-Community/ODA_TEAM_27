"use client";

import { useState } from 'react';
import { X, Loader2, Banknote } from 'lucide-react';

interface WithdrawModalProps {
  availableBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WithdrawModal({ availableBalance, onClose, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (value > availableBalance) {
      setError('Amount exceeds available balance');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Account number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tutor/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value, account_number: accountNumber }),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
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
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
        )}

        <label className="block text-sm font-medium mb-2">Amount (ETB)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border rounded-xl dark:bg-neutral-950 mb-4 focus:border-zulu-green outline-none"
        />

        <label className="block text-sm font-medium mb-2">Telebirr / CBE Account Number</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="09xxxxxxxx or account number"
          className="w-full p-3 border rounded-xl dark:bg-neutral-950 mb-4 focus:border-zulu-green outline-none"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-zulu-green text-white rounded-xl font-medium flex justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
        </button>
      </div>
    </div>
  );
}
