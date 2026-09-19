export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface StudentAccount {
  ugNumber: string; // UG number of the AI & DS student (e.g. "UG24AIDS001")
  fullName: string;
  email: string;
  semester: number;
  password: string;
  createdAt: number;
  lastLoginAt?: number;
  department: string;
}

export type QuestionType =
  | 'mcq'
  | 'fill_blank'
  | 'short_answer'
  | 'long_answer'
  | 'programming'
  | 'numerical';

export interface PracticeQuestion {
  id: string;
  question: string;
  subjectId: string;
  subjectName: string;
  unitNumber: number;
  unitName: string;
  topicId: string;
  topicName: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  marks: number;
  options?: string[]; // For MCQs
  correctAnswer: string;
  explanation: string;
  hints?: string;
  codeSnippet?: string; // Optional code snippet for programming questions
  isPreviousExamQuestion?: boolean;
  year?: string;
}

export interface TopicStudyMaterial {
  overview: string;
  keyConcepts: string[];
  detailedExplanation: string;
  codeOrFormulaExample?: {
    title: string;
    language?: string;
    content: string;
    explanation?: string;
  };
  examTips: string[];
  applicationsInAIAndDS?: string;
}

export interface Topic {
  id: string;
  name: string;
  unitNumber: number;
  description: string;
  difficulty: DifficultyLevel;
  studyMaterial: TopicStudyMaterial;
  estimatedMinutes: number;
}

export interface Unit {
  unitNumber: number;
  name: string;
  description: string;
  topics: Topic[];
  weightageMarks: number;
}

export interface QuestionPaperSection {
  title: string;
  instructions: string;
  questions: {
    questionNumber: number;
    question: string;
    marks: number;
    options?: string[];
    answer: string;
    detailedSolution: string;
    type: QuestionType;
  }[];
}

export interface QuestionPaper {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  unitNumber?: number; // optional, undefined means full syllabus
  paperType: 'unit_test' | 'mid_sem' | 'end_sem' | 'practice';
  durationMinutes: number;
  totalMarks: number;
  instructions: string[];
  sections: QuestionPaperSection[];
}

export interface UploadedSyllabusDocument {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // e.g. "application/pdf" | "text/plain" | "application/json" | etc.
  fileDataUrl?: string; // Data URL for download/preview
  textContent?: string; // Textual content or summary for immediate preview
  uploadedAt: number; // Timestamp
  uploadedBy: string; // e.g. "Prof. Academic Admin" / "HOD AI & DS"
  academicYear: string; // e.g. "2025-2026"
  regulation: string; // e.g. "R24 Regulation"
  unitCount?: number;
  notes?: string;
  classDiscussionUnit?: number;
  classDiscussionText?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: 'core_cs' | 'applied_ai' | 'basic_sciences' | 'engineering' | 'humanities';
  semester: number;
  credits: number;
  description: string;
  accentColor: string; // Tailwind color class or hex
  gradient: string;
  badge: string;
  syllabusOverview: string;
  units: Unit[];
  courseObjectives: string[];
  courseOutcomes: string[];
  uploadedSyllabus?: UploadedSyllabusDocument;
}

export interface StudentProgress {
  completedTopicIds: string[];
  bookmarkedQuestionIds: string[];
  quizAttempts: {
    id: string;
    timestamp: number;
    subjectId: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    percentage: number;
  }[];
  paperAttempts: {
    paperId: string;
    timestamp: number;
    score: number;
    totalMarks: number;
    percentage: number;
    timeSpentSeconds: number;
  }[];
}

export interface ClassDiscussion {
  id: string;
  subjectId: string;
  subjectName: string;
  shortName?: string;
  semester: number;
  unitNumber: number; // which unit is discussed in the class
  unitName: string;
  date: string; // e.g. YYYY-MM-DD
  classSessionTitle: string; // e.g. "Lecture: Recurrences & Divide-and-Conquer"
  discussionText: string; // Text form of what was discussed in the class
  facultyName?: string;
  keyPoints?: string[];
  homeworkOrTask?: string;
  createdAt: number;
}

export type StudentChatCategory =
  | 'General'
  | 'Doubt'
  | 'Study Group'
  | 'Exam Prep'
  | 'Project / Lab';

export interface StudentChatMessage {
  id: string;
  studentName: string;
  ugNumber: string; // UG number of the student (e.g. "UG24AIDS001") or "ADMIN"
  semester?: number;
  message: string;
  category: StudentChatCategory;
  timestamp: number;
  likes: number;
  likedBy?: string[]; // Array of UG numbers who liked this message
  replyToId?: string;
  replyToText?: string;
  replyToSender?: string;
}

export type ActiveView =
  | 'home'
  | 'syllabus'
  | 'subjects'
  | 'subject-detail'
  | 'topic-detail'
  | 'practice'
  | 'question-papers'
  | 'paper-attempt'
  | 'class-discussion'
  | 'progress'
  | 'about';
