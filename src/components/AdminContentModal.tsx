import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  RotateCcw,
  Download,
  Upload,
  BookOpen,
  HelpCircle,
  Layers,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Lock,
  FileText,
  KeyRound,
  Trash2,
  Info,
  ExternalLink,
  FileUp,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import {
  Subject,
  DifficultyLevel,
  UploadedSyllabusDocument
} from '../types.ts';
import { AcademicService } from '../services/academicService.ts';
import { AdminPracticeQuestionsTab } from './AdminPracticeQuestionsTab.tsx';
import { AdminPracticePapersTab } from './AdminPracticePapersTab.tsx';
import { AdminClassDiscussionTab } from './AdminClassDiscussionTab.tsx';
import { AdminBackendExcelSheetTab } from './AdminBackendExcelSheetTab.tsx';

export type AdminTab =
  | 'backend_excel'
  | 'upload_syllabus'
  | 'class_discussion'
  | 'upload_questions'
  | 'upload_papers'
  | 'add_topic'
  | 'data_management';

interface AdminContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onRefreshData: () => void;
  initialTab?: AdminTab;
  initialSubjectId?: string | null;
  isAdmin: boolean;
  onLoginAdmin: () => void;
  onLogoutAdmin: () => void;
}

export const AdminContentModal: React.FC<AdminContentModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onRefreshData,
  initialTab = 'upload_syllabus',
  initialSubjectId,
  isAdmin,
  onLoginAdmin,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Backup, Restore & Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [copiedBackup, setCopiedBackup] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreJsonString, setRestoreJsonString] = useState<string>('');
  const [restorePreview, setRestorePreview] = useState<{
    subjects: number;
    questions: number;
    papers: number;
    department?: string;
  } | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const restoreFileInputRef = useRef<HTMLInputElement | null>(null);

  // Admin login state (if not authenticated)
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Upload Syllabus Form State
  const [sylSubjectId, setSylSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || 'pps'
  );
  const [sylRegulation, setSylRegulation] = useState('R24 Autonomous Scheme');
  const [sylYear, setSylYear] = useState('2025-2026');
  const [sylUploadedBy, setSylUploadedBy] = useState('Prof. Dr. R. K. Sharma (HOD, AI & DS)');
  const [sylNotes, setSylNotes] = useState(
    'Approved by Board of Studies for Artificial Intelligence & Data Science.'
  );
  const [sylFile, setSylFile] = useState<File | null>(null);
  const [sylDataUrl, setSylDataUrl] = useState<string>('');
  const [sylTextContent, setSylTextContent] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Topic Form State
  const [topicSubjectId, setTopicSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || 'pps'
  );
  const [topicUnitNumber, setTopicUnitNumber] = useState<number>(1);
  const [topicUnitName, setTopicUnitName] = useState<string>('Unit 1: Foundations');
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicEstTime, setTopicEstTime] = useState(25);
  const [topicDifficulty, setTopicDifficulty] = useState<DifficultyLevel>('medium');
  const [topicExplanation, setTopicExplanation] = useState('');
  const [topicKeyConcepts, setTopicKeyConcepts] = useState('');

  useEffect(() => {
    const sub = subjects.find(s => s.id === topicSubjectId);
    const existingUnit = sub?.units.find(u => u.unitNumber === topicUnitNumber);
    if (existingUnit) {
      setTopicUnitName(existingUnit.name);
    }
  }, [topicSubjectId, topicUnitNumber, subjects]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialSubjectId) {
      setSylSubjectId(initialSubjectId);
      setTopicSubjectId(initialSubjectId);
    }
  }, [initialSubjectId]);

  if (!isOpen) return null;

  // Handler for Admin Passcode Login
  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const valid = AcademicService.loginAdmin(passcode);
    if (valid) {
      setPasscode('');
      onLoginAdmin();
    } else {
      setLoginError('Invalid passcode. Faculty key is required to manage curriculum.');
    }
  };

  const selectedSylSubject = subjects.find(s => s.id === sylSubjectId) || subjects[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadError(null);
    setSylFile(file);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setSylDataUrl(dataUrl);

      if (
        file.type.includes('text') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.md')
      ) {
        const textReader = new FileReader();
        textReader.onload = tEv => {
          setSylTextContent(tEv.target?.result as string);
          setIsUploading(false);
        };
        textReader.readAsText(file);
      } else {
        setSylTextContent(
          `Official Syllabus Document: ${file.name}\nScheme: ${sylRegulation}\nCourse: ${selectedSylSubject?.name} (${selectedSylSubject?.code})`
        );
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please select another document.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleUploadSyllabusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sylFile && !sylDataUrl && !selectedSylSubject.uploadedSyllabus) {
      setUploadError('Please select or drop a syllabus document file to upload.');
      return;
    }

    try {
      const syllabusDoc: UploadedSyllabusDocument = {
        id: `syl-${sylSubjectId}-${Date.now()}`,
        fileName: sylFile
          ? sylFile.name
          : selectedSylSubject.uploadedSyllabus?.fileName ||
            `${selectedSylSubject.shortName}_Syllabus_${sylRegulation}.pdf`,
        fileSize: sylFile
          ? sylFile.size
          : selectedSylSubject.uploadedSyllabus?.fileSize || 180000,
        fileType: sylFile
          ? sylFile.type
          : selectedSylSubject.uploadedSyllabus?.fileType || 'application/pdf',
        fileDataUrl: sylDataUrl || selectedSylSubject.uploadedSyllabus?.fileDataUrl,
        textContent:
          sylTextContent ||
          selectedSylSubject.uploadedSyllabus?.textContent ||
          `${selectedSylSubject.name} Official Syllabus`,
        uploadedAt: Date.now(),
        uploadedBy: sylUploadedBy.trim() || 'Department Faculty Admin',
        academicYear: sylYear.trim() || '2025-2026',
        regulation: sylRegulation.trim() || 'R24 Scheme',
        unitCount: selectedSylSubject.units.length,
        notes: sylNotes.trim(),
      };

      AcademicService.uploadSubjectSyllabus(sylSubjectId, syllabusDoc);

      onRefreshData();
      setSuccessMessage(
        `Syllabus document for ${selectedSylSubject.name} (${selectedSylSubject.shortName}) published successfully!`
      );
      setSylFile(null);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload syllabus.');
    }
  };

  const requestRemoveSubjectSyllabus = (subjectId: string, subjectName: string) => {
    setConfirmDialog({
      title: `Remove Syllabus for ${subjectName}?`,
      description: `Are you sure you want to remove the uploaded syllabus document for ${subjectName}?`,
      confirmLabel: 'Remove Document',
      isDestructive: true,
      onConfirm: () => {
        AcademicService.removeSubjectSyllabus(subjectId);
        onRefreshData();
        setSuccessMessage(`Syllabus document removed for ${subjectName}.`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setConfirmDialog(null);
      },
    });
  };

  const handleRemoveExistingSyllabus = (subjectId: string) => {
    const sName = subjects.find(s => s.id === subjectId)?.shortName || 'this subject';
    requestRemoveSubjectSyllabus(subjectId, sName);
  };

  const requestClearAllUploadedSyllabi = () => {
    setConfirmDialog({
      title: 'Clean All Uploaded Syllabi?',
      description:
        'This will remove all uploaded syllabus documents and PDFs across all subjects while keeping all study topics, notes, and questions intact.',
      confirmLabel: 'Yes, Clean All Syllabi',
      isDestructive: true,
      onConfirm: () => {
        AcademicService.clearAllUploadedSyllabi();
        onRefreshData();
        setSuccessMessage('All uploaded syllabus documents have been cleaned successfully.');
        setTimeout(() => setSuccessMessage(null), 3500);
        setConfirmDialog(null);
      },
    });
  };

  const requestClearAllPapers = () => {
    setConfirmDialog({
      title: 'Clean All Practice Question Papers?',
      description:
        'This will permanently delete all published practice exam papers and class tests across all subjects.',
      confirmLabel: 'Yes, Clean All Papers',
      isDestructive: true,
      onConfirm: () => {
        AcademicService.clearAllQuestionPapers();
        onRefreshData();
        setSuccessMessage('All practice question papers have been cleaned from the exam archive.');
        setTimeout(() => setSuccessMessage(null), 3500);
        setConfirmDialog(null);
      },
    });
  };

  const requestClearAllUnits = () => {
    setConfirmDialog({
      title: 'Clean All Units Across All Subjects?',
      description:
        'This will wipe all units and topics across all subjects, giving faculty a clean slate to upload or configure new modular units.',
      confirmLabel: 'Yes, Clean All Units',
      isDestructive: true,
      onConfirm: () => {
        AcademicService.clearAllUnits();
        onRefreshData();
        setSuccessMessage('All units and topics have been removed across all subjects.');
        setTimeout(() => setSuccessMessage(null), 3500);
        setConfirmDialog(null);
      },
    });
  };

  const requestClearAllQuestions = () => {
    setConfirmDialog({
      title: 'Clean All Practice Questions?',
      description:
        'This will wipe and delete all practice questions from the question bank across all subjects. This allows you to start fresh before uploading new question sets.',
      confirmLabel: 'Yes, Clean All Questions',
      isDestructive: true,
      onConfirm: () => {
        AcademicService.clearAllQuestions();
        onRefreshData();
        setSuccessMessage('All practice questions have been cleaned from the question bank.');
        setTimeout(() => setSuccessMessage(null), 3500);
        setConfirmDialog(null);
      },
    });
  };

  const requestClearAllDiscussions = () => {
    setConfirmDialog({
      title: 'Clean All Class Discussions?',
      description:
        'This will wipe and delete all classroom lecture discussion logs, notes, and records across all subjects and semesters.',
      confirmLabel: 'Yes, Clean All Discussions',
      isDestructive: true,
      onConfirm: () => {
        AcademicService.clearAllClassDiscussions();
        onRefreshData();
        setSuccessMessage('All class discussion data has been cleaned successfully.');
        setTimeout(() => setSuccessMessage(null), 3500);
        setConfirmDialog(null);
      },
    });
  };

  const requestResetData = () => {
    setConfirmDialog({
      title: 'Reset to Factory Curriculum Data?',
      description:
        'This will restore all 6 departmental subjects, all syllabus units, detailed topic explanations, question banks, and examination papers back to the official university scheme. Any custom topics or uploaded PDFs will be cleanly reset.',
      confirmLabel: 'Yes, Reset to Factory Defaults',
      isDestructive: true,
      onConfirm: () => {
        AcademicService.resetToDefaults();
        onRefreshData();
        setSuccessMessage('Curriculum successfully reset to factory defaults.');
        setTimeout(() => setSuccessMessage(null), 4000);
        setConfirmDialog(null);
      },
    });
  };

  const handleExportJSON = () => {
    try {
      const json = AcademicService.exportAllAsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aids_curriculum_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setSuccessMessage('Curriculum backup file downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      handleCopyBackupJSON();
    }
  };

  const handleCopyBackupJSON = () => {
    const json = AcademicService.exportAllAsJSON();
    const sizeKb = Math.round(json.length / 1024);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(
        () => {
          setCopiedBackup(true);
          setSuccessMessage(`Curriculum backup JSON (${sizeKb} KB) copied to clipboard!`);
          setTimeout(() => {
            setCopiedBackup(false);
            setSuccessMessage(null);
          }, 3500);
        },
        () => fallbackCopy(json, sizeKb)
      );
    } else {
      fallbackCopy(json, sizeKb);
    }
  };

  const fallbackCopy = (json: string, sizeKb: number) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = json;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedBackup(true);
      setSuccessMessage(`Curriculum backup JSON (${sizeKb} KB) copied to clipboard!`);
      setTimeout(() => {
        setCopiedBackup(false);
        setSuccessMessage(null);
      }, 3500);
    } catch (err) {
      alert('Could not copy automatically. You can download the JSON file instead.');
    }
  };

  const handleRestoreFileSelect = (file: File) => {
    setRestoreError(null);
    setRestoreFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setRestoreJsonString(text);
        const parsed = JSON.parse(text);
        const subCount = Array.isArray(parsed.subjects) ? parsed.subjects.length : 0;
        const qCount = Array.isArray(parsed.questions) ? parsed.questions.length : 0;
        const pCount = Array.isArray(parsed.questionPapers) ? parsed.questionPapers.length : 0;
        if (subCount === 0 && qCount === 0 && pCount === 0) {
          setRestoreError('File does not contain recognizable subjects, questions, or papers data.');
          setRestorePreview(null);
        } else {
          setRestorePreview({
            subjects: subCount,
            questions: qCount,
            papers: pCount,
            department: parsed.department,
          });
        }
      } catch (err: any) {
        setRestoreError('Invalid JSON file. Please ensure it is a valid backup export.');
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!restoreJsonString) return;
    setConfirmDialog({
      title: 'Restore Curriculum from Backup?',
      description: `This will overwrite and update current curriculum data with ${restorePreview?.subjects || 0} subjects, ${restorePreview?.questions || 0} practice questions, and ${restorePreview?.papers || 0} examination papers from your backup file.`,
      confirmLabel: 'Yes, Restore Backup',
      isDestructive: false,
      onConfirm: () => {
        setIsRestoring(true);
        const res = AcademicService.importDataFromJSON(restoreJsonString);
        setIsRestoring(false);
        if (res.success) {
          onRefreshData();
          setSuccessMessage(res.message);
          setRestoreFile(null);
          setRestoreJsonString('');
          setRestorePreview(null);
          setTimeout(() => setSuccessMessage(null), 4500);
        } else {
          setRestoreError(res.message);
        }
        setConfirmDialog(null);
      },
    });
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !topicExplanation.trim()) {
      alert('Please fill out the topic name and explanation.');
      return;
    }
    if (!topicUnitName.trim()) {
      alert('Please write a target unit name.');
      return;
    }

    const concepts = topicKeyConcepts
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newTopic = {
      id: `${topicSubjectId}-u${topicUnitNumber}-t${Date.now().toString().slice(-4)}`,
      name: topicName.trim(),
      unitNumber: topicUnitNumber,
      description: topicDesc.trim() || topicName.trim(),
      difficulty: topicDifficulty,
      estimatedMinutes: topicEstTime,
      studyMaterial: {
        overview: topicDesc.trim() || topicName.trim(),
        detailedExplanation: topicExplanation.trim(),
        keyConcepts: concepts.length > 0 ? concepts : ['Core concept of ' + topicName],
        examTips: ['Highlight core formulas and definitions in university answer sheets.'],
      },
    };

    AcademicService.addTopic(
      topicSubjectId,
      topicUnitNumber,
      newTopic,
      topicUnitName.trim()
    );
    setSuccessMessage(`Topic "${topicName}" added successfully to Unit ${topicUnitNumber}: ${topicUnitName.trim()}!`);
    setTopicName('');
    setTopicDesc('');
    setTopicExplanation('');
    setTopicKeyConcepts('');
    onRefreshData();
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 transition-opacity">
      <div
        id="admin-content-management-modal"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Academic & Curriculum Management
                </h3>
                {isAdmin ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Admin Mode
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Auth Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload subject syllabus documents, add topics, manage question bank, and export data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onLogoutAdmin}
                className="text-xs text-slate-500 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Log out from admin session"
              >
                Log Out
              </button>
            )}
            <button
              id="close-admin-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If NOT Admin: Show Admin Authentication Gate */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Faculty Administrator Verification
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Uploading course syllabi and modifying university curriculum is restricted strictly to authorized department administrators. Normal students have read and download access only.
              </p>
            </div>

            <form onSubmit={handlePasscodeLogin} className="max-w-sm mx-auto space-y-3 pt-2">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter admin passcode"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  required
                />
              </div>

              {loginError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin Panel</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 pt-2 overflow-x-auto">
              <button
                id="tab-backend-excel"
                onClick={() => setActiveTab('backend_excel')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'backend_excel'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Backend Excel Sheet</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                  DB
                </span>
              </button>
              <button
                id="tab-upload-syllabus"
                onClick={() => setActiveTab('upload_syllabus')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'upload_syllabus'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Subject Syllabus</span>
              </button>
              <button
                id="tab-class-discussion"
                onClick={() => setActiveTab('class_discussion')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'class_discussion'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Class Discussion (Text Form)</span>
              </button>
              <button
                id="tab-upload-questions"
                onClick={() => setActiveTab('upload_questions')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'upload_questions'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Practice Questions</span>
              </button>
              <button
                id="tab-upload-papers"
                onClick={() => setActiveTab('upload_papers')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'upload_papers'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Practice Papers</span>
              </button>
              <button
                id="tab-add-topic"
                onClick={() => setActiveTab('add_topic')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'add_topic'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Syllabus Topics Option</span>
              </button>
              <button
                id="tab-data-mgmt"
                onClick={() => setActiveTab('data_management')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'data_management'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Backup & Reset</span>
              </button>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div className="m-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB: BACKEND EXCEL SPREADSHEET & UPLOAD INVENTORY (ADMIN ONLY) */}
            {activeTab === 'backend_excel' && (
              <div className="p-6 max-h-[75vh] overflow-y-auto">
                <AdminBackendExcelSheetTab
                  subjects={subjects}
                  onRefreshData={onRefreshData}
                  onNavigateTab={(tab, subId) => {
                    setActiveTab(tab as AdminTab);
                    if (subId) {
                      setSylSubjectId(subId);
                    }
                  }}
                />
              </div>
            )}

            {/* TAB 1: UPLOAD SUBJECT SYLLABUS */}
            {activeTab === 'upload_syllabus' && (
              <form
                onSubmit={handleUploadSyllabusSubmit}
                className="p-6 space-y-5 max-h-[65vh] overflow-y-auto"
              >
                {/* Global Clean All Syllabi Notice (if any subject has uploaded syllabus) */}
                {subjects.some(s => s.uploadedSyllabus) && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
                      <Trash2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        Uploaded syllabus files exist in one or more courses.
                      </span>
                    </div>
                    <button
                      type="button"
                      id="clean-all-syllabi-tab1-btn"
                      onClick={requestClearAllUploadedSyllabi}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition self-end sm:self-auto shrink-0 shadow-2xs"
                      title="Remove uploaded syllabus documents from every subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clean All Uploaded Syllabi</span>
                    </button>
                  </div>
                )}

                {/* Target Subject Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Subject to Upload Syllabus For
                  </label>
                  <select
                    id="admin-syllabus-subject-select"
                    value={sylSubjectId}
                    onChange={e => setSylSubjectId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                      const semSubs = subjects.filter(s => s.semester === sem);
                      if (semSubs.length === 0) return null;
                      return (
                        <optgroup key={sem} label={`Semester ${sem}`}>
                          {semSubs.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.shortName} – {s.name} ({s.code}) [Sem {s.semester}]
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                {/* Existing Syllabus Info (if already published for this subject) */}
                {selectedSylSubject.uploadedSyllabus && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Current Published File: {selectedSylSubject.uploadedSyllabus.fileName}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {selectedSylSubject.uploadedSyllabus.regulation} •{' '}
                          {formatFileSize(selectedSylSubject.uploadedSyllabus.fileSize)} • By{' '}
                          {selectedSylSubject.uploadedSyllabus.uploadedBy}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() =>
                          AcademicService.downloadSyllabusFile(
                            selectedSylSubject.uploadedSyllabus!,
                            selectedSylSubject.shortName
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingSyllabus(selectedSylSubject.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete existing syllabus document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Drag and Drop Zone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {selectedSylSubject.uploadedSyllabus
                      ? 'Upload Replacement Document (PDF, Word, Text, JSON)'
                      : 'Upload Syllabus Document (PDF, Word, Text, JSON)'}
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : sylFile
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.json,.md"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {sylFile ? (
                      <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {sylFile.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatFileSize(sylFile.size)} • Click to choose a different file
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Choose syllabus file to upload
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {' '}
                            or drop it here
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          PDF, DOCX, TXT, MD, JSON (Supports files up to 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {uploadError && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Regulation / Scheme
                    </label>
                    <input
                      type="text"
                      value={sylRegulation}
                      onChange={e => setSylRegulation(e.target.value)}
                      placeholder="e.g. R24 Autonomous Scheme"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={sylYear}
                      onChange={e => setSylYear(e.target.value)}
                      placeholder="e.g. 2025-2026"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Uploaded By (Faculty / In-Charge Name)
                  </label>
                  <input
                    type="text"
                    value={sylUploadedBy}
                    onChange={e => setSylUploadedBy(e.target.value)}
                    placeholder="Faculty name & designation"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BoS Approval Notes & Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={sylNotes}
                    onChange={e => setSylNotes(e.target.value)}
                    placeholder="Details on curriculum revision, textbook editions, or approval date..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-syllabus-upload-btn"
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Publish Official Syllabus Document</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB: CLASS DISCUSSION (WHICH UNIT IS DISCUSSED ON CLASS AS TEXT FORM) */}
            {activeTab === 'class_discussion' && (
              <AdminClassDiscussionTab
                subjects={subjects}
                initialSubjectId={initialSubjectId}
                onRefreshData={onRefreshData}
                setSuccessMessage={setSuccessMessage}
              />
            )}

            {/* TAB 2: ADD TOPIC */}
            {activeTab === 'add_topic' && (
              <form onSubmit={handleAddTopic} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Subject
                    </label>
                    <select
                      value={topicSubjectId}
                      onChange={e => setTopicSubjectId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Unit (Write Unit & Name)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <input
                          id="topic-unit-number-input"
                          type="number"
                          min={1}
                          max={20}
                          value={topicUnitNumber}
                          onChange={e => setTopicUnitNumber(Math.max(1, Number(e.target.value) || 1))}
                          placeholder="Unit #"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          id="topic-unit-name-input"
                          type="text"
                          value={topicUnitName}
                          onChange={e => setTopicUnitName(e.target.value)}
                          placeholder="Unit Name (e.g. Algorithmic Thinking & Foundations)"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Topic Title
                  </label>
                  <input
                    type="text"
                    value={topicName}
                    onChange={e => setTopicName(e.target.value)}
                    placeholder="e.g. Asymptotic Notations: Big-O, Omega, and Theta"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={topicDifficulty}
                      onChange={e => setTopicDifficulty(e.target.value as DifficultyLevel)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="easy">Easy (Foundational)</option>
                      <option value="medium">Medium (Standard Exam)</option>
                      <option value="hard">Hard (Advanced Analytical)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Study Time (Minutes)
                    </label>
                    <input
                      type="number"
                      value={topicEstTime}
                      onChange={e => setTopicEstTime(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brief Overview
                  </label>
                  <input
                    type="text"
                    value={topicDesc}
                    onChange={e => setTopicDesc(e.target.value)}
                    placeholder="One-sentence summary of this topic"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Explanation & Notes
                  </label>
                  <textarea
                    rows={4}
                    value={topicExplanation}
                    onChange={e => setTopicExplanation(e.target.value)}
                    placeholder="Comprehensive academic explanation, derivations, equations, and rules..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Key Concepts (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={topicKeyConcepts}
                    onChange={e => setTopicKeyConcepts(e.target.value)}
                    placeholder="Concept 1: Definition of Big-O&#10;Concept 2: Tight Bound Comparison"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
                  >
                    Add Topic to Syllabus
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: PRACTICE QUESTIONS */}
            {activeTab === 'upload_questions' && (
              <AdminPracticeQuestionsTab
                subjects={subjects}
                initialSubjectId={initialSubjectId}
                onRefreshData={onRefreshData}
                onShowSuccess={msg => {
                  setSuccessMessage(msg);
                  setTimeout(() => setSuccessMessage(null), 4000);
                }}
              />
            )}

            {/* TAB 3: PRACTICE PAPERS */}
            {activeTab === 'upload_papers' && (
              <AdminPracticePapersTab
                subjects={subjects}
                initialSubjectId={initialSubjectId}
                onRefreshData={onRefreshData}
                onShowSuccess={msg => {
                  setSuccessMessage(msg);
                  setTimeout(() => setSuccessMessage(null), 4000);
                }}
              />
            )}

            {/* TAB 4: DATA MANAGEMENT (BACKUP & RESET) */}
            {activeTab === 'data_management' && (
              <div className="p-6 space-y-6 max-h-[68vh] overflow-y-auto">
                {/* Stats Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {subjects.length}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Semester Subjects
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {AcademicService.getQuestions().length}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Practice Questions
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {AcademicService.getQuestionPapers().length}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Exam Papers
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {subjects.filter(s => s.uploadedSyllabus).length}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Uploaded Syllabi
                    </div>
                  </div>
                </div>

                {/* Quick Link: Backend Excel Spreadsheet Database */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Backend Excel Spreadsheet Database</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                        Admin Only
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400 leading-relaxed">
                      View all curriculum data stored in the backend Excel format: semester-wise syllabus, unit-wise practice questions, and uploaded practice papers with live inventory counts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('backend_excel')}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>Open Excel Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Section 1: Backup & Export */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Curriculum Backup & Export
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Full JSON Export
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create a full downloadable backup containing all subjects, modular units, study topics, detailed explanations, uploaded syllabus files, question bank, and examination papers.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      id="export-json-btn"
                      onClick={handleExportJSON}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Backup (.json)</span>
                    </button>
                    <button
                      id="copy-json-btn"
                      onClick={handleCopyBackupJSON}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition flex items-center gap-1.5"
                    >
                      {copiedBackup ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Backup JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Section 2: Restore from Backup */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Restore Curriculum from Backup
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Import JSON
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a previously exported curriculum JSON file to restore subjects, units, question banks, and examination papers.
                  </p>

                  <input
                    ref={restoreFileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleRestoreFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  {!restoreFile ? (
                    <div
                      onClick={() => restoreFileInputRef.current?.click()}
                      className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl text-center cursor-pointer transition bg-white/60 dark:bg-slate-900/40"
                    >
                      <FileUp className="w-7 h-7 mx-auto text-indigo-500 mb-2" />
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Click or drag a curriculum backup JSON file here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Accepts official .json backup files
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                            {restoreFile.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({Math.round(restoreFile.size / 1024)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRestoreFile(null);
                            setRestoreJsonString('');
                            setRestorePreview(null);
                            setRestoreError(null);
                          }}
                          className="text-xs text-rose-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>

                      {restorePreview && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                          <div className="font-semibold">Valid Backup Package Detected:</div>
                          <div className="flex flex-wrap gap-3 text-[11px] text-emerald-700 dark:text-emerald-400">
                            <span>• {restorePreview.subjects} Subjects</span>
                            <span>• {restorePreview.questions} Practice Questions</span>
                            <span>• {restorePreview.papers} Exam Papers</span>
                          </div>
                        </div>
                      )}

                      {restoreError && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                          {restoreError}
                        </div>
                      )}

                      <button
                        id="apply-restore-btn"
                        onClick={handleExecuteRestore}
                        disabled={!restorePreview || isRestoring}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                        <span>{isRestoring ? 'Restoring...' : 'Restore Curriculum from this Backup'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 3: Reset & Maintenance Tools */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Curriculum Reset & Maintenance Tools
                  </h5>

                  {/* Reset to Factory Defaults */}
                  <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                      Reset to Default College Curriculum
                    </h4>
                    <p className="text-xs text-rose-800/80 dark:text-rose-400">
                      Restores all 6 semester subjects, modular units, in-depth topic notes, official practice questions, and question papers back to university factory defaults.
                    </p>
                    <button
                      id="reset-syllabus-data-btn"
                      onClick={requestResetData}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Factory Curriculum Data</span>
                    </button>
                  </div>

                  {/* Clean Practice Questions */}
                  <div className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/15 border border-rose-200/80 dark:border-rose-900/30 space-y-3">
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Clean All Practice Questions
                    </h4>
                    <p className="text-xs text-rose-800/80 dark:text-rose-400">
                      Wipes and deletes all practice questions across all subjects from the question bank. Allows admins to start fresh before uploading new question sets.
                    </p>
                    <button
                      id="clean-all-questions-data-btn"
                      onClick={requestClearAllQuestions}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clean All Practice Questions</span>
                    </button>
                  </div>

                  {/* Clean Question Papers */}
                  <div className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/15 border border-rose-200/80 dark:border-rose-900/30 space-y-3">
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Clean All Practice Question Papers
                    </h4>
                    <p className="text-xs text-rose-800/80 dark:text-rose-400">
                      Wipes and deletes all published practice exam papers and class tests across all subjects.
                    </p>
                    <button
                      id="clean-all-papers-data-btn"
                      onClick={requestClearAllPapers}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clean All Practice Papers</span>
                    </button>
                  </div>

                  {/* Clean All Units Across All Subjects */}
                  <div className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/15 border border-rose-200/80 dark:border-rose-900/30 space-y-3">
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Clean All Units Across All Subjects
                    </h4>
                    <p className="text-xs text-rose-800/80 dark:text-rose-400">
                      Wipes all modular units and topics across all 6 subjects, allowing faculty and course coordinators to set up or upload custom units.
                    </p>
                    <button
                      id="clean-all-units-data-btn"
                      onClick={requestClearAllUnits}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clean All Units</span>
                    </button>
                  </div>

                  {/* Clean Uploaded Syllabi */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Clean Uploaded Syllabi Across All Subjects
                    </h4>
                    <p className="text-xs text-amber-800/80 dark:text-amber-400">
                      Removes all uploaded syllabus documents, PDFs, and files from all subjects while keeping all study topics, explanations, and practice questions completely intact.
                    </p>
                    <button
                      id="clean-all-syllabi-data-btn"
                      onClick={requestClearAllUploadedSyllabi}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clean All Uploaded Syllabi</span>
                    </button>
                  </div>

                  {/* Clean All Class Discussions */}
                  <div className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/15 border border-rose-200/80 dark:border-rose-900/30 space-y-3">
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Clean All Class Discussions
                    </h4>
                    <p className="text-xs text-rose-800/80 dark:text-rose-400">
                      Deletes and clears all recorded classroom lecture discussion notes, unit topic logs, student Q&A, and homework tasks across all subjects and semesters.
                    </p>
                    <button
                      id="clean-all-discussions-data-btn"
                      onClick={requestClearAllDiscussions}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clean All Class Discussions</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* IN-MODAL CONFIRMATION DIALOG (Zero dependency on window.confirm) */}
      {confirmDialog && (
        <div
          id="admin-confirmation-backdrop"
          className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            id="admin-confirmation-modal"
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50'
                }`}
              >
                {confirmDialog.isDestructive ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <RefreshCw className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                id="cancel-confirm-dialog-btn"
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                id="accept-confirm-dialog-btn"
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmDialog.confirmLabel || 'Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
