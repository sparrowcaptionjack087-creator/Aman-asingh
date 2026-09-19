import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Calendar,
  User,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Filter,
  GraduationCap,
  Layers,
  FileText
} from 'lucide-react';
import { Subject, ClassDiscussion, ActiveView } from '../types.ts';

interface ClassDiscussionSectionProps {
  subjects: Subject[];
  discussions: ClassDiscussion[];
  onSelectSubject: (subjectId: string) => void;
  onOpenAdmin?: (initialTab?: string, initialSubjectId?: string) => void;
  isAdmin?: boolean;
  onCleanAllDiscussions?: () => void;
}

export const ClassDiscussionSection: React.FC<ClassDiscussionSectionProps> = ({
  subjects,
  discussions,
  onSelectSubject,
  onOpenAdmin: _onOpenAdmin,
  isAdmin: _isAdmin,
  onCleanAllDiscussions: _onCleanAllDiscussions
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter discussions
  const filteredDiscussions = useMemo(() => {
    return discussions.filter(disc => {
      // Semester filter
      if (selectedSemester !== 'all' && disc.semester.toString() !== selectedSemester) {
        return false;
      }
      // Subject filter
      if (selectedSubjectId !== 'all' && disc.subjectId !== selectedSubjectId) {
        return false;
      }
      // Unit filter
      if (selectedUnit !== 'all' && disc.unitNumber.toString() !== selectedUnit) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesText =
          disc.discussionText.toLowerCase().includes(q) ||
          disc.classSessionTitle.toLowerCase().includes(q) ||
          disc.subjectName.toLowerCase().includes(q) ||
          (disc.shortName && disc.shortName.toLowerCase().includes(q)) ||
          disc.unitName.toLowerCase().includes(q) ||
          `unit ${disc.unitNumber}`.includes(q) ||
          (disc.facultyName && disc.facultyName.toLowerCase().includes(q));
        if (!matchesText) return false;
      }
      return true;
    });
  }, [discussions, selectedSemester, selectedSubjectId, selectedUnit, searchQuery]);

  // Available subjects for current semester filter
  const availableSubjects = useMemo(() => {
    if (selectedSemester === 'all') return subjects;
    return subjects.filter(s => s.semester.toString() === selectedSemester);
  }, [subjects, selectedSemester]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Real-Time Classroom Academic Updates</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Class Discussion & Unit Coverage
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Find out which unit is currently being discussed in class for each subject. Review detailed faculty notes, board explanations, student Q&A, and homework tasks recorded as text forms.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 space-y-4 shadow-xs">
        {/* Semester Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Semester:
          </span>
          <button
            onClick={() => {
              setSelectedSemester('all');
              setSelectedSubjectId('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedSemester === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            All Semesters ({discussions.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
            const count = discussions.filter(d => d.semester === sem).length;
            return (
              <button
                key={sem}
                onClick={() => {
                  setSelectedSemester(sem.toString());
                  setSelectedSubjectId('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedSemester === sem.toString()
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span>Sem {sem}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedSemester === sem.toString() ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Secondary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search discussion text, topics, units..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject Select */}
          <div>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Subjects in Current View</option>
              {availableSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  Sem {sub.semester}: {sub.shortName} – {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <select
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Units Discussed</option>
              {[1, 2, 3, 4, 5, 6].map(u => (
                <option key={u} value={u.toString()}>
                  Unit {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Discussions Feed */}
      {filteredDiscussions.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {discussions.length === 0 ? 'Class Discussion is Clean' : 'No Class Discussions Match Filters'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {discussions.length === 0
                ? 'All classroom discussion logs, notes, and records are clean.'
                : 'No classroom discussion notes match your active filter and search criteria.'}
            </p>
          </div>
          {(selectedSemester !== 'all' || selectedSubjectId !== 'all' || selectedUnit !== 'all' || searchQuery.trim() !== '') && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setSelectedSemester('all');
                  setSelectedSubjectId('all');
                  setSelectedUnit('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDiscussions.map(disc => {
            const isCopied = copiedId === disc.id;
            return (
              <article
                key={disc.id}
                id={`class-disc-${disc.id}`}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
              >
                {/* Discussion Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700/70 pb-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {disc.shortName || disc.subjectName}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Semester {disc.semester}
                      </span>
                      {/* SPECIFIC BADGE: WHICH UNIT IS DISCUSSED ON THE CLASS */}
                      <span className="text-xs font-bold px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Discussed in Class: Unit {disc.unitNumber}</span>
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {disc.classSessionTitle}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        Class Date: <strong className="text-slate-700 dark:text-slate-200">{disc.date}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Target Unit: <strong className="text-slate-700 dark:text-slate-200">Unit {disc.unitNumber} ({disc.unitName})</strong>
                      </span>
                      {disc.facultyName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-indigo-500" />
                            Instructor: <strong className="text-slate-700 dark:text-slate-200">{disc.facultyName}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleCopyText(disc.id, `${disc.classSessionTitle}\nUnit ${disc.unitNumber}: ${disc.unitName}\n\n${disc.discussionText}`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
                      title="Copy classroom discussion text to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Notes</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSelectSubject(disc.subjectId)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <span>Subject Hub</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* THE TEXT FORM DISCUSSION CONTENT */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Classroom Discussion Notes (Text Form)</span>
                  </div>
                  <div className="bg-slate-50/90 dark:bg-slate-900/60 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                    {disc.discussionText}
                  </div>
                </div>

                {/* Key Points / Bullets */}
                {disc.keyPoints && disc.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Key Takeaways & Core Concepts Discussed:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {disc.keyPoints.map((point, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-start gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Homework / Action Item */}
                {disc.homeworkOrTask && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <strong className="text-amber-900 dark:text-amber-200 font-bold">
                        Homework / Follow-up for Next Class:
                      </strong>
                      <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                        {disc.homeworkOrTask}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
