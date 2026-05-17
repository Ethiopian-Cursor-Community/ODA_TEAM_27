"use client";

import { useState } from 'react';
import { X, Loader2, Wallet, CreditCard } from 'lucide-react';

interface RechargeModalProps {
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export default function RechargeModal({ onClose, onSuccess }: RechargeModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRecharge = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Enter a valid amount in ETB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value, demo: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Recharge failed');

      onSuccess(data.balance ?? value);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Recharge failed');
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
          <div className="p-2 rounded-xl bg-zulu-green/10">
            <Wallet className="w-6 h-6 text-zulu-green" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Recharge Balance</h2>
            <p className="text-sm text-neutral-500">Add funds in Ethiopian Birr (ETB)</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium mb-2">Amount (ETB)</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 500"
          className="w-full p-3 border rounded-xl dark:bg-neutral-950 dark:border-neutral-700 mb-4 focus:border-zulu-green focus:ring-1 focus:ring-zulu-green outline-none"
        />

        <div className="flex gap-2 mb-4">
          {[100, 250, 500, 1000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className="flex-1 py-2 text-sm border rounded-lg hover:border-zulu-green hover:text-zulu-green transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        <button
          onClick={handleRecharge}
          disabled={loading}
          className="w-full py-3 bg-zulu-green text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
          Pay with Telebirr (Demo)
        </button>

        <p className="text-xs text-center text-neutral-500 mt-3">
          Powered by Hakim Express from Zulu Tech
        </p>
      </div>
    </div>
  );
}
