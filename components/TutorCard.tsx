"use client";

import Link from 'next/link';
import { Star, User } from 'lucide-react';

interface TutorCardProps {
  id: string;
  name: string;
  subject: string;
  rating: number;
  hourlyRate: number;
  languages: string[];
}

export default function TutorCard({ id, name, subject, rating, hourlyRate, languages }: TutorCardProps) {
  return (
    <Link href={`/tutors/${id}`}>
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg transition-shadow cursor-pointer">
        
        {/* Tutor Info - No image */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-zulu-green to-green-600 flex items-center justify-center text-white text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{name}</h3>
            <p className="text-zulu-green text-sm font-medium mt-1">{subject}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-medium">{rating || 4.5}</span>
            </div>
          </div>
        </div>
        
        {/* Rate and Languages */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-zulu-green">{hourlyRate}<span className="text-sm text-neutral-500"> ETB/hr</span></p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {languages?.slice(0, 3).map((lang, idx) => (
            <span key={idx} className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">
              {lang}
            </span>
          ))}
        </div>
        
        <button className="w-full bg-zulu-green text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
          View Profile
        </button>
      </div>
    </Link>
  );
}