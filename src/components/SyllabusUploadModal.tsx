import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Lock,
  MessageSquare
} from 'lucide-react';
import { Subject, UploadedSyllabusDocument, Unit } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';

interface SyllabusUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectId?: string | null;
  isAdmin: boolean;
  onRequestAdminLogin: () => void;
  onRefreshData: () => void;
}

export const SyllabusUploadModal: React.FC<SyllabusUploadModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSubjectId,
  isAdmin,
  onRequestAdminLogin,
  onRefreshData,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || 'pps'
  );
  const [regulation, setRegulation] = useState('R24 Autonomous Scheme');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [uploadedBy, setUploadedBy] = useState('Prof. Dr. R. K. Sharma (HOD, AI & DS)');
  const [notes, setNotes] = useState(
    'Approved by the Board of Studies (BoS) for B.Tech AI & DS curriculum.'
  );
  const [autoParseUnits, setAutoParseUnits] = useState(false);

  // Class Discussion Option in Uploading Section
  const [includeClassDiscussion, setIncludeClassDiscussion] = useState<boolean>(true);
  const [discussionUnit, setDiscussionUnit] = useState<number>(1);
  const [discussionText, setDiscussionText] = useState<string>('');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileTextContent, setFileTextContent] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update selected subject when initialSubjectId changes
  React.useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
    }
  }, [initialSubjectId]);

  if (!isOpen) return null;

  // Gate check: If user is NOT admin, show Restricted Access card
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 transition-opacity">
        <div
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Admin Access Required
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Only authorized department faculty and administrators have permission to upload or modify subject syllabi. Normal students can view and download published syllabi.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestAdminLogin();
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login as Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    setUploadError(null);
    setFile(selectedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      setFileDataUrl(dataUrl);

      // If text or JSON, also read content
      if (
        selectedFile.type.includes('text') ||
        selectedFile.type.includes('json') ||
        selectedFile.name.endsWith('.txt') ||
        selectedFile.name.endsWith('.json') ||
        selectedFile.name.endsWith('.md')
      ) {
        const textReader = new FileReader();
        textReader.onload = textEvent => {
          const text = textEvent.target?.result as string;
          setFileTextContent(text);
          setIsProcessing(false);
        };
        textReader.readAsText(selectedFile);
      } else {
        // For PDF or DOCX, generate summary text
        setFileTextContent(
          `Official Syllabus Document: ${selectedFile.name}\nRegulation: ${regulation}\nCourse: ${currentSubject?.name} (${currentSubject?.code})\nFile format: ${selectedFile.type || 'PDF Document'}`
        );
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read file. Please try a different document.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !fileDataUrl) {
      setUploadError('Please select or drop a syllabus document file to upload.');
      return;
    }

    try {
      const syllabusDoc: UploadedSyllabusDocument = {
        id: `syl-${selectedSubjectId}-${Date.now()}`,
        fileName: file ? file.name : `${currentSubject.shortName}_Syllabus_${regulation}.pdf`,
        fileSize: file ? file.size : 150000,
        fileType: file ? file.type : 'application/pdf',
        fileDataUrl: fileDataUrl,
        textContent: fileTextContent || `${currentSubject.name} Official Syllabus`,
        uploadedAt: Date.now(),
        uploadedBy: uploadedBy.trim() || 'Department Admin',
        academicYear: academicYear.trim() || '2025-2026',
        regulation: regulation.trim() || 'R24 Scheme',
        unitCount: currentSubject.units.length,
        notes: notes.trim(),
        classDiscussionUnit: includeClassDiscussion && discussionText.trim() ? discussionUnit : undefined,
        classDiscussionText: includeClassDiscussion && discussionText.trim() ? discussionText.trim() : undefined,
      };

      AcademicService.uploadSubjectSyllabus(selectedSubjectId, syllabusDoc);

      // Also publish class discussion entry if provided
      if (includeClassDiscussion && discussionText.trim()) {
        const uName =
          currentSubject.units.find(u => u.unitNumber === discussionUnit)?.name ||
          `Unit ${discussionUnit} Classroom Topics`;
        AcademicService.addClassDiscussion({
          subjectId: currentSubject.id,
          subjectName: currentSubject.name,
          shortName: currentSubject.shortName,
          semester: currentSubject.semester,
          unitNumber: discussionUnit,
          unitName: uName,
          date: new Date().toISOString().split('T')[0],
          classSessionTitle: `Classroom Discussion: Unit ${discussionUnit} (${currentSubject.shortName})`,
          discussionText: discussionText.trim(),
          facultyName: uploadedBy.trim() || 'Faculty In-Charge',
          keyPoints: [
            `Class discussion on Unit ${discussionUnit}: ${uName}`,
            `Logged during syllabus upload for ${currentSubject.shortName}`
          ]
        });
      }

      onRefreshData();
      setSuccessMessage(
        `Syllabus & Class Discussion for ${currentSubject.name} (${currentSubject.shortName}) published successfully!`
      );

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred while uploading syllabus.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 transition-opacity">
      <div
        id="syllabus-upload-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin Only
                </span>
                <span className="text-xs text-slate-400">Department Faculty Portal</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Upload Subject Syllabus Document
              </h3>
            </div>
          </div>

          <button
            id="close-syllabus-upload-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="m-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Target Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Target Subject
            </label>
            <select
              id="upload-target-subject"
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
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

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Syllabus File (PDF, Word, Text, or JSON)
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : file
                  ? 'border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.json,.md"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)} • Click to choose a different file
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                      Click to browse syllabus file
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {' '}
                      or drag & drop here
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Supports PDF, DOCX, TXT, MD, JSON (Max 10MB)
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

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Regulation / Scheme
              </label>
              <input
                type="text"
                value={regulation}
                onChange={e => setRegulation(e.target.value)}
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
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                placeholder="e.g. 2025-2026"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Faculty In-Charge / Approver
            </label>
            <input
              type="text"
              value={uploadedBy}
              onChange={e => setUploadedBy(e.target.value)}
              placeholder="e.g. Prof. Dr. R. K. Sharma (Head of Department, AI & DS)"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Board of Studies Notes / Syllabus Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes on prerequisites, textbook changes, or lab mapping..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* CLASS DISCUSSION OPTION IN UPLOADING SECTION (WHICH UNIT IS DISCUSSED ON THE CLASS AS A TEXT FORM) */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/90 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="modal-include-class-discussion-checkbox"
                  checked={includeClassDiscussion}
                  onChange={e => setIncludeClassDiscussion(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Class Discussion Option: Which Unit is Discussed in Class</span>
                </span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                Text Form
              </span>
            </div>

            {includeClassDiscussion && (
              <div className="space-y-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Which Unit is Discussed in Class?
                    </label>
                    <select
                      id="modal-upload-discussion-unit"
                      value={discussionUnit}
                      onChange={e => setDiscussionUnit(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>
                          Unit {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Unit Focus / Title
                    </label>
                    <div className="text-xs py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 truncate font-medium">
                      {currentSubject?.units.find(u => u.unitNumber === discussionUnit)?.name ||
                        `Unit ${discussionUnit} Classroom Topics`}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Class Discussion (Text Form)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {discussionText.length} chars
                    </span>
                  </div>
                  <textarea
                    id="modal-upload-discussion-text-form"
                    rows={3}
                    value={discussionText}
                    onChange={e => setDiscussionText(e.target.value)}
                    placeholder={`Enter text form notes for Unit ${discussionUnit} discussed in class...\nExample: Covered Unit ${discussionUnit} fundamentals with classroom derivations, worked problems, and discussion of university exam patterns.`}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed font-sans"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Badge */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Once uploaded, this syllabus will be accessible for all students on the <strong>{currentSubject?.name}</strong> page and curriculum overview for download and study.
            </span>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              id="publish-syllabus-btn"
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>Publish Official Syllabus</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
