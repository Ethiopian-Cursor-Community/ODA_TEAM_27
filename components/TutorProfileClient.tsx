"use client";

import { useState, useEffect } from 'react';
import BookingModal from '@/components/BookingModal';
import { Loader2 } from 'lucide-react';

interface TutorProfileClientProps {
  tutorId: string;
  tutorName: string;
  hourlyRate: number;
}

export default function TutorProfileClient({
  tutorId,
  tutorName,
  hourlyRate,
}: TutorProfileClientProps) {
  const [showBooking, setShowBooking] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/wallet/balance')
      .then((r) => (r.ok ? r.json() : { balance: 0 }))
      .then((d) => setBalance(Number(d.balance ?? 0)))
      .catch(() => setBalance(0))
      .finally(() => setChecking(false));
  }, []);

  const handleBookClick = () => {
    if (balance === null) return;
    if (balance < hourlyRate) {
      setError('Insufficient balance. Please recharge.');
      return;
    }
    setError('');
    setShowBooking(true);
  };

  return (
    <>
      {error && (
        <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
      )}
      <button
        onClick={handleBookClick}
        disabled={checking}
        className="w-full py-4 bg-zulu-green text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Book Session'}
      </button>
      {balance !== null && (
        <p className="text-xs text-center text-neutral-500 mt-2">
          Your balance: {balance.toLocaleString()} ETB • Rate: {hourlyRate} ETB/hr
        </p>
      )}
      {showBooking && (
        <BookingModal
          tutorId={tutorId}
          tutorName={tutorName}
          hourlyRate={hourlyRate}
          onClose={() => setShowBooking(false)}
        />
      )}
    </>
  );
}
