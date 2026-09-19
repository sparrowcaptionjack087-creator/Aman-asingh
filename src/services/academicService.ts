import { INITIAL_SUBJECTS } from '../data/initialSubjects.ts';
import { INITIAL_QUESTIONS } from '../data/initialQuestions.ts';
import { INITIAL_QUESTION_PAPERS } from '../data/initialPapers.ts';
import { Subject, PracticeQuestion, QuestionPaper, StudentProgress, Topic, Unit, UploadedSyllabusDocument, ClassDiscussion, StudentAccount, StudentChatMessage, StudentChatCategory } from '../types.ts';

const STORAGE_KEYS = {
  SUBJECTS: 'aids_hub_subjects_v1',
  QUESTIONS: 'aids_hub_questions_v1',
  PAPERS: 'aids_hub_papers_v1',
  PROGRESS: 'aids_hub_student_progress_v1',
  ADMIN_AUTH: 'aids_hub_admin_auth_v1',
  ADMIN_PASSCODE: 'aids_hub_admin_passcode_v1',
  DISCUSSIONS: 'aids_hub_discussions_v1',
  STUDENTS: 'aids_hub_students_v1',
  CURRENT_STUDENT: 'aids_hub_current_student_v1',
  STUDENT_CHATS: 'aids_hub_student_chats_v1',
};

const DEFAULT_ADMIN_PASSCODE = 'Aman@2006';

const DEFAULT_PROGRESS: StudentProgress = {
  completedTopicIds: [],
  bookmarkedQuestionIds: [],
  quizAttempts: [],
  paperAttempts: []
};

export class AcademicService {
  static getSubjects(): Subject[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      let subjects: Subject[];
      if (stored) {
        subjects = JSON.parse(stored);
      } else {
        subjects = JSON.parse(JSON.stringify(INITIAL_SUBJECTS));
      }

      // Ensure all subjects have their units removed as requested
      const unitsCleanedFlag = localStorage.getItem('aids_hub_units_cleaned_v2');
      if (!unitsCleanedFlag) {
        subjects.forEach(s => {
          s.units = [];
        });
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
        localStorage.setItem('aids_hub_units_cleaned_v2', 'true');
      }

      // Ensure all subjects' uploaded syllabi and files are cleaned as requested
      const cleanedFlag = localStorage.getItem('aids_hub_uploaded_cleaned_v3');
      if (!cleanedFlag) {
        subjects.forEach(s => {
          delete s.uploadedSyllabus;
        });
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
        localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify([]));
        localStorage.setItem('aids_hub_uploaded_cleaned_v3', 'true');
      }

      // Migrate any legacy IDs in stored subjects (e.g. pps -> pps-sem1)
      subjects.forEach(s => {
        if (s.id === 'pps') s.id = 'pps-sem1';
        if (s.id === 'eee') s.id = 'eee-sem1';
        if (s.id === 'calculus') s.id = 'calculus-sem1';
        if (s.id === 'pe') s.id = 'pe-sem2';
        if (s.id === 'pcs') s.id = 'pcs-sem2';
        if (s.id === 'wd') s.id = 'wd-sem2';
      });

      // Keep ONLY the 12 allowed subjects (6 for Sem 1, 6 for Sem 2)
      const validIds = new Set(INITIAL_SUBJECTS.map(s => s.id));
      const filtered = subjects.filter(s => validIds.has(s.id));
      let hasChanges = filtered.length !== subjects.length;
      subjects = filtered;

      // Ensure all 12 subjects from INITIAL_SUBJECTS exist in the catalog and have current metadata
      INITIAL_SUBJECTS.forEach(initSub => {
        const existing = subjects.find(s => s.id === initSub.id);
        if (!existing) {
          subjects.push(JSON.parse(JSON.stringify(initSub)));
          hasChanges = true;
        } else {
          // Keep units and uploadedSyllabus from existing, but update name, shortName, semester, badge, description, credits, code
          if (existing.name !== initSub.name) {
            existing.name = initSub.name;
            hasChanges = true;
          }
          if (existing.shortName !== initSub.shortName) {
            existing.shortName = initSub.shortName;
            hasChanges = true;
          }
          if (existing.semester !== initSub.semester) {
            existing.semester = initSub.semester;
            hasChanges = true;
          }
          if (existing.badge !== initSub.badge) {
            existing.badge = initSub.badge;
            hasChanges = true;
          }
          if (existing.code !== initSub.code) {
            existing.code = initSub.code;
            hasChanges = true;
          }
          if (existing.description !== initSub.description) {
            existing.description = initSub.description;
            hasChanges = true;
          }
          if (existing.credits !== initSub.credits) {
            existing.credits = initSub.credits;
            hasChanges = true;
          }
        }
      });

      // Maintain the exact sequence defined in INITIAL_SUBJECTS (PPS, PE, EEE, Calculus, PCS, WD)
      const initialIndexMap = new Map(INITIAL_SUBJECTS.map((s, idx) => [s.id, idx]));
      subjects.sort((a, b) => {
        const idxA = initialIndexMap.has(a.id) ? initialIndexMap.get(a.id)! : 999;
        const idxB = initialIndexMap.has(b.id) ? initialIndexMap.get(b.id)! : 999;
        return idxA - idxB;
      });

      if (hasChanges) {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
      }

      return subjects;
    } catch (e) {
      console.warn('Failed to parse subjects from localStorage', e);
    }
    return INITIAL_SUBJECTS.map(s => ({ ...s, units: [] }));
  }

  static getSubjectById(id: string): Subject | undefined {
    const subjects = this.getSubjects();
    const direct = subjects.find(s => s.id === id);
    if (direct) return direct;
    // Map legacy or shorthand IDs
    if (id === 'pps') return subjects.find(s => s.id === 'pps-sem1');
    if (id === 'pe') return subjects.find(s => s.id === 'pe-sem1' || s.id === 'pe-sem2');
    if (id === 'eee') return subjects.find(s => s.id === 'eee-sem1');
    if (id === 'calculus') return subjects.find(s => s.id === 'calculus-sem1');
    if (id === 'pcs') return subjects.find(s => s.id === 'pcs-sem1' || s.id === 'pcs-sem2');
    if (id === 'wd') return subjects.find(s => s.id === 'wd-sem1' || s.id === 'wd-sem2');
    return undefined;
  }

  static saveSubjects(subjects: Subject[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (e) {
      console.error('Failed to save subjects', e);
    }
  }

  static clearAllUnits(): Subject[] {
    try {
      const subjects = this.getSubjects();
      subjects.forEach(s => {
        s.units = [];
      });
      this.saveSubjects(subjects);
      localStorage.setItem('aids_hub_units_cleaned_v2', 'true');
      return subjects;
    } catch (e) {
      console.error('Failed to clear units', e);
      return [];
    }
  }

  static getQuestions(): PracticeQuestion[] {
    try {
      // One-time cleanup migration for practice questions to ensure completely clean state
      const migrationKey = 'aids_hub_questions_cleaned_v2';
      if (!localStorage.getItem(migrationKey)) {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify([]));
        localStorage.setItem(migrationKey, 'true');
        return [];
      }

      const stored = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse questions from localStorage', e);
    }
    return INITIAL_QUESTIONS;
  }

  static getPracticeQuestions(): PracticeQuestion[] {
    return this.getQuestions();
  }

  static saveQuestions(questions: PracticeQuestion[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.error('Failed to save questions', e);
    }
  }

  static clearAllQuestions(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify([]));
      localStorage.setItem('aids_hub_questions_cleaned_v2', 'true');
    } catch (e) {
      console.error('Failed to clear questions', e);
    }
  }

  static getQuestionPapers(): QuestionPaper[] {
    try {
      // One-time cleanup migration for practice papers to ensure completely clean state
      const migrationKey = 'aids_hub_papers_cleaned_v2';
      if (!localStorage.getItem(migrationKey)) {
        localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify([]));
        localStorage.setItem(migrationKey, 'true');
        return [];
      }

      const stored = localStorage.getItem(STORAGE_KEYS.PAPERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse papers from localStorage', e);
    }
    return [];
  }

  static saveQuestionPapers(papers: QuestionPaper[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
    } catch (e) {
      console.error('Failed to save papers', e);
    }
  }

  static getStudentProgress(): StudentProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse student progress', e);
    }
    return DEFAULT_PROGRESS;
  }

  static getProgress(): StudentProgress {
    return this.getStudentProgress();
  }

  static saveStudentProgress(progress: StudentProgress): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save student progress', e);
    }
  }

  static toggleTopicCompleted(topicId: string): StudentProgress {
    const progress = this.getStudentProgress();
    const exists = progress.completedTopicIds.includes(topicId);
    if (exists) {
      progress.completedTopicIds = progress.completedTopicIds.filter(id => id !== topicId);
    } else {
      progress.completedTopicIds.push(topicId);
    }
    this.saveStudentProgress(progress);
    return progress;
  }

  static toggleBookmarkQuestion(questionId: string): StudentProgress {
    const progress = this.getStudentProgress();
    const exists = progress.bookmarkedQuestionIds.includes(questionId);
    if (exists) {
      progress.bookmarkedQuestionIds = progress.bookmarkedQuestionIds.filter(id => id !== questionId);
    } else {
      progress.bookmarkedQuestionIds.push(questionId);
    }
    this.saveStudentProgress(progress);
    return progress;
  }

  static toggleBookmark(questionId: string): StudentProgress {
    return this.toggleBookmarkQuestion(questionId);
  }

  static recordQuizAttempt(attempt: {
    subjectId: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    percentage: number;
  }): StudentProgress {
    const progress = this.getStudentProgress();
    progress.quizAttempts.unshift({
      id: `attempt-${Date.now()}`,
      timestamp: Date.now(),
      ...attempt,
    });
    // Keep last 30 attempts
    if (progress.quizAttempts.length > 30) {
      progress.quizAttempts = progress.quizAttempts.slice(0, 30);
    }
    this.saveStudentProgress(progress);
    return progress;
  }

  static recordPaperAttempt(attempt: {
    paperId: string;
    score: number;
    totalMarks: number;
    percentage: number;
    timeSpentSeconds: number;
  }): StudentProgress {
    const progress = this.getStudentProgress();
    progress.paperAttempts.unshift({
      timestamp: Date.now(),
      ...attempt,
    });
    if (progress.paperAttempts.length > 20) {
      progress.paperAttempts = progress.paperAttempts.slice(0, 20);
    }
    this.saveStudentProgress(progress);
    return progress;
  }

  static resetProgress(): StudentProgress {
    this.saveStudentProgress(DEFAULT_PROGRESS);
    return DEFAULT_PROGRESS;
  }

  static addQuestion(newQuestion: PracticeQuestion): void {
    const questions = this.getQuestions();
    questions.push(newQuestion);
    this.saveQuestions(questions);
  }

  static addMultipleQuestions(newQuestions: PracticeQuestion[]): void {
    const questions = this.getQuestions();
    this.saveQuestions([...newQuestions, ...questions]);
  }

  static deleteQuestion(questionId: string): void {
    const questions = this.getQuestions().filter(q => q.id !== questionId);
    this.saveQuestions(questions);
  }

  static addQuestionPaper(newPaper: QuestionPaper): void {
    const papers = this.getQuestionPapers();
    // If paper with same ID exists, update it, else prepend
    const existingIndex = papers.findIndex(p => p.id === newPaper.id);
    if (existingIndex >= 0) {
      papers[existingIndex] = newPaper;
    } else {
      papers.unshift(newPaper);
    }
    this.saveQuestionPapers(papers);
  }

  static addMultipleQuestionPapers(newPapers: QuestionPaper[]): void {
    const papers = this.getQuestionPapers();
    const existingIds = new Set(papers.map(p => p.id));
    const toAdd = newPapers.filter(p => !existingIds.has(p.id));
    this.saveQuestionPapers([...toAdd, ...papers]);
  }

  static deleteQuestionPaper(paperId: string): void {
    const papers = this.getQuestionPapers().filter(p => p.id !== paperId);
    this.saveQuestionPapers(papers);
  }

  static clearAllQuestionPapers(): void {
    try {
      this.saveQuestionPapers([]);
    } catch (e) {
      console.error('Failed to clear question papers', e);
    }
  }

  static addPracticeQuestion(newQuestion: PracticeQuestion): void {
    this.addQuestion(newQuestion);
  }

  static addTopic(subjectId: string, unitNumber: number, topic: Topic, unitName?: string): boolean {
    const subjects = this.getSubjects();
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return false;
    let unit = sub.units.find(u => u.unitNumber === unitNumber);
    if (!unit) {
      unit = {
        unitNumber,
        name: unitName?.trim() || `Unit ${unitNumber}`,
        description: `Curriculum module for Unit ${unitNumber}`,
        weightageMarks: 14,
        topics: []
      };
      sub.units.push(unit);
      sub.units.sort((a, b) => a.unitNumber - b.unitNumber);
    } else if (unitName && unitName.trim()) {
      unit.name = unitName.trim();
    }
    unit.topics.push(topic);
    this.saveSubjects(subjects);
    return true;
  }

  static addUnit(subjectId: string, unit: Unit): boolean {
    const subjects = this.getSubjects();
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return false;
    sub.units.push(unit);
    this.saveSubjects(subjects);
    return true;
  }

  // Admin Role Authentication
  static isAdminAuthenticated(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  }

  static getAdminPasscode(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSCODE) || DEFAULT_ADMIN_PASSCODE;
    } catch {
      return DEFAULT_ADMIN_PASSCODE;
    }
  }

  static setAdminPasscode(newPasscode: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSCODE, newPasscode);
    } catch (e) {
      console.error('Failed to update admin passcode', e);
    }
  }

  static loginAdmin(passcode: string): boolean {
    const requiredPasscode = this.getAdminPasscode();
    if (passcode.trim() === requiredPasscode) {
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  }

  static logoutAdmin(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    } catch {
      // ignore
    }
  }

  // Subject & Syllabus Upload Operations (Admin Only)
  static uploadSubjectSyllabus(
    subjectId: string,
    syllabusDoc: UploadedSyllabusDocument,
    replaceUnits: boolean = false,
    parsedUnits?: Unit[]
  ): Subject[] {
    const subjects = this.getSubjects();
    const targetIdx = subjects.findIndex(s => s.id === subjectId);
    if (targetIdx === -1) {
      throw new Error(`Subject with ID ${subjectId} not found.`);
    }

    const updatedSubject = { ...subjects[targetIdx] };
    updatedSubject.uploadedSyllabus = syllabusDoc;

    if (replaceUnits && parsedUnits && parsedUnits.length > 0) {
      updatedSubject.units = parsedUnits;
    }

    subjects[targetIdx] = updatedSubject;
    this.saveSubjects(subjects);
    return subjects;
  }

  static removeSubjectSyllabus(subjectId: string): Subject[] {
    const subjects = this.getSubjects();
    const targetIdx = subjects.findIndex(s => s.id === subjectId);
    if (targetIdx !== -1) {
      const updatedSubject = { ...subjects[targetIdx] };
      delete updatedSubject.uploadedSyllabus;
      subjects[targetIdx] = updatedSubject;
      this.saveSubjects(subjects);
    }
    return subjects;
  }

  static clearAllUploadedSyllabi(): Subject[] {
    const subjects = this.getSubjects();
    const cleanedSubjects = subjects.map(s => {
      const copy = { ...s };
      delete copy.uploadedSyllabus;
      return copy;
    });
    this.saveSubjects(cleanedSubjects);
    return cleanedSubjects;
  }

  static addCustomSubject(newSubject: Subject): Subject[] {
    const subjects = this.getSubjects();
    subjects.push(newSubject);
    this.saveSubjects(subjects);
    return subjects;
  }

  // Syllabus Download Helper
  static downloadSyllabusFile(syllabus: UploadedSyllabusDocument, subjectName?: string): void {
    let url = syllabus.fileDataUrl;
    let createdBlobUrl = false;

    if (!url) {
      // Fallback: create text blob from syllabus textContent or summary
      const content =
        syllabus.textContent ||
        `Subject Syllabus: ${subjectName || 'Course'}
Regulation: ${syllabus.regulation}
Academic Year: ${syllabus.academicYear}
Uploaded By: ${syllabus.uploadedBy}
File: ${syllabus.fileName}

Details: ${syllabus.notes || 'Official Department Course Syllabus'}`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      url = URL.createObjectURL(blob);
      createdBlobUrl = true;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = syllabus.fileName || `${subjectName || 'Course'}_Syllabus.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (createdBlobUrl) {
      setTimeout(() => URL.revokeObjectURL(url!), 5000);
    }
  }

  static resetAllData(): void {
    this.resetToDefaults();
  }

  static resetToDefaults(): void {
    const cleanSubjects = JSON.parse(JSON.stringify(INITIAL_SUBJECTS)).map((s: Subject) => ({
      ...s,
      units: []
    }));
    const cleanQuestions: PracticeQuestion[] = [];
    const cleanPapers: QuestionPaper[] = [];
    const cleanProgress = JSON.parse(JSON.stringify(DEFAULT_PROGRESS));

    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(cleanSubjects));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(cleanQuestions));
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(cleanPapers));
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(cleanProgress));
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify([]));
    localStorage.setItem('aids_hub_syllabi_cleaned_v2', 'true');
    localStorage.setItem('aids_hub_questions_cleaned_v2', 'true');
    localStorage.setItem('aids_hub_papers_cleaned_v2', 'true');
    localStorage.setItem('aids_hub_units_cleaned_v2', 'true');
    localStorage.setItem('aids_hub_discussions_cleaned_v2', 'true');
  }

  static exportAllAsJSON(): string {
    return JSON.stringify(
      {
        department: 'B.Tech CSE (Artificial Intelligence & Data Science)',
        version: '2.1.0',
        exportedAt: new Date().toISOString(),
        subjects: this.getSubjects(),
        questions: this.getQuestions(),
        questionPapers: this.getQuestionPapers(),
        studentProgress: this.getStudentProgress(),
        classDiscussions: this.getClassDiscussions(),
        students: this.getStudents(),
      },
      null,
      2
    );
  }

  static importDataFromJSON(jsonString: string): {
    success: boolean;
    message: string;
    counts?: { subjects: number; questions: number; papers: number; students?: number };
  } {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;

      let importedSubjects = 0;
      let importedQuestions = 0;
      let importedPapers = 0;
      let importedStudents = 0;

      if (Array.isArray(data.subjects) && data.subjects.length > 0) {
        this.saveSubjects(data.subjects);
        importedSubjects = data.subjects.length;
      }
      if (Array.isArray(data.questions)) {
        this.saveQuestions(data.questions);
        importedQuestions = data.questions.length;
      }
      if (Array.isArray(data.questionPapers)) {
        this.saveQuestionPapers(data.questionPapers);
        importedPapers = data.questionPapers.length;
      }
      if (Array.isArray(data.classDiscussions)) {
        this.saveClassDiscussions(data.classDiscussions);
      }
      if (data.studentProgress) {
        this.saveStudentProgress(data.studentProgress);
      }
      if (Array.isArray(data.students) && data.students.length > 0) {
        this.bulkImportStudents(data.students);
        importedStudents = data.students.length;
      }

      if (importedSubjects === 0 && importedQuestions === 0 && importedPapers === 0 && importedStudents === 0) {
        return {
          success: false,
          message: 'The uploaded JSON file did not contain valid subjects, questions, papers, or students data.'
        };
      }

      return {
        success: true,
        message: `Curriculum and student roster restored successfully! (${importedSubjects} subjects, ${importedQuestions} questions, ${importedPapers} question papers, ${importedStudents} students)`,
        counts: { subjects: importedSubjects, questions: importedQuestions, papers: importedPapers, students: importedStudents }
      };
    } catch (e: any) {
      console.error('Failed to import JSON data', e);
      return {
        success: false,
        message: 'Invalid JSON format: ' + (e?.message || 'Unable to parse JSON')
      };
    }
  }

  // Global search utility
  static searchEverything(query: string) {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return {
        subjects: [],
        units: [],
        topics: [],
        questions: [],
      };
    }

    const subjects = this.getSubjects();
    const questions = this.getQuestions();

    const matchedSubjects = subjects.filter(
      s =>
        s.name.toLowerCase().includes(trimmed) ||
        s.shortName.toLowerCase().includes(trimmed) ||
        s.code.toLowerCase().includes(trimmed) ||
        s.description.toLowerCase().includes(trimmed)
    );

    const matchedUnits: { subject: Subject; unit: Unit }[] = [];
    const matchedTopics: { subject: Subject; unit: Unit; topic: Topic }[] = [];

    subjects.forEach(subject => {
      subject.units.forEach(unit => {
        const unitQueryMatches =
          unit.name.toLowerCase().includes(trimmed) ||
          `unit ${unit.unitNumber}`.includes(trimmed) ||
          `${subject.shortName.toLowerCase()} unit ${unit.unitNumber}`.includes(trimmed) ||
          unit.description.toLowerCase().includes(trimmed);

        if (unitQueryMatches) {
          matchedUnits.push({ subject, unit });
        }

        unit.topics.forEach(topic => {
          const topicMatches =
            topic.name.toLowerCase().includes(trimmed) ||
            topic.description.toLowerCase().includes(trimmed) ||
            topic.studyMaterial.overview.toLowerCase().includes(trimmed) ||
            topic.studyMaterial.keyConcepts.some(c => c.toLowerCase().includes(trimmed));

          if (topicMatches) {
            matchedTopics.push({ subject, unit, topic });
          }
        });
      });
    });

    const matchedQuestions = questions.filter(
      q =>
        q.question.toLowerCase().includes(trimmed) ||
        q.explanation.toLowerCase().includes(trimmed) ||
        q.subjectName.toLowerCase().includes(trimmed) ||
        q.topicName.toLowerCase().includes(trimmed)
    );

    return {
      subjects: matchedSubjects,
      units: matchedUnits,
      topics: matchedTopics,
      questions: matchedQuestions,
    };
  }

  // ==========================================
  // CLASS DISCUSSIONS METHODS
  // ==========================================

  static getClassDiscussions(): ClassDiscussion[] {
    const discussionsCleanedFlag = localStorage.getItem('aids_hub_discussions_cleaned_v3');
    if (!discussionsCleanedFlag) {
      try {
        localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify([]));
        localStorage.setItem('aids_hub_discussions_cleaned_v3', 'true');
      } catch (e) {
        console.error('Failed to clean class discussions', e);
      }
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse class discussions from localStorage', e);
    }

    return [];
  }

  static clearAllClassDiscussions(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify([]));
      localStorage.setItem('aids_hub_discussions_cleaned_v3', 'true');
    } catch (e) {
      console.error('Failed to clear class discussions', e);
    }
  }

  static saveClassDiscussions(discussions: ClassDiscussion[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
    } catch (e) {
      console.error('Failed to save class discussions', e);
    }
  }

  static addClassDiscussion(discussion: Omit<ClassDiscussion, 'id' | 'createdAt'>): ClassDiscussion {
    const list = this.getClassDiscussions();
    const newEntry: ClassDiscussion = {
      ...discussion,
      id: `disc-${discussion.subjectId}-u${discussion.unitNumber}-${Date.now().toString().slice(-6)}`,
      createdAt: Date.now()
    };
    list.unshift(newEntry);
    this.saveClassDiscussions(list);
    return newEntry;
  }

  static updateClassDiscussion(id: string, updated: Partial<ClassDiscussion>): boolean {
    const list = this.getClassDiscussions();
    const idx = list.findIndex(d => d.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updated };
    this.saveClassDiscussions(list);
    return true;
  }

  static deleteClassDiscussion(id: string): boolean {
    const list = this.getClassDiscussions();
    const filtered = list.filter(d => d.id !== id);
    if (filtered.length === list.length) return false;
    this.saveClassDiscussions(filtered);
    return true;
  }

  // ==========================================
  // STUDENT ACCOUNTS (UG NUMBER OF AI & DS)
  // ==========================================

  static notifyDataUpdated(): void {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('aids_data_updated'));
      } catch (e) {
        // ignore
      }
    }
  }

  static async fetchStudentsFromServer(): Promise<StudentAccount[]> {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.students)) {
          this.saveStudentsLocally(json.students);
          this.notifyDataUpdated();
          return json.students;
        }
      }
    } catch (e) {
      console.warn('Could not fetch students from server API, using local storage cache', e);
    }
    return this.getStudents();
  }

  static async syncWithServer(): Promise<StudentAccount[]> {
    try {
      const localStudents = this.getStudents();
      const response = await fetch('/api/students/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: localStudents })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.students)) {
          this.saveStudentsLocally(json.students);
          this.notifyDataUpdated();
          return json.students;
        }
      }
    } catch (e) {
      console.warn('Server sync failed, running with local data', e);
    }
    return this.getStudents();
  }

  static getStudents(): StudentAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Remove any legacy pre-registered sample test accounts
          const filtered = parsed.filter(
            s => s.ugNumber !== 'UG24AIDS001' && s.ugNumber !== 'UG24AIDS042'
          );
          if (filtered.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
          }
          return filtered;
        }
      }
    } catch (e) {
      console.warn('Failed to parse students from localStorage', e);
    }

    const emptyStudents: StudentAccount[] = [];
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(emptyStudents));
    } catch (e) {
      console.error('Failed to initialize students', e);
    }

    return emptyStudents;
  }

  private static saveStudentsLocally(students: StudentAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }

  static saveStudents(students: StudentAccount[]): void {
    this.saveStudentsLocally(students);
    this.notifyDataUpdated();

    // Asynchronously synchronize with server
    fetch('/api/students/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students })
    }).catch(err => {
      console.warn('Background student sync to server failed:', err);
    });
  }

  static getCurrentStudent(): StudentAccount | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
      if (stored) {
        const student = JSON.parse(stored);
        if (student && (student.ugNumber === 'UG24AIDS001' || student.ugNumber === 'UG24AIDS042')) {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
          return null;
        }
        return student;
      }
    } catch (e) {
      console.warn('Failed to parse current student', e);
    }
    return null;
  }

  static setCurrentStudent(student: StudentAccount | null): void {
    try {
      if (student) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
      }
    } catch (e) {
      console.error('Failed to set current student', e);
    }
  }

  static isUgNumberRegistered(ugNumber: string): boolean {
    const clean = ugNumber.trim().toUpperCase();
    if (!clean) return false;
    const students = this.getStudents();
    return students.some(s => s.ugNumber.trim().toUpperCase() === clean);
  }

  static async registerStudentAsync(data: {
    ugNumber: string;
    fullName: string;
    email: string;
    semester: number;
    password: string;
    department?: string;
  }): Promise<{ success: boolean; message: string; student?: StudentAccount }> {
    const ugClean = data.ugNumber.trim().toUpperCase();
    if (!ugClean) {
      return { success: false, message: 'Student ID (UG Number) is required.' };
    }
    if (!data.fullName.trim()) {
      return { success: false, message: 'Full name is required.' };
    }
    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const students = this.getStudents();
    const existing = students.find(s => s.ugNumber.trim().toUpperCase() === ugClean);
    if (existing) {
      return {
        success: false,
        message: `Account Creation Limit: UG Number "${ugClean}" already has an account. Each UG Number can only create one account. Please sign in with your password.`
      };
    }

    const newStudent: StudentAccount = {
      ugNumber: ugClean,
      fullName: data.fullName.trim(),
      email: data.email.trim() || `${ugClean.toLowerCase()}@college.edu`,
      semester: Number(data.semester) || 1,
      password: data.password,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      department: data.department || 'Artificial Intelligence & Data Science'
    };

    // Save locally immediately
    students.unshift(newStudent);
    this.saveStudentsLocally(students);
    this.setCurrentStudent(newStudent);
    this.notifyDataUpdated();

    // Persist to Server API
    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.student) {
          return {
            success: true,
            message: json.message || `Account created successfully for ${newStudent.fullName} (${newStudent.ugNumber})!`,
            student: json.student
          };
        }
      }
    } catch (err) {
      console.warn('Server registration call warning, local account preserved:', err);
    }

    return {
      success: true,
      message: `Account created successfully for ${newStudent.fullName} (${newStudent.ugNumber})! Details saved in Admin Excel Database.`,
      student: newStudent
    };
  }

  static registerStudent(data: {
    ugNumber: string;
    fullName: string;
    email: string;
    semester: number;
    password: string;
    department?: string;
  }): { success: boolean; message: string; student?: StudentAccount } {
    const ugClean = data.ugNumber.trim().toUpperCase();
    if (!ugClean) {
      return { success: false, message: 'Student ID (UG Number) is required.' };
    }
    if (!data.fullName.trim()) {
      return { success: false, message: 'Full name is required.' };
    }
    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const students = this.getStudents();
    const existing = students.find(s => s.ugNumber.trim().toUpperCase() === ugClean);
    if (existing) {
      return {
        success: false,
        message: `Account Creation Limit: UG Number "${ugClean}" already has an account. Each UG Number can only create one account. Please sign in with your password.`
      };
    }

    const newStudent: StudentAccount = {
      ugNumber: ugClean,
      fullName: data.fullName.trim(),
      email: data.email.trim() || `${ugClean.toLowerCase()}@college.edu`,
      semester: Number(data.semester) || 1,
      password: data.password,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      department: data.department || 'Artificial Intelligence & Data Science'
    };

    students.unshift(newStudent);
    this.saveStudentsLocally(students);
    this.setCurrentStudent(newStudent);
    this.notifyDataUpdated();

    // Background server persist
    fetch('/api/students/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent)
    }).catch(err => {
      console.warn('Background server registration error:', err);
    });

    return {
      success: true,
      message: `Account created successfully for ${newStudent.fullName} (${newStudent.ugNumber})!`,
      student: newStudent
    };
  }

  static async loginStudentAsync(ugNumber: string, password: string): Promise<{ success: boolean; message: string; student?: StudentAccount }> {
    const ugClean = ugNumber.trim().toUpperCase();
    if (!ugClean) {
      return { success: false, message: 'Please enter your UG Number.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    // Check local accounts first
    const students = this.getStudents();
    let found = students.find(s => s.ugNumber.toUpperCase() === ugClean);

    // If not found locally, try server
    if (!found) {
      try {
        const res = await fetch('/api/students/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ugNumber: ugClean, password })
        });
        const data = await res.json();
        if (res.ok && data.success && data.student) {
          found = data.student;
          students.unshift(found!);
          this.saveStudentsLocally(students);
          this.setCurrentStudent(found!);
          this.notifyDataUpdated();
          return {
            success: true,
            message: data.message || `Welcome back, ${found!.fullName}!`,
            student: found!
          };
        } else if (data.message) {
          return { success: false, message: data.message };
        }
      } catch (err) {
        console.warn('Server login error:', err);
      }
    }

    if (!found) {
      return {
        success: false,
        message: `No student account found with UG Number "${ugClean}". Please create an account.`
      };
    }

    if (found.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.'
      };
    }

    // Update lastLoginAt
    found.lastLoginAt = Date.now();
    this.saveStudentsLocally(students);
    this.setCurrentStudent(found);
    this.notifyDataUpdated();

    // Tell server in background
    fetch('/api/students/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ugNumber: ugClean, password })
    }).catch(() => {});

    return {
      success: true,
      message: `Welcome back, ${found.fullName}!`,
      student: found
    };
  }

  static loginStudent(ugNumber: string, password: string): { success: boolean; message: string; student?: StudentAccount } {
    const ugClean = ugNumber.trim().toUpperCase();
    if (!ugClean) {
      return { success: false, message: 'Please enter your UG Number.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    const students = this.getStudents();
    const found = students.find(s => s.ugNumber.toUpperCase() === ugClean);

    if (!found) {
      return {
        success: false,
        message: `No student account found with UG Number "${ugClean}". Please create an account.`
      };
    }

    if (found.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.'
      };
    }

    // Update lastLoginAt
    found.lastLoginAt = Date.now();
    this.saveStudentsLocally(students);
    this.setCurrentStudent(found);
    this.notifyDataUpdated();

    // Async server notify
    fetch('/api/students/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ugNumber: ugClean, password })
    }).catch(() => {});

    return {
      success: true,
      message: `Welcome back, ${found.fullName}!`,
      student: found
    };
  }

  static logoutStudent(): void {
    this.setCurrentStudent(null);
    this.notifyDataUpdated();
  }

  static deleteStudent(ugNumber: string): boolean {
    const ugClean = ugNumber.trim().toUpperCase();
    const students = this.getStudents();
    const filtered = students.filter(s => s.ugNumber.toUpperCase() !== ugClean);
    if (filtered.length === students.length) return false;
    this.saveStudentsLocally(filtered);
    const current = this.getCurrentStudent();
    if (current && current.ugNumber.toUpperCase() === ugClean) {
      this.logoutStudent();
    }
    this.notifyDataUpdated();

    // Server delete
    fetch(`/api/students/${encodeURIComponent(ugClean)}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Server delete failed:', err));

    return true;
  }

  static clearAllStudents(): void {
    this.saveStudentsLocally([]);
    this.logoutStudent();
    this.notifyDataUpdated();

    // Server clear
    fetch('/api/students', {
      method: 'DELETE'
    }).catch(err => console.warn('Server clear failed:', err));
  }

  static async bulkImportStudents(newStudents: StudentAccount[]): Promise<{ success: boolean; importedCount: number; total: number }> {
    const current = this.getStudents();
    const existingUgs = new Set(current.map(s => s.ugNumber.toUpperCase()));

    let importedCount = 0;
    newStudents.forEach(s => {
      const ug = (s.ugNumber || '').trim().toUpperCase();
      if (ug && !existingUgs.has(ug)) {
        current.push({
          ugNumber: ug,
          fullName: (s.fullName || 'Student').trim(),
          email: (s.email || `${ug.toLowerCase()}@college.edu`).trim(),
          semester: Number(s.semester) || 1,
          password: s.password || 'Student@123',
          createdAt: s.createdAt || Date.now(),
          lastLoginAt: s.lastLoginAt || undefined,
          department: s.department || 'Artificial Intelligence & Data Science'
        });
        existingUgs.add(ug);
        importedCount++;
      }
    });

    current.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    this.saveStudentsLocally(current);
    this.notifyDataUpdated();

    // Persist to server
    try {
      const res = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: newStudents })
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, importedCount: data.importedCount || importedCount, total: current.length };
      }
    } catch (e) {
      console.warn('Server bulk import warning:', e);
    }

    return { success: true, importedCount, total: current.length };
  }

  // ===================== STUDENT CHAT SERVICE =====================
  static getStudentChatMessages(): StudentChatMessage[] {
    // One-time purge of all existing/starter chats as requested
    const cleanedFlag = localStorage.getItem('aids_hub_chat_cleaned_v2');
    if (!cleanedFlag) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_CHATS, JSON.stringify([]));
      localStorage.setItem('aids_hub_chat_cleaned_v2', 'true');
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENT_CHATS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse student chat messages from localStorage', e);
    }

    const emptyMessages: StudentChatMessage[] = [];
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT_CHATS, JSON.stringify(emptyMessages));
    } catch (e) {
      console.error('Failed to initialize chats', e);
    }

    return emptyMessages;
  }

  static saveStudentChatMessages(messages: StudentChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT_CHATS, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save student chat messages', e);
    }
  }

  static postStudentChatMessage(data: {
    studentName: string;
    ugNumber: string;
    semester?: number;
    message: string;
    category: StudentChatCategory;
    replyToId?: string;
    replyToText?: string;
    replyToSender?: string;
  }): StudentChatMessage {
    const messages = this.getStudentChatMessages();
    const newMsg: StudentChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentName: data.studentName.trim(),
      ugNumber: data.ugNumber.trim().toUpperCase(),
      semester: data.semester,
      message: data.message.trim(),
      category: data.category,
      timestamp: Date.now(),
      likes: 0,
      likedBy: [],
      replyToId: data.replyToId,
      replyToText: data.replyToText,
      replyToSender: data.replyToSender
    };

    messages.push(newMsg);
    this.saveStudentChatMessages(messages);
    return newMsg;
  }

  static toggleLikeChatMessage(messageId: string, userIdentifier: string): { likes: number; isLiked: boolean } {
    const messages = this.getStudentChatMessages();
    const target = messages.find(m => m.id === messageId);
    if (!target) return { likes: 0, isLiked: false };

    if (!target.likedBy) {
      target.likedBy = [];
    }

    const cleanUser = userIdentifier.trim().toUpperCase();
    const index = target.likedBy.findIndex(id => id.toUpperCase() === cleanUser);
    let isLiked = false;

    if (index >= 0) {
      target.likedBy.splice(index, 1);
      target.likes = Math.max(0, (target.likes || 1) - 1);
      isLiked = false;
    } else {
      target.likedBy.push(cleanUser);
      target.likes = (target.likes || 0) + 1;
      isLiked = true;
    }

    this.saveStudentChatMessages(messages);
    return { likes: target.likes, isLiked };
  }

  static deleteStudentChatMessage(messageId: string): boolean {
    const messages = this.getStudentChatMessages();
    const filtered = messages.filter(m => m.id !== messageId);
    if (filtered.length === messages.length) return false;
    this.saveStudentChatMessages(filtered);
    return true;
  }

  static clearAllStudentChatMessages(): void {
    this.saveStudentChatMessages([]);
  }
}
