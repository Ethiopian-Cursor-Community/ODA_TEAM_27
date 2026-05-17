"use client";

import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Loader2, CheckCircle2, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookingModalProps {
  tutorId: string;
  tutorName: string;
  hourlyRate?: number;
  durationHours?: number;
  onClose: () => void;
}

export default function BookingModal({
  tutorId,
  tutorName,
  hourlyRate = 350,
  durationHours = 1,
  onClose,
}: BookingModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const router = useRouter();

  const totalAmount = hourlyRate * durationHours;

  useEffect(() => {
    fetch('/api/wallet/balance')
      .then((r) => r.json())
      .then((d) => setBalance(Number(d.balance ?? 0)))
      .catch(() => setBalance(0));
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setError('Please select a date and time.');
      return;
    }

    if (balance !== null && balance < totalAmount) {
      setError('Insufficient balance. Please recharge.');
      return;
    }

    setLoading(true);
    setError('');

    const sessionDate = new Date(`${date}T${time}`).toISOString();

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutor_id: tutorId,
          session_date: sessionDate,
          duration_hours: durationHours,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book session');
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => onClose(), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-zulu-green mb-4" />
              <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
              <p className="text-neutral-500 text-sm">
                {totalAmount} ETB deducted. Session with {tutorName} is confirmed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-4">
              <h2 className="text-2xl font-bold mb-1">Book a Session</h2>
              <p className="text-neutral-500 text-sm mb-2">With {tutorName}</p>

              <div className="p-3 rounded-xl bg-zulu-green/10 border border-zulu-green/20 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-zulu-green" />
                  Your balance
                </span>
                <span className="font-bold">
                  {balance === null ? '...' : `${balance.toLocaleString()} ETB`}
                </span>
              </div>

              <div className="p-3 rounded-xl border text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Rate</span>
                  <span>{hourlyRate} ETB/hr</span>
                </div>
                <div className="flex justify-between font-bold text-zulu-green">
                  <span>Total</span>
                  <span>{totalAmount} ETB</span>
                </div>
                <p className="text-xs text-neutral-500">10% platform fee included in booking</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-xl focus:border-zulu-green outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-xl focus:border-zulu-green outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-zulu-green text-white rounded-xl font-medium flex justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
