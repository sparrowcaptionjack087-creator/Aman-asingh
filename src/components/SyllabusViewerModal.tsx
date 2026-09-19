import React from 'react';
import {
  X,
  Download,
  FileText,
  Calendar,
  UserCheck,
  ShieldCheck,
  Layers,
  Award,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Subject, UploadedSyllabusDocument } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';

interface SyllabusViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
}

export const SyllabusViewerModal: React.FC<SyllabusViewerModalProps> = ({
  isOpen,
  onClose,
  subject,
}) => {
  if (!isOpen || !subject.uploadedSyllabus) return null;

  const syllabus = subject.uploadedSyllabus;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = () => {
    AcademicService.downloadSyllabusFile(syllabus, subject.shortName);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 transition-opacity">
      <div
        id="syllabus-viewer-dialog"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {subject.code}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Official Document
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {syllabus.fileName}
              </h3>
            </div>
          </div>

          <button
            id="close-syllabus-viewer-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Regulation
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {syllabus.regulation}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Academic Year
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {syllabus.academicYear}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                File Size
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {formatFileSize(syllabus.fileSize)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Units Included
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {syllabus.unitCount || subject.units.length} Modular Units
              </span>
            </div>
          </div>

          {/* Author & Verification info */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
              <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>
                Uploaded By: <strong>{syllabus.uploadedBy}</strong>
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              {new Date(syllabus.uploadedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Notes or remarks */}
          {syllabus.notes && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Administrative Notes & Department Approval:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                {syllabus.notes}
              </p>
            </div>
          )}

          {/* Text Summary or Preview Pane */}
          {syllabus.textContent && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Syllabus Content Preview:
              </span>
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                {syllabus.textContent}
              </div>
            </div>
          )}

          {/* Informational note */}
          <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            * Official curriculum document uploaded by Department of AI & DS faculty. All students can freely download and study offline.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            Close
          </button>
          <button
            id="download-syllabus-modal-btn"
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Syllabus ({formatFileSize(syllabus.fileSize)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
