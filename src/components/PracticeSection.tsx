import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Bookmark,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Layers,
  Search
} from 'lucide-react';
import { Subject, PracticeQuestion, DifficultyLevel, QuestionType, StudentProgress } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';

interface PracticeSectionProps {
  subjects: Subject[];
  questions: PracticeQuestion[];
  studentProgress: StudentProgress;
  onRecordQuizAttempt: (attempt: {
    subjectId: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    percentage: number;
  }) => void;
  onToggleBookmark: (questionId: string) => void;
  initialQuestionId?: string | null;
  isAdmin?: boolean;
  onCleanAllQuestions?: () => void;
}

type PracticeMode = 'interactive_mcq' | 'browse_bank';

export const PracticeSection: React.FC<PracticeSectionProps> = ({
  subjects,
  questions,
  studentProgress,
  onRecordQuizAttempt,
  onToggleBookmark,
  initialQuestionId,
  isAdmin,
  onCleanAllQuestions,
}) => {
  // Filter States
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mode state
  const [mode, setMode] = useState<PracticeMode>('interactive_mcq');

  // Interactive Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<{
    question: PracticeQuestion;
    userChoice: string;
    isCorrect: boolean;
  }[]>([]);

  // Browse Mode State
  const [revealedSolutions, setRevealedSolutions] = useState<{ [qId: string]: boolean }>({});

  // Get active units for selected subject
  const availableUnits = useMemo(() => {
    if (selectedSubjectId === 'all') return [];
    const sub = subjects.find(s => s.id === selectedSubjectId);
    return sub ? sub.units : [];
  }, [subjects, selectedSubjectId]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (selectedSubjectId !== 'all' && q.subjectId !== selectedSubjectId) return false;
      if (selectedUnit !== 'all' && q.unitNumber.toString() !== selectedUnit) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        return (
          q.question.toLowerCase().includes(term) ||
          q.explanation.toLowerCase().includes(term) ||
          q.topicName.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [questions, selectedSubjectId, selectedUnit, selectedDifficulty, selectedType, searchQuery]);

  // Subset of MCQs for interactive quiz mode
  const interactiveMcqPool = useMemo(() => {
    return filteredQuestions.filter(q => q.type === 'mcq');
  }, [filteredQuestions]);

  const currentMcq = interactiveMcqPool[quizIndex];

  const handleSelectAnswer = (option: string) => {
    if (hasAnswered || !currentMcq) return;
    setSelectedAnswer(option);
    setHasAnswered(true);

    const isCorrect = option === currentMcq.correctAnswer;
    if (isCorrect) {
      setQuizScore(prev => prev + currentMcq.marks);
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      setWrongAnswersCount(prev => prev + 1);
    }

    setAnswersHistory(prev => [
      ...prev,
      {
        question: currentMcq,
        userChoice: option,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (quizIndex + 1 < interactiveMcqPool.length) {
      setQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      // Quiz complete
      setIsQuizCompleted(true);
      const totalQ = interactiveMcqPool.length;
      const finalPercentage = totalQ > 0 ? Math.round((correctAnswersCount / totalQ) * 100) : 0;

      onRecordQuizAttempt({
        subjectId: selectedSubjectId === 'all' ? 'mixed' : selectedSubjectId,
        totalQuestions: totalQ,
        correctAnswers: correctAnswersCount,
        wrongAnswers: wrongAnswersCount,
        score: quizScore,
        percentage: finalPercentage,
      });
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setQuizScore(0);
    setCorrectAnswersCount(0);
    setWrongAnswersCount(0);
    setIsQuizCompleted(false);
    setAnswersHistory([]);
  };

  const toggleSolution = (id: string) => {
    setRevealedSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Practice Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Department Practice Question Bank
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Practice & Self-Assessment System
          </h1>
          <p className="text-sm text-slate-300">
            Select specific subjects, units, or question types to sharpen conceptual clarity and prepare for university exams.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl flex items-center shrink-0 border border-white/10">
          <button
            id="mode-interactive-mcq-btn"
            onClick={() => {
              setMode('interactive_mcq');
              handleRestartQuiz();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              mode === 'interactive_mcq'
                ? 'bg-white text-indigo-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            MCQ Quiz Mode
          </button>
          <button
            id="mode-browse-bank-btn"
            onClick={() => setMode('browse_bank')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              mode === 'browse_bank'
                ? 'bg-white text-indigo-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Browse Question Bank
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Filter className="w-4 h-4" /> Filter Practice Questions
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Subject Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Subject
            </label>
            <select
              id="filter-subject"
              value={selectedSubjectId}
              onChange={e => {
                setSelectedSubjectId(e.target.value);
                setSelectedUnit('all');
                handleRestartQuiz();
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Subjects ({subjects.length})</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                const semSubs = subjects.filter(s => s.semester === sem);
                if (semSubs.length === 0) return null;
                return (
                  <optgroup key={sem} label={`Semester ${sem}`}>
                    {semSubs.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.shortName} – {s.name} [Sem {s.semester}]
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Unit
            </label>
            <select
              id="filter-unit"
              value={selectedUnit}
              onChange={e => {
                setSelectedUnit(e.target.value);
                handleRestartQuiz();
              }}
              disabled={selectedSubjectId === 'all'}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="all">All Units</option>
              {availableUnits.map(u => (
                <option key={u.unitNumber} value={u.unitNumber.toString()}>
                  Unit {u.unitNumber}: {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Difficulty
            </label>
            <select
              id="filter-difficulty"
              value={selectedDifficulty}
              onChange={e => {
                setSelectedDifficulty(e.target.value);
                handleRestartQuiz();
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>

          {/* Question Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Question Type
            </label>
            <select
              id="filter-type"
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                handleRestartQuiz();
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="fill_blank">Fill in the Blanks</option>
              <option value="short_answer">Short Answer</option>
              <option value="long_answer">Long Answer</option>
              <option value="programming">Programming</option>
              <option value="numerical">Numerical Problem</option>
            </select>
          </div>

          {/* Text Search in Question Bank */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Search Keywords
            </label>
            <div className="relative">
              <input
                id="filter-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Keywords..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>
        </div>

        {/* Active Filter Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredQuestions.length}</strong> matching questions (
            <strong className="text-indigo-600 dark:text-indigo-400">{interactiveMcqPool.length}</strong> MCQs available for interactive quiz)
          </span>

          {(selectedSubjectId !== 'all' ||
            selectedUnit !== 'all' ||
            selectedDifficulty !== 'all' ||
            selectedType !== 'all' ||
            searchQuery) && (
            <button
              id="reset-practice-filters-btn"
              onClick={() => {
                setSelectedSubjectId('all');
                setSelectedUnit('all');
                setSelectedDifficulty('all');
                setSelectedType('all');
                setSearchQuery('');
                handleRestartQuiz();
              }}
              className="font-semibold text-rose-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: INTERACTIVE MCQ QUIZ SYSTEM */}
      {mode === 'interactive_mcq' && (
        <div className="space-y-6">
          {interactiveMcqPool.length === 0 ? (
            questions.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-8 space-y-3 max-w-xl mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Practice Question Bank is Clean
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    All practice questions have been cleaned from the database. There are currently no practice questions available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-3">
                <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  No MCQs match the selected filters.
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try switching the Question Type filter to &ldquo;All Types&rdquo; or &ldquo;MCQ&rdquo;, or reset filters to browse the entire department question bank.
                </p>
                <button
                  onClick={() => setMode('browse_bank')}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Browse All Questions
                </button>
              </div>
            )
          ) : isQuizCompleted ? (
            /* Quiz Results Screen */
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-10 shadow-lg text-center space-y-8 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Practice Quiz Completed!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Great job practicing. Here is your detailed performance breakdown:
                </p>
              </div>

              {/* Scorecard Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500">Total Questions</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {interactiveMcqPool.length}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400">Correct Answers</div>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    {correctAnswersCount}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  <div className="text-xs text-rose-700 dark:text-rose-400">Wrong Answers</div>
                  <div className="text-xl font-bold text-rose-700 dark:text-rose-400 mt-1">
                    {wrongAnswersCount}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                  <div className="text-xs text-indigo-700 dark:text-indigo-400">Percentage</div>
                  <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
                    {Math.round((correctAnswersCount / interactiveMcqPool.length) * 100)}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  id="retry-quiz-btn"
                  onClick={handleRestartQuiz}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Test</span>
                </button>

                <button
                  id="browse-questions-after-quiz-btn"
                  onClick={() => setMode('browse_bank')}
                  className="px-6 py-3 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Browse Full Question Bank
                </button>
              </div>

              {/* Review All Questions with Explanations */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 text-left space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Review Question Solutions
                </h3>

                <div className="space-y-4">
                  {answersHistory.map(({ question, userChoice, isCorrect }, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-900 dark:text-white">
                          Q{idx + 1}: {question.question}
                        </span>
                        <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          {isCorrect ? '✓ Correct' : '✗ Wrong'}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        Your choice: <strong className="text-slate-900 dark:text-white">{userChoice}</strong>
                      </div>
                      {!isCorrect && (
                        <div className="text-emerald-700 dark:text-emerald-400">
                          Correct answer: <strong>{question.correctAnswer}</strong>
                        </div>
                      )}
                      <p className="text-slate-500 dark:text-slate-400 italic pt-1">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Single Question Interactive MCQ Quiz View */
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
              {/* Question Header Status */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Question {quizIndex + 1} of {interactiveMcqPool.length}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {currentMcq.subjectName} • Unit {currentMcq.unitNumber}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    currentMcq.difficulty === 'easy'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : currentMcq.difficulty === 'medium'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  }`}>
                    {currentMcq.difficulty}
                  </span>
                </div>

                {/* Bookmark Button */}
                <button
                  id={`bookmark-btn-${currentMcq.id}`}
                  onClick={() => onToggleBookmark(currentMcq.id)}
                  className={`p-2 rounded-lg border transition ${
                    studentProgress.bookmarkedQuestionIds.includes(currentMcq.id)
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                  }`}
                  title="Bookmark question for revision"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentMcq.question}
                </h3>
                {currentMcq.hints && !hasAnswered && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                    Hint: {currentMcq.hints}
                  </p>
                )}
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {currentMcq.options?.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentMcq.correctAnswer;

                  let style =
                    'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200';

                  if (hasAnswered) {
                    if (isCorrect) {
                      style =
                        'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold';
                    } else if (isSelected) {
                      style =
                        'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-300';
                    } else {
                      style = 'opacity-60 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`quiz-option-${idx}`}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={hasAnswered}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status & Explanation Box after selecting */}
              {hasAnswered && (
                <div
                  className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 animate-in fade-in duration-300 ${
                    selectedAnswer === currentMcq.correctAnswer
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {selectedAnswer === currentMcq.correctAnswer
                        ? '✓ Correct Answer!'
                        : '✗ Incorrect!'}
                    </span>
                    <span>Correct Answer: {currentMcq.correctAnswer}</span>
                  </div>
                  <p className="leading-relaxed">
                    <strong>Detailed Explanation:</strong> {currentMcq.explanation}
                  </p>
                </div>
              )}

              {/* Bottom Next Question Button */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/80">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Current Score: <strong className="text-slate-900 dark:text-white">{quizScore} Points</strong>
                </div>

                <button
                  id="quiz-next-question-btn"
                  onClick={handleNextQuestion}
                  disabled={!hasAnswered}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
                >
                  <span>{quizIndex + 1 === interactiveMcqPool.length ? 'Finish & See Results' : 'Next Question'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: BROWSE COMPLETE QUESTION BANK */}
      {mode === 'browse_bank' && (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            questions.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-8 space-y-3 max-w-xl mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Practice Question Bank is Clean
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    All practice questions have been cleaned from the database. There are currently no practice questions available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-2">
                <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No questions found matching criteria.</h3>
                <p className="text-xs text-slate-500">Try changing your filters or searching with a different keyword.</p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const isRevealed = !!revealedSolutions[q.id];
                const isBookmarked = studentProgress.bookmarkedQuestionIds.includes(q.id);

                return (
                  <div
                    key={q.id}
                    id={`browse-q-${q.id}`}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {q.subjectName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Unit {q.unitNumber} • {q.topicName}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          q.difficulty === 'easy'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : q.difficulty === 'medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                          {q.type.replace('_', ' ')} • {q.marks} Marks
                        </span>
                      </div>

                      <button
                        id={`browse-bookmark-${q.id}`}
                        onClick={() => onToggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          isBookmarked
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                        }`}
                        title="Bookmark question"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                      {q.question}
                    </h4>

                    {/* Options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border text-xs ${
                              isRevealed && opt === q.correctAnswer
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold'
                                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Solution Reveal Toggle */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <button
                        id={`browse-solution-toggle-${q.id}`}
                        onClick={() => toggleSolution(q.id)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide Solution
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> View Solution & Explanation
                          </>
                        )}
                      </button>

                      {q.hints && (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                          Hint available
                        </span>
                      )}
                    </div>

                    {isRevealed && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-800 dark:text-slate-200">
                        <div className="font-bold text-slate-900 dark:text-white">Correct Answer:</div>
                        <div className="whitespace-pre-wrap font-mono sm:font-sans leading-relaxed text-emerald-700 dark:text-emerald-400">
                          {q.correctAnswer}
                        </div>
                        <div className="pt-1 text-slate-600 dark:text-slate-300">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
