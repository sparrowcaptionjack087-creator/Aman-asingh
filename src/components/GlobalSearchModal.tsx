import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Layers, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { AcademicService } from '../services/academicService.ts';
import { Subject, Unit, Topic, PracticeQuestion } from '../types.ts';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubject: (subjectId: string) => void;
  onSelectTopic: (subjectId: string, topicId: string) => void;
  onSelectPracticeQuestion: (questionId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSubject,
  onSelectTopic,
  onSelectPracticeQuestion
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sampleSearches = [
    'PPS Unit 2',
    'HTML Forms',
    'Calculus differentiation',
    'EEE circuit',
    'PE communication',
    'PCS grammar'
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = AcademicService.searchEverything(query);
  const totalResults =
    results.subjects.length +
    results.units.length +
    results.topics.length +
    results.questions.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-20 transition-opacity">
      <div
        id="global-search-dialog"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search subjects, units, topics, or questions (e.g., 'PPS Unit 2', 'Calculus differentiation')..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base focus:outline-none"
          />
          {query && (
            <button
              id="clear-search-query"
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            id="close-search-modal"
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Quick Sample Suggestions if query is empty */}
        {!query && (
          <div className="p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Suggested Popular Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {sampleSearches.map((term, i) => (
                <button
                  key={i}
                  id={`sample-search-${i}`}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition"
                >
                  🔍 {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Container */}
        {query && (
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
            {totalResults === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium">No matches found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs mt-1 text-slate-400">Try searching for subject codes (PPS, WD, Calculus) or topic names.</p>
              </div>
            ) : (
              <>
                {/* Matched Subjects */}
                {results.subjects.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Subjects ({results.subjects.length})
                    </h5>
                    <div className="space-y-1.5">
                      {results.subjects.map(s => (
                        <button
                          key={s.id}
                          id={`search-res-sub-${s.id}`}
                          onClick={() => {
                            onSelectSubject(s.id);
                            onClose();
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-slate-800 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/50 flex items-center justify-between group transition"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                {s.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {s.code}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {s.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Topics: Subject -> Unit -> Topic */}
                {results.topics.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Topics & Study Notes ({results.topics.length})
                    </h5>
                    <div className="space-y-1.5">
                      {results.topics.map(({ subject, unit, topic }) => (
                        <button
                          key={topic.id}
                          id={`search-res-topic-${topic.id}`}
                          onClick={() => {
                            onSelectTopic(subject.id, topic.id);
                            onClose();
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-slate-800 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/50 flex items-center justify-between group transition"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                {subject.shortName} → Unit {unit.unitNumber}:
                              </span>
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                {topic.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {topic.description}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Questions: Subject -> Unit -> Topic -> Question */}
                {results.questions.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Practice Questions ({results.questions.length})
                    </h5>
                    <div className="space-y-1.5">
                      {results.questions.map(q => (
                        <button
                          key={q.id}
                          id={`search-res-q-${q.id}`}
                          onClick={() => {
                            onSelectPracticeQuestion(q.id);
                            onClose();
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-amber-50/60 dark:hover:bg-slate-800 border border-transparent hover:border-amber-200 dark:hover:border-amber-900/50 flex items-center justify-between group transition"
                        >
                          <div className="max-w-[85%]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {q.subjectName} • Unit {q.unitNumber}
                              </span>
                              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                {q.type.toUpperCase()} ({q.marks}M)
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                              {q.question}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 shrink-0">
                            Practice <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
