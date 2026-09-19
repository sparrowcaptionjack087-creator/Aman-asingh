import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Filter,
  Layers
} from 'lucide-react';
import { Subject, QuestionPaper, StudentProgress } from '../types.ts';

interface QuestionPapersSectionProps {
  subjects: Subject[];
  questionPapers: QuestionPaper[];
  studentProgress: StudentProgress;
  onRecordPaperAttempt: (attempt: {
    paperId: string;
    score: number;
    totalMarks: number;
    percentage: number;
    timeSpentSeconds: number;
  }) => void;
  initialPaperId?: string | null;
}

export const QuestionPapersSection: React.FC<QuestionPapersSectionProps> = ({
  subjects,
  questionPapers,
  studentProgress,
  onRecordPaperAttempt,
  initialPaperId,
}) => {
  // Selector state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);

  // Active examination state
  const [isExamActive, setIsExamActive] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qNum: number]: string }>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [evaluatedScore, setEvaluatedScore] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // If initialPaperId passed, auto-select it
  useEffect(() => {
    if (initialPaperId) {
      const found = questionPapers.find(p => p.id === initialPaperId);
      if (found) setSelectedPaper(found);
    }
  }, [initialPaperId, questionPapers]);

  // Timer countdown during exam
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isExamActive && !isExamSubmitted && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer!);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isExamActive, isExamSubmitted, timeLeftSeconds]);

  const filteredPapers = questionPapers.filter(
    p => selectedSubjectId === 'all' || p.subjectId === selectedSubjectId
  );

  const handleStartPaper = (paper: QuestionPaper) => {
    setSelectedPaper(paper);
    setTimeLeftSeconds(paper.durationMinutes * 60);
    setTimeSpent(0);
    setUserAnswers({});
    setIsExamActive(true);
    setIsExamSubmitted(false);
    setShowSolutions(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitExam = () => {
    if (!selectedPaper) return;
    setIsExamActive(false);
    setIsExamSubmitted(true);

    // Calculate score based on MCQs and answered items
    let score = 0;
    selectedPaper.sections.forEach(sec => {
      sec.questions.forEach(q => {
        const uAns = (userAnswers[q.questionNumber] || '').trim().toLowerCase();
        const cAns = q.answer.trim().toLowerCase();
        if (uAns && (uAns === cAns || cAns.includes(uAns) || uAns.includes(cAns))) {
          score += q.marks;
        }
      });
    });

    // Provide reasonable baseline for long answers if student wrote text
    let writtenBonus = 0;
    selectedPaper.sections.forEach(sec => {
      sec.questions.forEach(q => {
        const text = userAnswers[q.questionNumber] || '';
        if (q.type !== 'mcq' && text.length > 20) {
          writtenBonus += Math.round(q.marks * 0.75);
        }
      });
    });

    const finalScore = Math.min(selectedPaper.totalMarks, Math.max(score, writtenBonus));
    setEvaluatedScore(finalScore);

    const percentage = Math.round((finalScore / selectedPaper.totalMarks) * 100);

    onRecordPaperAttempt({
      paperId: selectedPaper.id,
      score: finalScore,
      totalMarks: selectedPaper.totalMarks,
      percentage,
      timeSpentSeconds: timeSpent,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Examination Environment
  if (isExamActive && selectedPaper) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Sticky Exam Top Bar */}
        <div className="sticky top-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Exam in Progress • {selectedPaper.subjectName}
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedPaper.title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono font-bold text-sm">
              <Clock className="w-4 h-4 animate-pulse text-amber-600" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <button
              id="submit-exam-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to submit your question paper now?')) {
                  handleSubmitExam();
                }
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition"
            >
              Submit Paper
            </button>
          </div>
        </div>

        {/* Exam Paper Questions Body */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 space-y-8">
          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Examination Instructions
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              {selectedPaper.instructions.map((ins, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span>•</span>
                  <span>{ins}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections & Questions */}
          {selectedPaper.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {section.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {section.instructions}
                </p>
              </div>

              <div className="space-y-6">
                {section.questions.map(q => (
                  <div
                    key={q.questionNumber}
                    className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        Question {q.questionNumber}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {q.marks} Marks
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {q.question}
                    </p>

                    {/* MCQ Options or Text Area */}
                    {q.type === 'mcq' && q.options ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            id={`exam-q-${q.questionNumber}-opt-${oIdx}`}
                            onClick={() =>
                              setUserAnswers(prev => ({
                                ...prev,
                                [q.questionNumber]: opt,
                              }))
                            }
                            className={`p-3 rounded-xl border text-xs sm:text-sm text-left transition ${
                              userAnswers[q.questionNumber] === opt
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 text-indigo-900 dark:text-indigo-200 font-semibold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                            }`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-2">
                        <textarea
                          id={`exam-textarea-${q.questionNumber}`}
                          rows={3}
                          value={userAnswers[q.questionNumber] || ''}
                          onChange={e =>
                            setUserAnswers(prev => ({
                              ...prev,
                              [q.questionNumber]: e.target.value,
                            }))
                          }
                          placeholder="Type your answer, key steps, or algorithmic points here..."
                          className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button
              id="final-submit-paper-btn"
              onClick={handleSubmitExam}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition"
            >
              Submit Final Question Paper
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Exam Results & Solution Viewer
  if (isExamSubmitted && selectedPaper) {
    const percentage = Math.round((evaluatedScore / selectedPaper.totalMarks) * 100);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Scorecard */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 text-center space-y-6 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Paper Evaluation Result
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {selectedPaper.title} • {selectedPaper.subjectName}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500">Marks Scored</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {evaluatedScore} / {selectedPaper.totalMarks}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
              <div className="text-xs text-indigo-700 dark:text-indigo-400">Percentage</div>
              <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
                {percentage}%
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500">Time Taken</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {formatTime(timeSpent)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="view-solutions-btn"
              onClick={() => setShowSolutions(!showSolutions)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition"
            >
              <Eye className="w-4 h-4" />
              <span>{showSolutions ? 'Hide Solutions' : 'View Complete Solutions'}</span>
            </button>

            <button
              id="retake-paper-btn"
              onClick={() => handleStartPaper(selectedPaper)}
              className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Paper</span>
            </button>

            <button
              id="back-to-papers-list-btn"
              onClick={() => {
                setIsExamSubmitted(false);
                setSelectedPaper(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-200 transition"
            >
              Back to Question Papers
            </button>
          </div>
        </div>

        {/* Step-by-Step Solutions */}
        {showSolutions && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Official Marking Scheme & Step-by-Step Solutions
            </h3>

            {selectedPaper.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {section.title}
                </h4>

                <div className="space-y-4">
                  {section.questions.map(q => (
                    <div
                      key={q.questionNumber}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900 dark:text-white">
                          Q{q.questionNumber}: {q.question}
                        </span>
                        <span className="text-indigo-600">{q.marks} Marks</span>
                      </div>

                      <div className="text-slate-600 dark:text-slate-400">
                        Your submitted answer:{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {userAnswers[q.questionNumber] || '(Left Blank)'}
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200 space-y-1">
                        <div className="font-bold">Correct Solution:</div>
                        <p className="whitespace-pre-wrap leading-relaxed font-mono sm:font-sans">{q.answer}</p>
                        {q.detailedSolution && (
                          <p className="pt-1 text-xs text-emerald-800 dark:text-emerald-300">
                            <strong>Marking Rubric:</strong> {q.detailedSolution}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Papers Catalog Browser
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" /> Examination Simulator
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Academic Question Papers & Class Tests
          </h1>
          <p className="text-sm text-slate-300">
            Select unit tests, mid-semester papers, or full subject question papers to test your exam preparedness under realistic timed constraints.
          </p>
        </div>

        {/* Subject Filter Dropdown */}
        <div className="bg-white/10 p-3 rounded-2xl border border-white/10 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Filter by Subject
          </label>
          <select
            id="papers-subject-filter"
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="all">All Subjects ({questionPapers.length} Papers)</option>
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
      </div>

      {/* Question Papers Cards Grid */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800/90 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Practice Papers Available
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            All practice papers have been removed. Faculty and administrators can upload or create examination papers from the admin portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map(paper => {
            const attempt = studentProgress.paperAttempts.find(a => a.paperId === paper.id);

            return (
              <div
                key={paper.id}
                id={`paper-card-${paper.id}`}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-indigo-400 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {paper.paperType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {paper.durationMinutes} Mins
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {paper.subjectName} {paper.unitNumber ? `• Unit ${paper.unitNumber}` : '• Full Syllabus'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {paper.title}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                    <div>Total Marks: <strong className="text-slate-800 dark:text-slate-200">{paper.totalMarks} Marks</strong></div>
                    <div>Sections: {paper.sections.length} Parts ({paper.sections.reduce((acc, s) => acc + s.questions.length, 0)} Questions)</div>
                  </div>

                  {attempt && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span>Previous Score:</span>
                      <strong className="font-bold">{attempt.score}/{attempt.totalMarks} ({attempt.percentage}%)</strong>
                    </div>
                  )}
                </div>

                <button
                  id={`start-paper-${paper.id}`}
                  onClick={() => handleStartPaper(paper)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition"
                >
                  <span>{attempt ? 'Retake Paper' : 'Start Paper'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
