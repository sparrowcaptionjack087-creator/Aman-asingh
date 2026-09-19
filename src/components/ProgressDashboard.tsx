import React from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Clock,
  Bookmark,
  ChevronRight,
  Flame
} from 'lucide-react';
import { Subject, PracticeQuestion, StudentProgress } from '../types.ts';

interface ProgressDashboardProps {
  subjects: Subject[];
  questions: PracticeQuestion[];
  studentProgress: StudentProgress;
  onResetProgress: () => void;
  onSelectSubject: (subjectId: string) => void;
  onSelectQuestion: (questionId: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  subjects,
  questions,
  studentProgress,
  onResetProgress,
  onSelectSubject,
  onSelectQuestion,
}) => {
  // Aggregate Metrics
  const totalTopics = subjects.reduce(
    (acc, sub) => acc + sub.units.reduce((uAcc, unit) => uAcc + unit.topics.length, 0),
    0
  );
  const completedTopicsCount = studentProgress.completedTopicIds.length;
  const overallTopicPercentage = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  const totalQuestionsAttempted = studentProgress.quizAttempts.reduce((acc, a) => acc + a.totalQuestions, 0);
  const totalCorrect = studentProgress.quizAttempts.reduce((acc, a) => acc + a.correctAnswers, 0);
  const totalWrong = studentProgress.quizAttempts.reduce((acc, a) => acc + a.wrongAnswers, 0);
  const overallAccuracy =
    totalQuestionsAttempted > 0 ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) : 0;

  const bookmarkedQuestions = questions.filter(q =>
    studentProgress.bookmarkedQuestionIds.includes(q.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold">
            <LayoutDashboard className="w-3.5 h-3.5" /> Student Learning Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Academic Progress & Practice Metrics
          </h1>
          <p className="text-sm text-slate-300">
            Monitor topic coverage across all 6 AI & DS semester subjects, track quiz accuracy, and review bookmarked questions.
          </p>
        </div>

        <button
          id="reset-all-progress-btn"
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all your completed topics and quiz stats?')) {
              onResetProgress();
            }
          }}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Study Progress</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Completed Topics */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Syllabus Topics Done
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {completedTopicsCount} / {totalTopics}
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            {overallTopicPercentage}% Syllabus Mastered
          </div>
        </div>

        {/* Practice Accuracy */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overall Accuracy
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {overallAccuracy}%
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {totalCorrect} Correct of {totalQuestionsAttempted} Questions
          </div>
        </div>

        {/* Questions Attempted */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Questions Solved
            </span>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalQuestionsAttempted}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {totalWrong} Incorrect Solutions
          </div>
        </div>

        {/* Bookmarked Questions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bookmarked for Exam
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {studentProgress.bookmarkedQuestionIds.length}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
            Starred Revision Items
          </div>
        </div>
      </div>

      {/* Subject-Wise Progress Cards Breakdown */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Subject-Wise Syllabus & Practice Progress
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => {
            const subTotalTopics = subject.units.reduce((acc, u) => acc + u.topics.length, 0);
            const subCompletedTopics = subject.units.reduce(
              (acc, u) =>
                acc + u.topics.filter(t => studentProgress.completedTopicIds.includes(t.id)).length,
              0
            );
            const subPercentage = subTotalTopics > 0 ? Math.round((subCompletedTopics / subTotalTopics) * 100) : 0;

            const subAttempts = studentProgress.quizAttempts.filter(a => a.subjectId === subject.id);
            const subQuestionsSolved = subAttempts.reduce((acc, a) => acc + a.totalQuestions, 0);
            const subCorrect = subAttempts.reduce((acc, a) => acc + a.correctAnswers, 0);
            const subAccuracy = subQuestionsSolved > 0 ? Math.round((subCorrect / subQuestionsSolved) * 100) : 0;

            return (
              <div
                key={subject.id}
                id={`progress-card-${subject.id}`}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {subject.code}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {subPercentage}% Done
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {subject.shortName} – {subject.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {subCompletedTopics} of {subTotalTopics} topics completed across {subject.units.length} units
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${subPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400">Questions</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">{subQuestionsSolved} solved</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400">Accuracy</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{subAccuracy}%</div>
                    </div>
                  </div>
                </div>

                <button
                  id={`continue-study-btn-${subject.id}`}
                  onClick={() => onSelectSubject(subject.id)}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition flex items-center justify-center gap-1.5"
                >
                  <span>Continue Subject Study</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bookmarked Questions Quick-Access Section */}
      {bookmarkedQuestions.length > 0 && (
        <section className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-lg">
            <Bookmark className="w-5 h-5 text-amber-500" />
            Bookmarked Questions for Quick Revision ({bookmarkedQuestions.length})
          </div>
          <p className="text-xs text-amber-900/80 dark:text-amber-300">
            Questions you flagged during practice for final exam revision:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {bookmarkedQuestions.map(q => (
              <div
                key={q.id}
                id={`bookmark-card-${q.id}`}
                onClick={() => onSelectQuestion(q.id)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-amber-400 transition cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {q.subjectName} • Unit {q.unitNumber}
                    </span>
                    <span className="text-amber-600 font-bold">{q.marks} Marks</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-600 transition">
                    {q.question}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center justify-between">
                  <span>Solve Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
