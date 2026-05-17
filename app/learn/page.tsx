"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Loader2, Search, X, Sparkles, Bot, User } from "lucide-react";
import {
  GRADES,
  SUBJECTS,
  type Grade,
  type SubjectId,
  type IndexedTopic,
  type LearnTopic,
  getTopics,
  getGoogleUrl,
  getYoutubeUrl,
  getWikipediaUrl,
  searchTopics,
  getSubjectName,
} from "@/lib/learn-data";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const parts = text.split(new RegExp(`(${escapeRegex(trimmed)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="bg-zulu-yellow/60 dark:bg-zulu-yellow/30 text-neutral-900 dark:text-white rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function TopicLinks({ topic }: { topic: LearnTopic }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={getGoogleUrl(topic)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors"
      >
        🔗 Google
      </a>
      <a
        href={getYoutubeUrl(topic)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-zulu-red/10 text-zulu-red hover:bg-zulu-red hover:text-white rounded-xl text-sm font-medium transition-colors"
      >
        📺 YouTube
      </a>
      <a
        href={getWikipediaUrl(topic)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-zulu-green/10 text-zulu-green hover:bg-zulu-green hover:text-white rounded-xl text-sm font-medium transition-colors"
      >
        📚 Wikipedia
      </a>
    </div>
  );
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function AIHomeworkHelper({ subjectLabel }: { subjectLabel: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          subject: subjectLabel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content || "I could not generate an answer. Please try again.",
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl overflow-hidden shadow-xl shadow-zulu-green/20 border border-zulu-green/30">
      <div className="bg-gradient-to-r from-zulu-green to-green-600 px-5 sm:px-6 py-5 text-white">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">🤖 AI Homework Helper</h2>
            <p className="text-sm sm:text-base text-white/90 mt-1">
              Ask any question about your subjects — get instant answers
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-4 sm:p-6">
        <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. What is photosynthesis? How do I solve quadratic equations?"
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:border-zulu-green focus:ring-2 focus:ring-zulu-green/20 text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-zulu-green to-green-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Ask AI
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {messages.length > 0 && (
          <div className="mt-6 space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-zulu-yellow text-neutral-900"
                      : "bg-zulu-green text-white"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed ${
                    message.role === "user"
                      ? "bg-zulu-green/10 text-neutral-900 dark:text-neutral-100 border border-zulu-green/20"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-zulu-green text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 rounded-2xl px-4 py-3 bg-neutral-100 dark:bg-neutral-800 flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin text-zulu-green" />
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={historyEndRef} />
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <p className="mt-4 text-sm text-neutral-500 text-center">
            Powered by Groq • Answers are for study help on Ethiopian Grades 9–12 subjects
          </p>
        )}
      </div>
    </section>
  );
}

function TopicCard({
  topic,
  searchQuery,
  badge,
}: {
  topic: LearnTopic;
  searchQuery: string;
  badge?: React.ReactNode;
}) {
  return (
    <li className="bg-white dark:bg-neutral-900 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-zulu-green/40 transition-all">
      {badge}
      <h3 className="text-lg font-bold mb-2">
        <HighlightText text={topic.title} query={searchQuery} />
      </h3>
      <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed text-base sm:text-lg">
        <HighlightText text={topic.definition} query={searchQuery} />
      </p>
      <TopicLinks topic={topic} />
    </li>
  );
}

export default function LearnPage() {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [subjectId, setSubjectId] = useState<SubjectId | null>(null);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return searchTopics(searchQuery);
  }, [searchQuery, isSearching]);

  const topics = useMemo(() => {
    if (!grade || !subjectId || isSearching) return [];
    return getTopics(grade, subjectId);
  }, [grade, subjectId, isSearching]);

  const selectedSubject = SUBJECTS.find((s) => s.id === subjectId);

  const handleGradeSelect = (g: Grade) => {
    setGrade(g);
    setSubjectId(null);
  };

  const handleSubjectSelect = (id: SubjectId) => {
    setLoadingTopics(true);
    setSubjectId(id);
    setTimeout(() => setLoadingTopics(false), 300);
  };

  const clearSearch = () => setSearchQuery("");

  const renderSearchBadge = (item: IndexedTopic) => (
    <div className="flex flex-wrap gap-2 mb-3">
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zulu-green/10 text-zulu-green">
        Grade {item.grade}
      </span>
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
        {getSubjectName(item.subjectId)}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-zulu-green/15" />
          <div className="w-2 bg-zulu-yellow" />
          <div className="w-2 bg-zulu-red" />
          <div className="flex-1 bg-zulu-green/10" />
        </div>
        <div className="container mx-auto px-4 py-10 sm:py-12 relative">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-8 h-8 text-zulu-green" />
            <span className="text-sm font-semibold text-zulu-green uppercase tracking-wide">
              Ethiopian Curriculum
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Grade 9–12 Learning Resources
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mb-6">
            Official textbook topics for Mathematics, Physics, Chemistry, Biology, and English—search any keyword or browse by grade and subject.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl">
            <label htmlFor="learn-search" className="sr-only">
              Search topics
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                id="learn-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search topics (e.g. "cell", "force", "equation")...'
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:border-zulu-green focus:ring-2 focus:ring-zulu-green/20 text-base shadow-sm"
              />
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {isSearching && (
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold text-zulu-green">{searchResults.length}</span>{" "}
                  {searchResults.length === 1 ? "match" : "matches"} for &ldquo;
                  {searchQuery.trim()}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-sm font-medium text-zulu-red hover:underline"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
        <AIHomeworkHelper
          subjectLabel={
            grade && selectedSubject
              ? `Grade ${grade} ${selectedSubject.name} (Ethiopian curriculum)`
              : "Ethiopian Grades 9-12 curriculum (Math, Physics, Chemistry, Biology, English)"
          }
        />

        {/* Search results */}
        {isSearching && (
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-zulu-green" />
              Search Results
            </h2>
            {searchResults.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 mb-4">No topics found for your search.</p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-sm font-medium text-zulu-green hover:underline"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {searchResults.map((item) => (
                  <TopicCard
                    key={item.key}
                    topic={item}
                    searchQuery={searchQuery}
                    badge={renderSearchBadge(item)}
                  />
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Browse by grade — hidden while searching */}
        {!isSearching && (
          <>
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-zulu-green" />
                Select Grade
              </h2>
              <div className="flex flex-wrap gap-3">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGradeSelect(g)}
                    className={`min-w-[4.5rem] px-5 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
                      grade === g
                        ? "bg-zulu-green text-white border-zulu-green shadow-lg shadow-zulu-green/20"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-zulu-green/50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </section>

            {grade && (
              <section>
                <h2 className="text-lg font-bold mb-4">
                  Grade {grade} — Choose a Subject
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => handleSubjectSelect(subject.id)}
                      className={`p-4 sm:p-6 rounded-2xl border-2 text-center transition-all hover:-translate-y-0.5 ${
                        subjectId === subject.id
                          ? "border-zulu-green bg-zulu-green/5 shadow-md"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-zulu-yellow"
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl block mb-2">{subject.emoji}</span>
                      <span className="font-semibold text-sm sm:text-base">{subject.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {grade && subjectId && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <span className="h-1 w-8 bg-zulu-yellow rounded-full" />
                  <span className="h-1 w-8 bg-zulu-red rounded-full" />
                  <h2 className="text-xl font-bold">
                    Grade {grade} {selectedSubject?.emoji} {selectedSubject?.name}
                  </h2>
                  <span className="text-sm text-neutral-500 ml-auto">
                    {topics.length} topics
                  </span>
                </div>

                {loadingTopics ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-zulu-green" />
                  </div>
                ) : topics.length === 0 ? (
                  <p className="text-neutral-500">No topics available for this combination.</p>
                ) : (
                  <ul className="space-y-4">
                    {topics.map((topic) => (
                      <TopicCard
                        key={topic.title}
                        topic={topic}
                        searchQuery=""
                      />
                    ))}
                  </ul>
                )}

                <p className="mt-8 text-center text-sm text-neutral-500">
                  Need a tutor for this subject?{" "}
                  <Link href="/tutors" className="text-zulu-green font-medium hover:underline">
                    Find a tutor
                  </Link>
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
