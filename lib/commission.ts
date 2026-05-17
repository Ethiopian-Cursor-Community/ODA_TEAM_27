export const PLATFORM_COMMISSION_RATE = 0.1;

export interface CommissionBreakdown {
  amount: number;
  platformCommission: number;
  tutorShare: number;
}

export function calculateCommission(hourlyRate: number, durationHours = 1): CommissionBreakdown {
  const amount = Number((hourlyRate * durationHours).toFixed(2));
  const platformCommission = Number((amount * PLATFORM_COMMISSION_RATE).toFixed(2));
  const tutorShare = Number((amount - platformCommission).toFixed(2));
  return { amount, platformCommission, tutorShare };
}

export function generateMeetingLink(bookingId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/video-chat/${bookingId}`;
  }
  return `/video-chat/${bookingId}`;
}
