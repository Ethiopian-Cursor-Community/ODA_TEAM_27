"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SAMPLE_TUTORS } from '@/lib/data';
import { Star, ChevronLeft, BookOpen, MapPin, Loader2 } from 'lucide-react';
import TutorProfileClient from '@/components/TutorProfileClient';

export default function TutorProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const [tutor, setTutor] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('users').select('*').eq('id', id).eq('role', 'tutor').single();

      if (data) {
        setTutor(data);
      } else {
        const sample = SAMPLE_TUTORS.find((t) => t.id === id);
        if (sample) {
          setTutor({
            id: sample.id,
            full_name: sample.name,
            subjects: sample.subjects,
            bio: sample.bio,
            hourly_rate: sample.rate,
            languages: sample.languages,
            rating: sample.rating,
            approval_status: 'approved',
          });
        }
      }
      setLoading(false);
    };
    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zulu-green" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen pt-20 text-center">
        <p>Tutor not found</p>
        <Link href="/tutors" className="text-zulu-green">
          Back
        </Link>
      </div>
    );
  }

  const name = String(tutor.full_name || 'Tutor');
  const subjects = (tutor.subjects as string[]) || [];
  const rate = Number(tutor.hourly_rate ?? 350);
  const languages = (tutor.languages as string[]) || ['English'];
  const rating = Number(tutor.rating ?? 4.5);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-12 pt-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          href="/tutors"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-zulu-green mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Tutors
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border shadow-sm text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-zulu-green to-green-600 text-white flex items-center justify-center text-3xl font-bold mb-4">
                {name.charAt(0)}
              </div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-zulu-green font-medium">{subjects[0] || 'General'}</p>
              <div className="flex items-center justify-center gap-1 my-3">
                <Star className="w-5 h-5 fill-zulu-yellow text-zulu-yellow" />
                <span className="font-bold">{rating}</span>
              </div>
              <p className="text-2xl font-bold text-zulu-green mb-4">
                {rate} <span className="text-base font-normal text-neutral-500">ETB/hr</span>
              </p>
              <TutorProfileClient tutorId={id} tutorName={name} hourlyRate={rate} />
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {String(tutor.bio || 'Experienced Ethiopian tutor ready to help you succeed.')}
              </p>
              <div className="mt-6">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-zulu-green" />
                  Subjects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <span key={s} className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-neutral-400" />
                <p className="text-sm text-neutral-600">{languages.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
