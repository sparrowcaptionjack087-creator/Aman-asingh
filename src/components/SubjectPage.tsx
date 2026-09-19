import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Layers,
  Sparkles,
  ArrowRight,
  ListCheck,
  Check,
  ExternalLink,
  Flame,
  Download,
  Info
} from 'lucide-react';
import { Subject, PracticeQuestion, QuestionPaper, StudentProgress } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';
import { SyllabusViewerModal } from './SyllabusViewerModal.tsx';

interface SubjectPageProps {
  subject: Subject;
  questions: PracticeQuestion[];
  questionPapers: QuestionPaper[];
  studentProgress: StudentProgress;
  onSelectTopic: (subjectId: string, topicId: string) => void;
  onToggleTopicCompleted: (topicId: string) => void;
  onSelectPracticeQuestion: (questionId: string) => void;
  onSelectPaper: (paperId: string) => void;
  onBackToSubjects: () => void;
}

type TabType = 'syllabus' | 'practice' | 'papers' | 'important';

export const SubjectPage: React.FC<SubjectPageProps> = ({
  subject,
  questions,
  questionPapers,
  studentProgress,
  onSelectTopic,
  onToggleTopicCompleted,
  onSelectPracticeQuestion,
  onSelectPaper,
  onBackToSubjects,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('syllabus');
  const [isViewingSyllabusModal, setIsViewingSyllabusModal] = useState(false);
  // Expand first unit by default
  const [expandedUnits, setExpandedUnits] = useState<{ [unitNum: number]: boolean }>({
    1: true,
    2: true,
  });

  const toggleUnit = (unitNumber: number) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitNumber]: !prev[unitNumber],
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownloadSyllabus = () => {
    if (subject.uploadedSyllabus) {
      AcademicService.downloadSyllabusFile(subject.uploadedSyllabus, subject.shortName);
    }
  };

  const subjectQuestions = questions.filter(q => q.subjectId === subject.id);
  const subjectPapers = questionPapers.filter(p => p.subjectId === subject.id);

  // Total topics & completed topics
  const totalTopics = subject.units.reduce((acc, u) => acc + u.topics.length, 0);
  const completedTopics = subject.units.reduce(
    (acc, u) =>
      acc + u.topics.filter(t => studentProgress.completedTopicIds.includes(t.id)).length,
    0
  );
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Important questions (marked as previous exam questions or high marks)
  const importantQuestions = subjectQuestions.filter(
    q => q.isPreviousExamQuestion || q.marks >= 5
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Subject Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              id="back-to-subjects-btn"
              onClick={onBackToSubjects}
              className="text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              ← All Subjects
            </button>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {subject.code}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/10 text-white">
              Semester {subject.semester} • {subject.credits} Credits
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {subject.badge}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {subject.name} ({subject.shortName})
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-3xl">
              {subject.description}
            </p>
          </div>

          {/* Quick Progress Bar in Header */}
          <div className="pt-2 max-w-md">
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
              <span>Syllabus Completion</span>
              <span>{completedTopics} of {totalTopics} Topics ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-1">
          {[
            { id: 'syllabus', label: 'Units & Syllabus', count: subject.units.length, icon: Layers },
            { id: 'practice', label: 'Practice Questions', count: subjectQuestions.length, icon: HelpCircle },
            { id: 'papers', label: 'Question Papers', count: subjectPapers.length, icon: FileText },
            { id: 'important', label: 'Important & Revision', count: importantQuestions.length, icon: Flame },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`subject-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT: SYLLABUS & UNITS */}
      {activeTab === 'syllabus' && (
        <div className="space-y-8">
          {/* OFFICIAL SYLLABUS DOCUMENT CARD (FACULTY ADMIN UPLOADED) */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/70 dark:from-slate-800/90 dark:via-slate-800 dark:to-slate-800/90 rounded-3xl border border-indigo-100 dark:border-slate-700/80 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Official Course Syllabus
                  </span>
                  {subject.uploadedSyllabus ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Published by Department Faculty
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                      Modular Syllabus Active
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {subject.uploadedSyllabus ? subject.uploadedSyllabus.fileName : `${subject.name} Official Syllabus`}
                </h3>

                {subject.uploadedSyllabus ? (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Regulation: <strong className="text-slate-700 dark:text-slate-200">{subject.uploadedSyllabus.regulation}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Academic Year: <strong className="text-slate-700 dark:text-slate-200">{subject.uploadedSyllabus.academicYear}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Size: <strong className="text-slate-700 dark:text-slate-200">{formatFileSize(subject.uploadedSyllabus.fileSize)}</strong>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      Uploaded By: <strong className="text-slate-700 dark:text-slate-200">{subject.uploadedSyllabus.uploadedBy}</strong>
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comprehensive unit breakdown, practice questions, and previous examination papers are available below.
                  </p>
                )}
              </div>
            </div>

            {/* Actions for User */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end">
              {subject.uploadedSyllabus && (
                <>
                  <button
                    id={`view-syllabus-details-btn-${subject.id}`}
                    onClick={() => setIsViewingSyllabusModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>View Details</span>
                  </button>

                  <button
                    id={`download-syllabus-btn-${subject.id}`}
                    onClick={handleDownloadSyllabus}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official Syllabus</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Course Overview & Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Course Objectives
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {subject.courseObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <ListCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Course Outcomes (COs)
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {subject.courseOutcomes.map((co, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{co}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Unit List: Expandable / Collapsible Accordion */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Detailed Unit Breakdown ({subject.units.length} Units)
              </h3>
              {subject.units.length > 0 && (
                <button
                  id="toggle-all-units-btn"
                  onClick={() => {
                    const allExpanded = subject.units.every(u => expandedUnits[u.unitNumber]);
                    const newState: { [k: number]: boolean } = {};
                    subject.units.forEach(u => {
                      newState[u.unitNumber] = !allExpanded;
                    });
                    setExpandedUnits(newState);
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {subject.units.every(u => expandedUnits[u.unitNumber]) ? 'Collapse All' : 'Expand All'}
                </button>
              )}
            </div>

            {subject.units.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800/90 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Modular Units Available
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  All units have been removed from this subject. Faculty and course coordinators can configure or upload modular curriculum units.
                </p>
              </div>
            ) : (
              subject.units.map(unit => {
              const isExpanded = !!expandedUnits[unit.unitNumber];
              const unitQuestions = subjectQuestions.filter(q => q.unitNumber === unit.unitNumber);
              const unitTopicsCompleted = unit.topics.filter(t =>
                studentProgress.completedTopicIds.includes(t.id)
              ).length;

              return (
                <div
                  key={unit.unitNumber}
                  id={`unit-card-${unit.unitNumber}`}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden transition"
                >
                  {/* Unit Accordion Header */}
                  <div
                    onClick={() => toggleUnit(unit.unitNumber)}
                    className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                          Unit {unit.unitNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {unit.topics.length} Topics • {unit.weightageMarks} Marks Weightage
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">
                          {unitTopicsCompleted}/{unit.topics.length} Done
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        {unit.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {unit.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                        {isExpanded ? 'Hide' : 'Show'}
                      </span>
                      <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Unit Topics & Practice Questions Expansion */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-4">
                      {/* Topics List */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Topics in this Unit
                        </div>

                        {unit.topics.map(topic => {
                          const isCompleted = studentProgress.completedTopicIds.includes(topic.id);
                          return (
                            <div
                              key={topic.id}
                              id={`topic-row-${topic.id}`}
                              className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isCompleted
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/60 hover:border-indigo-300'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <button
                                    id={`toggle-complete-btn-${topic.id}`}
                                    onClick={e => {
                                      e.stopPropagation();
                                      onToggleTopicCompleted(topic.id);
                                    }}
                                    title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                                      isCompleted
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                                    }`}
                                  >
                                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                                  </button>

                                  <h5 className="font-semibold text-sm text-slate-900 dark:text-white">
                                    {topic.name}
                                  </h5>

                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    topic.difficulty === 'easy'
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      : topic.difficulty === 'medium'
                                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  }`}>
                                    {topic.difficulty}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 ml-7">
                                  {topic.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 sm:self-center ml-7 sm:ml-0">
                                <span className="text-xs text-slate-400 flex items-center gap-1 hidden md:flex">
                                  <Clock className="w-3.5 h-3.5" /> {topic.estimatedMinutes} mins
                                </span>

                                <button
                                  id={`study-topic-${topic.id}`}
                                  onClick={() => onSelectTopic(subject.id, topic.id)}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                                >
                                  <span>Study Notes</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Unit Practice Questions Quick Strip */}
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Practice available: <strong className="text-slate-900 dark:text-white">{unitQuestions.length} Questions</strong> for Unit {unit.unitNumber}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            id={`practice-unit-${unit.unitNumber}-btn`}
                            onClick={() => setActiveTab('practice')}
                            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <span>Attempt Unit Questions</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        </div>
      )}

      {/* TAB CONTENT: PRACTICE QUESTIONS */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Practice Questions for {subject.shortName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Solve conceptual questions, numerical problems, and code snippets curated for this syllabus.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {subjectQuestions.length} Questions
              </span>
            </div>
          </div>

          {subjectQuestions.length === 0 ? (
            <div className="text-center py-14 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Practice Questions Bank is Clean
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All practice questions have been cleaned from the database. There are currently no practice questions available for this subject.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {subjectQuestions.map(q => (
                <div
                  key={q.id}
                  id={`subject-q-${q.id}`}
                  onClick={() => onSelectPracticeQuestion(q.id)}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs hover:border-indigo-400 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Unit {q.unitNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {q.topicName}
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
                        {q.type} • {q.marks} Marks
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {q.question}
                    </p>
                  </div>

                  <button
                    id={`solve-btn-${q.id}`}
                    className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition shrink-0 flex items-center gap-1 self-start sm:self-center"
                  >
                    <span>Practice Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: UNIT-WISE QUESTION PAPERS */}
      {activeTab === 'papers' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Question Papers for {subject.shortName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Simulate actual examination environments with timed class tests and mid-sem question papers.
            </p>
          </div>

          {subjectPapers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-2">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No practice papers available yet.</h4>
              <p className="text-xs text-slate-500">More question papers coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjectPapers.map(paper => (
                <div
                  key={paper.id}
                  id={`subject-paper-${paper.id}`}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {paper.paperType.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {paper.durationMinutes} Minutes
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {paper.title}
                    </h4>

                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div>Total Marks: <strong className="text-slate-800 dark:text-slate-200">{paper.totalMarks} Marks</strong></div>
                      <div>Sections: {paper.sections.map(s => s.title).join(', ')}</div>
                    </div>
                  </div>

                  <button
                    id={`start-paper-btn-${paper.id}`}
                    onClick={() => onSelectPaper(paper.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>Start Practice Paper</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: IMPORTANT QUESTIONS & REVISION */}
      {activeTab === 'important' && (
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4" /> High-Yield Exam Questions & Revision
            </div>
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              Curated list of questions frequently recurring in university previous year papers, along with key revision takeaways for quick review before examinations.
            </p>
          </div>

          <div className="space-y-4">
            {importantQuestions.map(q => (
              <div
                key={q.id}
                id={`important-q-${q.id}`}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                      ★ High Yield
                    </span>
                    {q.year && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {q.year}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">
                      Unit {q.unitNumber} • {q.topicName}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {q.marks} Marks
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {q.question}
                </h4>

                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-xs space-y-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-slate-200">Model Solution Summary:</div>
                  <p className="leading-relaxed whitespace-pre-wrap">{q.correctAnswer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Syllabus Document Viewer Modal */}
      {isViewingSyllabusModal && subject.uploadedSyllabus && (
        <SyllabusViewerModal
          isOpen={isViewingSyllabusModal}
          onClose={() => setIsViewingSyllabusModal(false)}
          subject={subject}
        />
      )}
    </div>
  );
};
