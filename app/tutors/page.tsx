"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import TutorCard from '@/components/TutorCard';
import { Filter, X } from 'lucide-react';

interface Tutor {
  id: string;
  full_name: string;
  email: string;
  subjects: string[];
  bio: string;
  hourly_rate: number;
  languages: string[];
  rating: number;
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [maxPrice, setMaxPrice] = useState(100);
  const [showFilters, setShowFilters] = useState(false);
  const supabase = createClient();

  // Fetch real tutors from Supabase
  useEffect(() => {
    async function fetchTutors() {
      setLoading(true);
      
      // Get all users with role = 'tutor'
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'tutor')
        .eq('approval_status', 'approved');

      if (error) {
        console.error('Error fetching tutors:', error);
      } else {
        setTutors(data || []);
      }
      setLoading(false);
    }

    fetchTutors();
  }, []);

  // Filter tutors
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || tutor.subjects?.includes(selectedSubject);
    const matchesPrice = (tutor.hourly_rate || 0) <= maxPrice;
    return matchesSearch && matchesSubject && matchesPrice;
  });

  const subjects = ['Math', 'Science', 'English', 'History', 'Computer Science'];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zulu-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Find Your Perfect Tutor</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-xl dark:bg-neutral-900 dark:border-neutral-700"
          />
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden mb-4 flex items-center gap-2 bg-white dark:bg-neutral-900 p-3 rounded-xl border"
        >
          <Filter size={18} /> Filters
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-4`}>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border">
              <h3 className="font-semibold mb-3">Subject</h3>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-neutral-800"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border">
              <h3 className="font-semibold mb-3">Max Hourly Rate: {maxPrice} ETB</h3>
              <input
                type="range"
                min="0"
                max="200"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Tutor Grid */}
          <div className="flex-1">
            {filteredTutors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No tutors found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    id={tutor.id}
                    name={tutor.full_name}
                    subject={tutor.subjects?.[0] || 'General'}
                    rating={tutor.rating || 4.5}
                    hourlyRate={tutor.hourly_rate || 30}
                    languages={tutor.languages || ['English']}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}