import React from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  FileText,
  ArrowRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Subject, PracticeQuestion, StudentProgress, ActiveView, StudentAccount } from '../types.ts';
import { StudentChatSection } from './StudentChatSection.tsx';

interface HomePageProps {
  subjects: Subject[];
  questions: PracticeQuestion[];
  studentProgress: StudentProgress;
  onSelectSubject?: (subjectId: string) => void;
  onSelectTopic?: (subjectId: string, topicId: string) => void;
  onSelectQuestion?: (questionId: string) => void;
  setActiveView: (view: ActiveView) => void;
  onOpenSearch?: () => void;
  currentStudent?: StudentAccount | null;
  isAdmin?: boolean;
  onOpenAuth?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  subjects,
  questions: _questions,
  studentProgress,
  onSelectSubject: _onSelectSubject,
  onSelectTopic: _onSelectTopic,
  onSelectQuestion: _onSelectQuestion,
  setActiveView,
  onOpenSearch: _onOpenSearch,
  currentStudent = null,
  isAdmin = false,
  onOpenAuth,
}) => {
  // Compute overall completion
  const totalTopicsCount = subjects.reduce(
    (acc, sub) => acc + sub.units.reduce((uAcc, unit) => uAcc + unit.topics.length, 0),
    0
  );
  const completedCount = studentProgress.completedTopicIds.length;
  const overallPercentage = totalTopicsCount > 0 ? Math.round((completedCount / totalTopicsCount) * 100) : 0;

  // Compute question practice stats
  const questionsAttempted = studentProgress.quizAttempts.reduce((acc, a) => acc + a.totalQuestions, 0);
  const correctQuestions = studentProgress.quizAttempts.reduce((acc, a) => acc + a.correctAnswers, 0);
  const accuracyRate = questionsAttempted > 0 ? Math.round((correctQuestions / questionsAttempted) * 100) : 0;

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-indigo-50/70 via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Department Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold border border-indigo-200 dark:border-indigo-800/80 shadow-xs">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>B.Tech CSE – Artificial Intelligence & Data Science</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">Academic Companion</span>
            </h1>

            {/* Short Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Centralized syllabus guidelines, unit-wise in-depth study notes, interactive practice questions, and timed semester examination papers engineered for AI & DS students.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="hero-explore-syllabus-btn"
                onClick={() => { setActiveView('syllabus'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition hover:scale-102"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Syllabus</span>
              </button>

              <button
                id="hero-practice-questions-btn"
                onClick={() => { setActiveView('practice'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-2 transition hover:scale-102"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Practice Questions</span>
              </button>

              <button
                id="hero-question-papers-btn"
                onClick={() => { setActiveView('question-papers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-6 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-sm border border-indigo-200 dark:border-indigo-800 shadow-xs flex items-center gap-2 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Practice Papers</span>
              </button>

              <button
                id="hero-student-chat-btn"
                onClick={() => {
                  const el = document.getElementById('student-chat-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 font-semibold text-sm border border-cyan-200 dark:border-cyan-800 shadow-xs flex items-center gap-2 transition hover:scale-102"
              >
                <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Student Chat</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Study Progress Section & Quick Access */}
        <section className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
                  <TrendingUp className="w-3.5 h-3.5" /> Live Study Progress
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-medium">
                  Semester I & II
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white">
                  {overallPercentage}%
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Overall syllabus topics marked as completed ({completedCount} of {totalTopicsCount} topics).
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all duration-700"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats Highlights & Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[130px]">
                  <div className="text-xs text-slate-300">Practice Score</div>
                  <div className="text-xl font-bold text-white mt-0.5">{accuracyRate}%</div>
                  <div className="text-[11px] text-emerald-400">Accuracy rate</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[130px]">
                  <div className="text-xs text-slate-300">Questions Done</div>
                  <div className="text-xl font-bold text-white mt-0.5">{questionsAttempted}</div>
                  <div className="text-[11px] text-cyan-300">Attempted</div>
                </div>
              </div>

              <button
                id="dashboard-deep-dive-btn"
                onClick={() => { setActiveView('progress'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition flex items-center justify-center gap-2 whitespace-nowrap self-stretch sm:self-auto"
              >
                <span>View Full Analytics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Student Chatting & Discussion Section */}
        <StudentChatSection
          currentStudent={currentStudent}
          isAdmin={isAdmin}
          onOpenAuth={onOpenAuth}
        />
      </div>
    </div>
  );
};
