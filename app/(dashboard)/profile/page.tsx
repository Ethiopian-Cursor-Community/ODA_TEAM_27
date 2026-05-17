"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, Mail, BookOpen, Save, Loader2, ArrowLeft, Upload, FileText } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const supabase = createClient();
  const isTutor = profile?.role === 'tutor';
  const isStudent = profile?.role === 'student';
  const dashboardHref = isTutor ? '/dashboard/tutor' : isStudent ? '/dashboard/student' : '/';

  useEffect(() => {
    fetchUserAndProfile();
  }, []);

  const fetchUserAndProfile = async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser ?? null);

    if (authUser) {
      const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (data) {
        setProfile(data);
        setFullName(String(data.full_name || ''));
        setBio(String(data.bio || ''));
        setSubjects((data.subjects as string[]) || []);
        setHourlyRate(data.hourly_rate != null ? String(data.hourly_rate) : '');
        setLanguages((data.languages as string[]) || []);
        setAccountNumber(String(data.account_number || ''));
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const updates: Record<string, unknown> = { full_name: fullName };

    if (isTutor) {
      updates.bio = bio;
      updates.subjects = subjects;
      updates.hourly_rate = hourlyRate ? parseFloat(hourlyRate) : null;
      updates.languages = languages;
      updates.account_number = accountNumber;
    }

    const { error } = await supabase.from('users').update(updates).eq('id', user.id);

    if (error) setMessage({ type: 'error', text: error.message });
    else setMessage({ type: 'success', text: 'Profile updated successfully!' });

    setSaving(false);
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from('cvs').upload(path, file, {
      upsert: true,
    });

    if (uploadError) {
      setMessage({ type: 'error', text: uploadError.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(path);
    const cv_url = urlData.publicUrl;

    await supabase.from('users').update({ cv_url }).eq('id', user.id);
    setProfile((p) => ({ ...p, cv_url }));
    setMessage({ type: 'success', text: 'CV uploaded successfully!' });
    setUploading(false);
  };

  const subjectOptions = ['Math', 'Science', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zulu-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href={dashboardHref} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-6 space-y-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border rounded-xl dark:bg-neutral-950 dark:border-neutral-700 focus:border-zulu-green outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full p-3 border rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
            />
          </div>

          {isTutor && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full p-3 border rounded-xl dark:bg-neutral-950 dark:border-neutral-700 focus:border-zulu-green outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Hourly Rate (ETB)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full p-3 border rounded-xl dark:bg-neutral-950 focus:border-zulu-green outline-none"
                  placeholder="e.g. 350"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subjects</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="flex-1 p-2 border rounded-lg dark:bg-neutral-950"
                  >
                    <option value="">Select subject...</option>
                    {subjectOptions
                      .filter((s) => !subjects.includes(s))
                      .map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubject && !subjects.includes(newSubject)) {
                        setSubjects([...subjects, newSubject]);
                        setNewSubject('');
                      }
                    }}
                    className="px-4 py-2 bg-zulu-green text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <span key={s} className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm">
                      {s}{' '}
                      <button type="button" onClick={() => setSubjects(subjects.filter((x) => x !== s))}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Languages</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="flex-1 p-2 border rounded-lg dark:bg-neutral-950"
                    placeholder="Amharic, English..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
                        setLanguages([...languages, newLanguage.trim()]);
                        setNewLanguage('');
                      }
                    }}
                    className="px-4 py-2 bg-zulu-green text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <span key={l} className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm">
                      {l}{' '}
                      <button type="button" onClick={() => setLanguages(languages.filter((x) => x !== l))}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Withdrawal Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-3 border rounded-xl dark:bg-neutral-950 focus:border-zulu-green outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> CV Upload
                </label>
                {profile?.cv_url ? (
                  <a
                    href={String(profile.cv_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zulu-green hover:underline block mb-2"
                  >
                    View current CV
                  </a>
                ) : null}
                <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border border-dashed rounded-xl hover:border-zulu-green">
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Uploading...' : 'Upload CV (PDF)'}
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} />
                </label>
              </div>
            </>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-zulu-green text-white py-3 rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
