import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Breadcrumbs, BreadcrumbItem } from './components/Breadcrumbs.tsx';
import { HomePage } from './components/HomePage.tsx';
import { SubjectPage } from './components/SubjectPage.tsx';
import { TopicPage } from './components/TopicPage.tsx';
import { PracticeSection } from './components/PracticeSection.tsx';
import { QuestionPapersSection } from './components/QuestionPapersSection.tsx';
import { ProgressDashboard } from './components/ProgressDashboard.tsx';
import { SyllabusOverview } from './components/SyllabusOverview.tsx';
import { AboutDepartment } from './components/AboutDepartment.tsx';
import { GlobalSearchModal } from './components/GlobalSearchModal.tsx';
import { AdminContentModal, AdminTab } from './components/AdminContentModal.tsx';
import { ClassDiscussionSection } from './components/ClassDiscussionSection.tsx';
import { StudentAuthPage } from './components/StudentAuthPage.tsx';
import { AcademicService } from './services/academicService.ts';
import { ActiveView, Subject, PracticeQuestion, QuestionPaper, StudentProgress, ClassDiscussion, StudentAccount } from './types.ts';
import { GraduationCap } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aids_hub_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Student Authentication State (Website Access Gating)
  const [currentStudent, setCurrentStudent] = useState<StudentAccount | null>(() =>
    AcademicService.getCurrentStudent()
  );

  // Navigation State
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [targetQuestionId, setTargetQuestionId] = useState<string | null>(null);
  const [targetPaperId, setTargetPaperId] = useState<string | null>(null);

  // Admin & Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<AdminTab>('upload_syllabus');
  const [adminInitialSubjectId, setAdminInitialSubjectId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => AcademicService.isAdminAuthenticated());

  // Dynamic Data State
  const [subjects, setSubjects] = useState<Subject[]>(() => AcademicService.getSubjects());
  const [questions, setQuestions] = useState<PracticeQuestion[]>(() =>
    AcademicService.getQuestions()
  );
  const [papers, setPapers] = useState<QuestionPaper[]>(() => AcademicService.getQuestionPapers());
  const [progress, setProgress] = useState<StudentProgress>(() =>
    AcademicService.getStudentProgress()
  );
  const [discussions, setDiscussions] = useState<ClassDiscussion[]>(() =>
    AcademicService.getClassDiscussions()
  );
  const [catalogSemester, setCatalogSemester] = useState<string>('all');

  // Apply dark class to <html> element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aids_hub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aids_hub_theme', 'light');
    }
  }, [isDarkMode]);

  // Reload data when modified by admin or resets
  const refreshData = () => {
    setSubjects(AcademicService.getSubjects());
    setQuestions(AcademicService.getQuestions());
    setPapers(AcademicService.getQuestionPapers());
    setProgress(AcademicService.getStudentProgress());
    setDiscussions(AcademicService.getClassDiscussions());
    setCurrentStudent(AcademicService.getCurrentStudent());
  };

  // Initial server sync on boot and listen to cross-component data updates
  useEffect(() => {
    AcademicService.syncWithServer()
      .then(() => {
        refreshData();
      })
      .catch(err => {
        console.warn('Backend sync warning:', err);
      });

    const handleUpdate = () => {
      refreshData();
    };

    window.addEventListener('aids_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('aids_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Selection handlers
  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(null);
    setActiveView('subject-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTopic = (subjectId: string, topicId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(topicId);
    setActiveView('topic-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPracticeQuestion = (questionId: string) => {
    setTargetQuestionId(questionId);
    setActiveView('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPaper = (paperId: string) => {
    setTargetPaperId(paperId);
    setActiveView('question-papers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTopicCompleted = (topicId: string) => {
    const updated = AcademicService.toggleTopicCompleted(topicId);
    setProgress({ ...updated });
  };

  const handleToggleBookmark = (questionId: string) => {
    const updated = AcademicService.toggleBookmark(questionId);
    setProgress({ ...updated });
  };

  const handleRecordQuizAttempt = (attempt: {
    subjectId: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    percentage: number;
  }) => {
    const updated = AcademicService.recordQuizAttempt(attempt);
    setProgress({ ...updated });
  };

  const handleRecordPaperAttempt = (attempt: {
    paperId: string;
    score: number;
    totalMarks: number;
    percentage: number;
    timeSpentSeconds: number;
  }) => {
    const updated = AcademicService.recordPaperAttempt(attempt);
    setProgress({ ...updated });
  };

  const handleResetProgress = () => {
    const fresh = AcademicService.resetProgress();
    setProgress({ ...fresh });
  };

  const handleSelectPracticeForSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setActiveView('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPapersForSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setActiveView('question-papers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCleanAllQuestions = () => {
    AcademicService.clearAllQuestions();
    refreshData();
  };

  const handleCleanAllDiscussions = () => {
    AcademicService.clearAllClassDiscussions();
    refreshData();
  };

  const handleLoginAdmin = () => {
    setIsAdmin(true);
  };

  const handleLogoutAdmin = () => {
    AcademicService.logoutAdmin();
    setIsAdmin(false);
  };

  const handleLoginStudent = (student: StudentAccount) => {
    setCurrentStudent(student);
  };

  const handleLogoutStudent = () => {
    AcademicService.logoutStudent();
    setCurrentStudent(null);
  };

  // Resolve current active subject and topic
  const activeSubject = useMemo(() => {
    if (!selectedSubjectId) return null;
    return subjects.find(s => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  const activeTopicInfo = useMemo(() => {
    if (!activeSubject || !selectedTopicId) return null;
    for (const unit of activeSubject.units) {
      const found = unit.topics.find(t => t.id === selectedTopicId);
      if (found) {
        return { unit, topic: found };
      }
    }
    return null;
  }, [activeSubject, selectedTopicId]);

  // Compute Breadcrumb items based on current view
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Home',
        onClick: () => {
          setActiveView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      },
    ];

    if (activeView === 'home') {
      return items;
    }

    if (activeView === 'subjects') {
      items.push({ label: 'Academic Subjects', active: true });
    } else if (activeView === 'syllabus') {
      items.push({ label: 'Complete Syllabus Scheme', active: true });
    } else if (activeView === 'class-discussion') {
      items.push({ label: 'Class Discussion & Unit Coverage', active: true });
    } else if (activeView === 'practice') {
      items.push({ label: 'Practice Question Bank', active: true });
    } else if (activeView === 'question-papers') {
      items.push({ label: 'Examination Practice Papers', active: true });
    } else if (activeView === 'progress') {
      items.push({ label: 'Student Analytics Dashboard', active: true });
    } else if (activeView === 'about') {
      items.push({ label: 'About Department', active: true });
    } else if (activeView === 'subject-detail' && activeSubject) {
      items.push({
        label: 'Subjects',
        onClick: () => setActiveView('subjects'),
      });
      items.push({
        label: `${activeSubject.shortName} – ${activeSubject.name}`,
        active: true,
      });
    } else if (activeView === 'topic-detail' && activeSubject && activeTopicInfo) {
      items.push({
        label: activeSubject.shortName,
        onClick: () => setActiveView('subject-detail'),
      });
      items.push({
        label: `Unit ${activeTopicInfo.unit.unitNumber}`,
        onClick: () => setActiveView('subject-detail'),
      });
      items.push({
        label: activeTopicInfo.topic.name,
        active: true,
      });
    }

    return items;
  }, [activeView, activeSubject, activeTopicInfo]);

  // ACCESS GATE: If not logged into student account and not logged in as admin, show login/register page
  if (!currentStudent && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <StudentAuthPage
          onLoginSuccess={handleLoginStudent}
          onOpenAdmin={() => {
            setAdminInitialTab('upload_syllabus');
            setIsAdminOpen(true);
          }}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Faculty Admin Portal can still be accessed by faculty from the login page */}
        <AdminContentModal
          isOpen={isAdminOpen}
          onClose={() => {
            setIsAdminOpen(false);
            setAdminInitialSubjectId(null);
          }}
          subjects={subjects}
          onRefreshData={refreshData}
          initialTab={adminInitialTab}
          initialSubjectId={adminInitialSubjectId}
          isAdmin={isAdmin}
          onLoginAdmin={handleLoginAdmin}
          onLogoutAdmin={handleLogoutAdmin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Global Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={view => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => {
          setAdminInitialTab('upload_syllabus');
          setIsAdminOpen(true);
        }}
        isAdmin={isAdmin}
        currentStudent={currentStudent}
        onLogoutStudent={handleLogoutStudent}
      />

      {/* Breadcrumb strip (except on home) */}
      {activeView !== 'home' && <Breadcrumbs items={breadcrumbItems} />}

      {/* Main View Area */}
      <main className="grow">
        {/* VIEW: HOME */}
        {activeView === 'home' && (
          <HomePage
            subjects={subjects}
            questions={questions}
            studentProgress={progress}
            onSelectSubject={handleSelectSubject}
            onSelectTopic={handleSelectTopic}
            onSelectQuestion={handleSelectPracticeQuestion}
            setActiveView={setActiveView}
            onOpenSearch={() => setIsSearchOpen(true)}
            currentStudent={currentStudent}
            isAdmin={isAdmin}
          />
        )}

        {/* VIEW: SUBJECTS OVERVIEW / CATALOG */}
        {activeView === 'subjects' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                  B.Tech AI & DS • Semesters 1 to 8
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  Academic Subject Catalog
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Select a subject to access modular units, study notes, practice questions, and papers across all 8 semesters.
                </p>
              </div>

              {/* Semester quick filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setCatalogSemester('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    catalogSemester === 'all'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All ({subjects.length})
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                  const count = subjects.filter(s => s.semester === sem).length;
                  return (
                    <button
                      key={sem}
                      onClick={() => setCatalogSemester(sem.toString())}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                        catalogSemester === sem.toString()
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Sem {sem} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              const filteredList = subjects.filter(
                s => catalogSemester === 'all' || s.semester.toString() === catalogSemester
              );
              if (filteredList.length === 0) {
                return (
                  <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Semester {catalogSemester} — No Subjects Added Yet
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Curriculum for Semester {catalogSemester} is currently open. Faculty administrators can upload syllabi, create questions, and publish exam papers through the Admin Portal.
                      </p>
                    </div>
                    <button
                      onClick={() => setCatalogSemester('all')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition"
                    >
                      View All Semesters
                    </button>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredList.map(subject => (
                    <div
                      key={subject.id}
                      id={`catalog-card-${subject.id}`}
                      onClick={() => handleSelectSubject(subject.id)}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs hover:shadow-lg hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {subject.code}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              Sem {subject.semester}
                            </span>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                            {subject.badge}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {subject.shortName} – {subject.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {subject.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          {subject.units.length} Units • {subject.credits} Credits
                        </span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                          Explore Subject →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW: DEDICATED SUBJECT PAGE */}
        {activeView === 'subject-detail' && activeSubject && (
          <SubjectPage
            subject={activeSubject}
            questions={questions}
            questionPapers={papers}
            studentProgress={progress}
            onSelectTopic={handleSelectTopic}
            onToggleTopicCompleted={handleToggleTopicCompleted}
            onSelectPracticeQuestion={handleSelectPracticeQuestion}
            onSelectPaper={handleSelectPaper}
            onBackToSubjects={() => {
              setActiveView('subjects');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: TOPIC IN-DEPTH STUDY PAGE */}
        {activeView === 'topic-detail' && activeSubject && activeTopicInfo && (
          <TopicPage
            subject={activeSubject}
            unit={activeTopicInfo.unit}
            topic={activeTopicInfo.topic}
            questions={questions}
            studentProgress={progress}
            onToggleTopicCompleted={handleToggleTopicCompleted}
            onBackToUnit={() => {
              setActiveView('subject-detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onJumpToPractice={() => {
              setActiveView('practice');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {/* VIEW: COMPLETE SYLLABUS OVERVIEW */}
        {activeView === 'syllabus' && (
          <SyllabusOverview
            subjects={subjects}
            onSelectSubject={handleSelectSubject}
            onSelectTopic={handleSelectTopic}
            onSelectPractice={handleSelectPracticeForSubject}
            onSelectPapers={handleSelectPapersForSubject}
          />
        )}

        {/* VIEW: CLASS DISCUSSION & UNIT COVERAGE */}
        {activeView === 'class-discussion' && (
          <ClassDiscussionSection
            subjects={subjects}
            discussions={discussions}
            onSelectSubject={handleSelectSubject}
            onOpenAdmin={(tab, subId) => {
              setAdminInitialTab((tab as AdminTab) || 'class_discussion');
              setAdminInitialSubjectId(subId || null);
              setIsAdminOpen(true);
            }}
            isAdmin={isAdmin}
            onCleanAllDiscussions={handleCleanAllDiscussions}
          />
        )}

        {/* VIEW: PRACTICE QUESTIONS & QUIZZES */}
        {activeView === 'practice' && (
          <PracticeSection
            subjects={subjects}
            questions={questions}
            studentProgress={progress}
            onRecordQuizAttempt={handleRecordQuizAttempt}
            onToggleBookmark={handleToggleBookmark}
            initialQuestionId={targetQuestionId}
            isAdmin={isAdmin}
            onCleanAllQuestions={handleCleanAllQuestions}
          />
        )}

        {/* VIEW: QUESTION PAPERS & EXAM SIMULATOR */}
        {activeView === 'question-papers' && (
          <QuestionPapersSection
            subjects={subjects}
            questionPapers={papers}
            studentProgress={progress}
            onRecordPaperAttempt={handleRecordPaperAttempt}
            initialPaperId={targetPaperId}
          />
        )}

        {/* VIEW: STUDENT PROGRESS ANALYTICS DASHBOARD */}
        {activeView === 'progress' && (
          <ProgressDashboard
            subjects={subjects}
            questions={questions}
            studentProgress={progress}
            onResetProgress={handleResetProgress}
            onSelectSubject={handleSelectSubject}
            onSelectQuestion={handleSelectPracticeQuestion}
          />
        )}

        {/* VIEW: ABOUT DEPARTMENT */}
        {activeView === 'about' && (
          <AboutDepartment setActiveView={setActiveView} />
        )}
      </main>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSubject={handleSelectSubject}
        onSelectTopic={handleSelectTopic}
        onSelectPracticeQuestion={handleSelectPracticeQuestion}
      />

      <AdminContentModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setAdminInitialSubjectId(null);
        }}
        subjects={subjects}
        onRefreshData={refreshData}
        initialTab={adminInitialTab}
        initialSubjectId={adminInitialSubjectId}
        isAdmin={isAdmin}
        onLoginAdmin={handleLoginAdmin}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Department Site-Wide Footer */}
      <Footer
        setActiveView={setActiveView}
        onSelectSubject={handleSelectSubject}
      />
    </div>
  );
}
