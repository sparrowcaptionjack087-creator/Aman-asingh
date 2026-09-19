import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Layers,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Sparkles,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { Subject } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';

interface SyllabusOverviewProps {
  subjects: Subject[];
  onSelectSubject: (subjectId: string) => void;
  onSelectTopic: (subjectId: string, topicId: string) => void;
  onSelectPractice?: (subjectId: string) => void;
  onSelectPapers?: (subjectId: string) => void;
}

export const SyllabusOverview: React.FC<SyllabusOverviewProps> = ({
  subjects,
  onSelectSubject,
  onSelectTopic,
  onSelectPractice,
  onSelectPapers,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const semesterMeta: Record<number, { year: string; focus: string }> = {
    1: { year: 'Year 1 • Semester 1', focus: 'PPS, PE, EEE, Calculus, PCS & WD (6 Core Subjects)' },
    2: { year: 'Year 1 • Semester 2', focus: 'PPS, PE, EEE, Calculus, PCS & WD (6 Core Subjects)' },
    3: { year: 'Year 2 • Semester 3', focus: 'Data Structures, Discrete Mathematics & Digital Computing' },
    4: { year: 'Year 2 • Semester 4', focus: 'Design & Analysis of Algorithms, Database Systems & AI Foundations' },
    5: { year: 'Year 3 • Semester 5', focus: 'Machine Learning, Operating Systems & Formal Languages' },
    6: { year: 'Year 3 • Semester 6', focus: 'Deep Learning, Computer Networks & Big Data Analytics' },
    7: { year: 'Year 4 • Semester 7', focus: 'Natural Language Processing, Cloud Computing & Professional Electives' },
    8: { year: 'Year 4 • Semester 8', focus: 'Major Capstone Project, Industry Internship & Advanced Electives' },
  };

  const subjectsBySemester = useMemo(() => {
    const map: Record<number, Subject[]> = {};
    for (let i = 1; i <= 8; i++) {
      map[i] = [];
    }
    subjects.forEach(s => {
      const sem = s.semester;
      if (!map[sem]) map[sem] = [];
      map[sem].push(s);
    });
    return map;
  }, [subjects]);

  const displayedSemesters = useMemo(() => {
    if (selectedSemester === 'all') {
      return semesters;
    }
    const semNum = Number(selectedSemester);
    return [semNum];
  }, [selectedSemester]);

  const handleDownload = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    if (subject.uploadedSyllabus) {
      AcademicService.downloadSyllabusFile(subject.uploadedSyllabus, subject.shortName);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Syllabus Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" /> Department Curriculum • Semesters 1 to 8
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Complete Semester Syllabus Scheme
          </h1>
          <p className="text-sm text-slate-300">
            Official B.Tech CSE (Artificial Intelligence & Data Science) 4-year curriculum structure across Semesters 1 to 8.
          </p>
        </div>
      </div>

      {/* SEMESTER DIVISION NAVIGATION BAR (SEMESTERS 1 TO 8) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Select Semester (Semesters 1 – 8)</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {subjects.length} Total Subjects Mapped
          </span>
        </div>

        {/* Semester Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="syllabus-sem-all-btn"
            onClick={() => setSelectedSemester('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedSemester === 'all'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <span>All Semesters (1 – 8)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 dark:bg-black/20">
              {subjects.length}
            </span>
          </button>

          {semesters.map(sem => {
            const semCount = (subjectsBySemester[sem] || []).length;
            const isSelected = selectedSemester === sem.toString();
            return (
              <button
                key={sem}
                id={`syllabus-sem-${sem}-btn`}
                onClick={() => setSelectedSemester(sem.toString())}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span>Sem {sem}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}>
                  {semCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEMESTER-WISE SYLLABUS LISTING */}
      <div className="space-y-12">
        {displayedSemesters.map(sem => {
          const semSubjects = subjectsBySemester[sem] || [];
          const totalSemCredits = semSubjects.reduce((acc, s) => acc + (s.credits || 0), 0);
          const meta = semesterMeta[sem];

          return (
            <section
              key={sem}
              id={`syllabus-semester-${sem}-section`}
              className="space-y-6"
            >
              {/* Semester Section Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-100 via-indigo-50/50 to-slate-100 dark:from-slate-800 dark:via-indigo-950/30 dark:to-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <span>{meta?.year || `Year ${Math.ceil(sem / 2)}`}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{meta?.focus}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Semester {sem}</span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {semSubjects.length} Subjects
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    Total Credits: {totalSemCredits}
                  </span>
                </div>
              </div>

              {/* Subjects in this Semester */}
              {semSubjects.length === 0 ? (
                <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      Semester {sem} Curriculum Under Preparation
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      No subjects have been mapped to Semester {sem} yet. Course structures, syllabi, practice questions, and question papers can be configured by faculty administrators via the Admin Portal.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {semSubjects.map((subject, sIdx) => (
                  <div
                    key={subject.id}
                    id={`syllabus-subject-block-${subject.id}`}
                    className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs space-y-6"
                  >
                    {/* Subject Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/80">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {subject.code}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {subject.credits} Credits • Sem {subject.semester}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                            {subject.badge}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          {sIdx + 1}. {subject.name} ({subject.shortName})
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          {subject.description}
                        </p>
                        {subject.uploadedSyllabus && (
                          <div className="flex items-center gap-2 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Official Syllabus: {subject.uploadedSyllabus.fileName} ({subject.uploadedSyllabus.regulation})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                        {subject.uploadedSyllabus && (
                          <button
                            id={`overview-download-syl-${subject.id}`}
                            onClick={e => handleDownload(e, subject)}
                            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                            title={`Download official syllabus for ${subject.shortName}`}
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Syllabus Doc</span>
                          </button>
                        )}

                        {/* Practice Questions Quick Link */}
                        <button
                          id={`subject-practice-btn-${subject.id}`}
                          onClick={() => onSelectPractice ? onSelectPractice(subject.id) : onSelectSubject(subject.id)}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200/60 dark:border-slate-700"
                          title={`Practice questions for ${subject.shortName}`}
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Practice Questions</span>
                        </button>

                        {/* Practice Papers Quick Link */}
                        <button
                          id={`subject-papers-btn-${subject.id}`}
                          onClick={() => onSelectPapers ? onSelectPapers(subject.id) : onSelectSubject(subject.id)}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200/60 dark:border-slate-700"
                          title={`Examination papers for ${subject.shortName}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-violet-500" />
                          <span>Practice Papers</span>
                        </button>

                        <button
                          id={`open-subject-hub-${subject.id}`}
                          onClick={() => onSelectSubject(subject.id)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                        >
                          <span>Subject Hub</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Units Grid (if any exist) */}
                    {subject.units && subject.units.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subject.units.map(unit => (
                          <div
                            key={unit.unitNumber}
                            className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                                  Unit {unit.unitNumber}
                                </span>
                                <span className="font-semibold text-slate-500 dark:text-slate-400">
                                  {unit.weightageMarks} Marks
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                {unit.name}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                {unit.description}
                              </p>

                              {/* Topic Pill List */}
                              <div className="space-y-1.5 pt-2">
                                {unit.topics.map(topic => (
                                  <button
                                    key={topic.id}
                                    onClick={() => onSelectTopic(subject.id, topic.id)}
                                    className="w-full text-left p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition truncate block"
                                    title={topic.name}
                                  >
                                    • {topic.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                              {unit.topics.length} In-Depth Topics
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
