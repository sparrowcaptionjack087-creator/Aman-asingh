import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  BookOpen,
  Code,
  Copy,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Subject, Unit, Topic, PracticeQuestion, StudentProgress } from '../types.ts';

interface TopicPageProps {
  subject: Subject;
  unit: Unit;
  topic: Topic;
  questions: PracticeQuestion[];
  studentProgress: StudentProgress;
  onToggleTopicCompleted: (topicId: string) => void;
  onBackToUnit: () => void;
  onJumpToPractice: () => void;
  onToggleBookmark: (questionId: string) => void;
}

export const TopicPage: React.FC<TopicPageProps> = ({
  subject,
  unit,
  topic,
  questions,
  studentProgress,
  onToggleTopicCompleted,
  onBackToUnit,
  onJumpToPractice,
  onToggleBookmark,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [revealedSolutions, setRevealedSolutions] = useState<{ [id: string]: boolean }>({});
  const [selectedOptions, setSelectedOptions] = useState<{ [qId: string]: string }>({});

  const isCompleted = studentProgress.completedTopicIds.includes(topic.id);
  const topicQuestions = questions.filter(
    q => q.topicId === topic.id || (q.subjectId === subject.id && q.unitNumber === unit.unitNumber)
  );

  const mcqs = topicQuestions.filter(q => q.type === 'mcq');
  const nonMcqs = topicQuestions.filter(q => q.type !== 'mcq');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const toggleSolution = (id: string) => {
    setRevealedSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          id="back-to-unit-btn"
          onClick={onBackToUnit}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Unit {unit.unitNumber} ({subject.shortName})</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="mark-completed-btn"
            onClick={() => onToggleTopicCompleted(topic.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isCompleted ? 'Marked as Completed' : 'Mark as Completed'}</span>
          </button>

          <button
            id="practice-now-btn"
            onClick={onJumpToPractice}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 transition"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Practice Now ({topicQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Topic Title & Meta Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            {subject.shortName} • Unit {unit.unitNumber}
          </span>
          <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
            topic.difficulty === 'easy'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              : topic.difficulty === 'medium'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
          }`}>
            {topic.difficulty} Level
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Estimated Study Time: {topic.estimatedMinutes} Minutes
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {topic.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {topic.description}
          </p>
        </div>
      </div>

      {/* Topic In-Depth Explanation Section */}
      <section className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
          <BookOpen className="w-4 h-4" /> Comprehensive Topic Explanation
        </div>

        <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
          <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 font-medium">
            {topic.studyMaterial.overview}
          </p>

          <p className="whitespace-pre-line leading-relaxed">
            {topic.studyMaterial.detailedExplanation}
          </p>
        </div>

        {/* Important Concepts Grid */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Core Concepts & Architectural Principles
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            {topic.studyMaterial.keyConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span>{concept}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code / Mathematical Formulation Example */}
        {topic.studyMaterial.codeOrFormulaExample && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-500" />
                {topic.studyMaterial.codeOrFormulaExample.title}
              </h3>
              <button
                id="copy-example-code-btn"
                onClick={() => handleCopyCode(topic.studyMaterial.codeOrFormulaExample!.content)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>

            <div className="rounded-2xl bg-slate-950 text-slate-100 p-5 overflow-x-auto font-mono text-xs sm:text-sm border border-slate-800 shadow-inner">
              <pre>{topic.studyMaterial.codeOrFormulaExample.content}</pre>
            </div>

            {topic.studyMaterial.codeOrFormulaExample.explanation && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Note: {topic.studyMaterial.codeOrFormulaExample.explanation}
              </p>
            )}
          </div>
        )}

        {/* Exam Tips & Applications in AI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              University Exam Tips & Common Pitfalls
            </h4>
            <ul className="text-xs text-amber-950 dark:text-amber-200 space-y-1.5">
              {topic.studyMaterial.examTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span>•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {topic.studyMaterial.applicationsInAIAndDS && (
            <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                AI & Data Science Relevance
              </h4>
              <p className="text-xs text-cyan-950 dark:text-cyan-200 leading-relaxed">
                {topic.studyMaterial.applicationsInAIAndDS}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Embedded Practice Questions Section */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Practice Questions for {topic.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Check your understanding with targeted MCQs, short answers, and previous exam questions.
            </p>
          </div>
          <button
            id="full-practice-hub-btn"
            onClick={onJumpToPractice}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open in Full Practice Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {topicQuestions.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-1">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No practice questions available yet.</p>
            <p className="text-xs text-slate-500">More questions coming soon.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* MCQs Section */}
            {mcqs.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Multiple Choice Questions (MCQs)
                </h4>
                {mcqs.map((q, idx) => {
                  const selectedOpt = selectedOptions[q.id];
                  const hasAnswered = !!selectedOpt;
                  const isCorrect = selectedOpt === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      id={`topic-mcq-${q.id}`}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Q{idx + 1} • {q.marks} Marks
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {q.difficulty}
                        </span>
                      </div>

                      <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                        {q.question}
                      </p>

                      {/* MCQ Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options?.map((opt, oIdx) => {
                          const isOptionSelected = selectedOpt === opt;
                          const isOptionCorrectAnswer = opt === q.correctAnswer;

                          let btnStyle =
                            'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200';

                          if (hasAnswered) {
                            if (isOptionCorrectAnswer) {
                              btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-semibold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-300';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              id={`mcq-opt-${q.id}-${oIdx}`}
                              onClick={() => {
                                if (!hasAnswered) {
                                  setSelectedOptions(prev => ({ ...prev, [q.id]: opt }));
                                }
                              }}
                              disabled={hasAnswered}
                              className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isOptionCorrectAnswer && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Feedback & Explanation */}
                      {hasAnswered && (
                        <div
                          className={`p-4 rounded-xl text-xs space-y-1 ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5">
                            {isCorrect ? '✓ Correct Answer!' : '✗ Incorrect Answer'}
                          </div>
                          <p className="leading-relaxed">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Non-MCQ Questions (Short, Long, Programming, Numerical) */}
            {nonMcqs.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Descriptive, Analytical & Previous University Questions
                </h4>

                {nonMcqs.map(q => {
                  const isRevealed = !!revealedSolutions[q.id];
                  return (
                    <div
                      key={q.id}
                      id={`topic-question-${q.id}`}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {q.type.replace('_', ' ')}
                          </span>
                          {q.isPreviousExamQuestion && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Previous University Exam ({q.year || 'Standard'})
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {q.marks} Marks
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                        {q.question}
                      </h4>

                      {q.hints && (
                        <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
                          <strong>Hint:</strong> {q.hints}
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          id={`toggle-sol-btn-${q.id}`}
                          onClick={() => toggleSolution(q.id)}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <span>{isRevealed ? 'Hide Model Solution' : 'Reveal Model Solution & Marking Scheme'}</span>
                          {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isRevealed && (
                          <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-800 dark:text-slate-200">
                            <div className="font-bold text-slate-900 dark:text-white">Detailed Model Answer:</div>
                            <p className="whitespace-pre-wrap leading-relaxed font-mono sm:font-sans">{q.correctAnswer}</p>
                            {q.explanation && (
                              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                                <strong>Evaluation Note:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
