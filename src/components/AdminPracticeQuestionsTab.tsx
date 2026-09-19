import React, { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  HelpCircle,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Code,
  Sparkles,
  ListFilter,
  Check,
  Award
} from 'lucide-react';
import { Subject, PracticeQuestion, QuestionType, DifficultyLevel } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';

interface AdminPracticeQuestionsTabProps {
  subjects: Subject[];
  initialSubjectId?: string | null;
  onRefreshData: () => void;
  onShowSuccess: (msg: string) => void;
}

type TabMode = 'manual' | 'file_upload' | 'view_list';

export const AdminPracticeQuestionsTab: React.FC<AdminPracticeQuestionsTabProps> = ({
  subjects,
  initialSubjectId,
  onRefreshData,
  onShowSuccess,
}) => {
  const [mode, setMode] = useState<TabMode>('file_upload');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || 'pps'
  );

  // Manual Question Form State
  const [unitNumber, setUnitNumber] = useState<number>(1);
  const [unitNameInput, setUnitNameInput] = useState<string>('Unit 1: Foundations');
  const [topicId, setTopicId] = useState<string>('');
  const [questionText, setQuestionText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [qType, setQType] = useState<QuestionType>('mcq');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [marks, setMarks] = useState<number>(2);
  const [options, setOptions] = useState<string[]>([
    'Option A',
    'Option B',
    'Option C',
    'Option D',
  ]);
  const [correctOptionIdx, setCorrectOptionIdx] = useState<number>(0);
  const [nonMcqAnswer, setNonMcqAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [hints, setHints] = useState('');
  const [isPreviousExam, setIsPreviousExam] = useState(false);
  const [examYear, setExamYear] = useState('2024');

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<PracticeQuestion[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteQId, setConfirmDeleteQId] = useState<string | null>(null);

  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const activeUnit = activeSubject?.units.find(u => u.unitNumber === unitNumber) || activeSubject?.units[0];
  const existingQuestions = AcademicService.getQuestions().filter(q => q.subjectId === selectedSubjectId);

  // Download Sample JSON Template
  const handleDownloadTemplate = () => {
    const sampleTemplate = [
      {
        question: 'What is the worst-case time complexity of QuickSort on an already sorted array?',
        subjectId: activeSubject?.id || 'pps',
        subjectName: activeSubject?.name || 'Programming for Problem Solving',
        unitNumber: 1,
        unitName: activeSubject?.units[0]?.name || 'Unit 1',
        type: 'mcq',
        difficulty: 'medium',
        marks: 2,
        options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(N^2)'],
        correctAnswer: 'O(N^2)',
        explanation: 'When the pivot is picked naively (e.g. first or last element) on sorted input, partitions are unbalanced 0 and N-1, leading to quadratic O(N^2) runtime.',
        hints: 'Think about pivot selection on pre-sorted data.',
        isPreviousExamQuestion: true,
        year: '2024'
      },
      {
        question: 'Define pointers in C and explain the purpose of the dereference operator (*).',
        subjectId: activeSubject?.id || 'pps',
        subjectName: activeSubject?.name || 'Programming for Problem Solving',
        unitNumber: 1,
        unitName: activeSubject?.units[0]?.name || 'Unit 1',
        type: 'short_answer',
        difficulty: 'easy',
        marks: 2,
        correctAnswer: 'A pointer is a variable that stores the memory address of another variable. The dereference operator (*) accesses or modifies the value stored at that address.',
        explanation: 'Syntax: int *ptr = &val; printf("%d", *ptr);',
        isPreviousExamQuestion: true,
        year: '2023'
      }
    ];

    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `practice_questions_sample_template_${activeSubject?.shortName || 'subject'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  // Handle File Input and Parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setUploadError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const text = ev.target?.result as string;
        let data: any;

        if (selectedFile.name.endsWith('.json')) {
          data = JSON.parse(text);
        } else if (selectedFile.name.endsWith('.csv')) {
          // Parse simple CSV (header: question,type,difficulty,marks,correctAnswer,explanation)
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length <= 1) throw new Error('CSV file contains no data rows.');
          const rows = lines.slice(1);
          data = rows.map((row, idx) => {
            const parts = row.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
            return {
              id: `csv-q-${Date.now()}-${idx}`,
              question: parts[0] || `Practice Question ${idx + 1}`,
              type: (parts[1] as QuestionType) || 'short_answer',
              difficulty: (parts[2] as DifficultyLevel) || 'medium',
              marks: Number(parts[3]) || 2,
              correctAnswer: parts[4] || '',
              explanation: parts[5] || 'Refer to course lecture notes.',
            };
          });
        } else {
          throw new Error('Unsupported file format. Please upload a .json or .csv file.');
        }

        const rawList = Array.isArray(data) ? data : data.questions;
        if (!Array.isArray(rawList) || rawList.length === 0) {
          throw new Error('No valid questions found in file. Expected a JSON array of question objects.');
        }

        // Validate and normalize questions
        const normalized: PracticeQuestion[] = rawList.map((item: any, idx: number) => {
          const subId = item.subjectId || selectedSubjectId;
          const subObj = subjects.find(s => s.id === subId) || activeSubject;
          const uNum = Number(item.unitNumber) || 1;
          const uObj = subObj?.units.find(u => u.unitNumber === uNum) || subObj?.units[0];

          return {
            id: item.id || `uploaded-q-${subId}-${Date.now()}-${idx}`,
            question: item.question || 'Untitled Question',
            subjectId: subId,
            subjectName: subObj?.name || 'Department Subject',
            unitNumber: uNum,
            unitName: uObj?.name || `Unit ${uNum}`,
            topicId: item.topicId || (uObj?.topics[0]?.id || `${subId}-u${uNum}-t1`),
            topicName: item.topicName || (uObj?.topics[0]?.name || 'General Unit Topic'),
            type: item.type || 'mcq',
            difficulty: item.difficulty || 'medium',
            marks: Number(item.marks) || 2,
            options: Array.isArray(item.options) ? item.options : undefined,
            correctAnswer: item.correctAnswer || (item.options ? item.options[0] : ''),
            explanation: item.explanation || 'Detailed academic solution for university examination.',
            hints: item.hints || undefined,
            codeSnippet: item.codeSnippet || undefined,
            isPreviousExamQuestion: Boolean(item.isPreviousExamQuestion),
            year: item.year ? String(item.year) : undefined,
          };
        });

        setParsedQuestions(normalized);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to parse questions file.');
        setParsedQuestions([]);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read file from disk.');
    };

    reader.readAsText(selectedFile);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedQuestions.length === 0) {
      setUploadError('Please select a valid questions file to import.');
      return;
    }

    if (importMode === 'replace') {
      const allQuestions = AcademicService.getQuestions();
      const filtered = allQuestions.filter(q => q.subjectId !== selectedSubjectId);
      AcademicService.saveQuestions([...parsedQuestions, ...filtered]);
    } else {
      AcademicService.addMultipleQuestions(parsedQuestions);
    }

    onRefreshData();
    onShowSuccess(`Successfully imported ${parsedQuestions.length} practice questions for ${activeSubject?.name}!`);
    setFile(null);
    setParsedQuestions([]);
  };

  // Handle Manual Question Form Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert('Please enter the question text.');
      return;
    }

    let finalCorrectAnswer = nonMcqAnswer.trim();
    if (qType === 'mcq') {
      finalCorrectAnswer = options[correctOptionIdx]?.trim() || options[0]?.trim();
      if (!finalCorrectAnswer) {
        alert('Please specify valid options for this MCQ.');
        return;
      }
    }

    const selectedTopic = activeUnit?.topics.find(t => t.id === topicId) || activeUnit?.topics[0];

    const newQ: PracticeQuestion = {
      id: `q-${selectedSubjectId}-${Date.now()}`,
      question: questionText.trim(),
      subjectId: selectedSubjectId,
      subjectName: activeSubject?.name || 'Department Subject',
      unitNumber: unitNumber,
      unitName: unitNameInput.trim() || activeUnit?.name || `Unit ${unitNumber}`,
      topicId: selectedTopic?.id || `${selectedSubjectId}-u${unitNumber}-t1`,
      topicName: selectedTopic?.name || 'Unit Concept',
      type: qType,
      difficulty: difficulty,
      marks: Number(marks) || 2,
      options: qType === 'mcq' ? options.map(o => o.trim()).filter(Boolean) : undefined,
      correctAnswer: finalCorrectAnswer,
      explanation: explanation.trim() || 'Refer to curriculum study guide.',
      hints: hints.trim() || undefined,
      codeSnippet: codeSnippet.trim() || undefined,
      isPreviousExamQuestion: isPreviousExam,
      year: isPreviousExam ? examYear.trim() : undefined,
    };

    AcademicService.addPracticeQuestion(newQ);
    onRefreshData();
    onShowSuccess(`Practice question added successfully to Unit ${unitNumber}!`);

    // Reset fields
    setQuestionText('');
    setCodeSnippet('');
    setExplanation('');
    setHints('');
    setNonMcqAnswer('');
  };

  const handleDeleteQuestion = (qId: string) => {
    AcademicService.deleteQuestion(qId);
    onRefreshData();
    onShowSuccess('Question removed from the question bank.');
    setConfirmDeleteQId(null);
  };

  return (
    <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
      {/* Target Subject Selector & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Subject
          </label>
          <select
            id="admin-questions-subject-select"
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
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

        {/* Sub-mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('file_upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              mode === 'file_upload'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload JSON / CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              mode === 'manual'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Question</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('view_list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              mode === 'view_list'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Bank ({existingQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* SUBMODE 1: BULK FILE UPLOAD */}
      {mode === 'file_upload' && (
        <form onSubmit={handleImportSubmit} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Batch Import Practice Questions
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload a JSON or CSV file to import multiple practice questions with MCQs, answers, and explanations.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample JSON</span>
            </button>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                : file
                ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {file.name}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {parsedQuestions.length} Questions Ready to Import • Click to change file
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Choose Questions file (.json, .csv)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400"> or drag & drop here</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports JSON arrays of PracticeQuestion objects or comma-separated CSV values
                </p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Questions Preview */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Preview: {parsedQuestions.length} Questions</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                    />
                    <span>Append to bank</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                    />
                    <span>Replace subject bank</span>
                  </label>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {parsedQuestions.slice(0, 5).map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        Q{idx + 1} • Unit {q.unitNumber} • {q.marks} Marks
                      </span>
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
                      {q.question}
                    </p>
                  </div>
                ))}
                {parsedQuestions.length > 5 && (
                  <div className="text-center text-[11px] text-slate-400 py-1">
                    + {parsedQuestions.length - 5} more questions in this file
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import {parsedQuestions.length} Questions</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* SUBMODE 2: MANUAL QUESTION FORM */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Unit (Write Unit & Name)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={unitNumber}
                  onChange={e => {
                    const val = Math.max(1, Number(e.target.value) || 1);
                    setUnitNumber(val);
                    const u = activeSubject?.units.find(x => x.unitNumber === val);
                    if (u) setUnitNameInput(u.name);
                  }}
                  placeholder="Unit #"
                  className="col-span-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  required
                />
                <input
                  type="text"
                  value={unitNameInput}
                  onChange={e => setUnitNameInput(e.target.value)}
                  placeholder="Unit Name"
                  className="col-span-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Question Type
              </label>
              <select
                value={qType}
                onChange={e => setQType(e.target.value as QuestionType)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short_answer">Short Answer (Conceptual)</option>
                <option value="long_answer">Long Answer (Analytical)</option>
                <option value="programming">Programming / Coding</option>
                <option value="numerical">Numerical / Derivation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty & Marks
              </label>
              <div className="flex gap-2">
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={marks}
                  onChange={e => setMarks(Number(e.target.value))}
                  placeholder="Marks"
                  className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white"
                  title="Marks allocated"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Question Statement
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="e.g. State Cayley-Hamilton Theorem and find the inverse of matrix A = [[1, 2], [3, 4]]..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Optional Code Snippet or Formula
            </label>
            <textarea
              rows={2}
              value={codeSnippet}
              onChange={e => setCodeSnippet(e.target.value)}
              placeholder="# Optional Python or C snippet, e.g. for (int i=0; i<n; i++)"
              className="w-full font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* MCQ Options */}
          {qType === 'mcq' ? (
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Multiple Choice Options</span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                  Select the radio button for the correct option
                </span>
              </div>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOptionIdx === idx}
                      onChange={() => setCorrectOptionIdx(idx)}
                      className="text-indigo-600 focus:ring-indigo-500 shrink-0"
                    />
                    <span className="text-xs font-bold text-slate-500 w-5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const copy = [...options];
                        copy[idx] = e.target.value;
                        setOptions(copy);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correct Answer / Model Response
              </label>
              <textarea
                rows={2}
                value={nonMcqAnswer}
                onChange={e => setNonMcqAnswer(e.target.value)}
                placeholder="Key formula, direct value, or concise model answer..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Academic Explanation & Working
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="Step-by-step derivation, theorem proof, or logic..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isPreviousExam}
                onChange={e => setIsPreviousExam(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span>Previous University Exam Question</span>
            </label>

            {isPreviousExam && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Exam Session/Year:</span>
                <input
                  type="text"
                  value={examYear}
                  onChange={e => setExamYear(e.target.value)}
                  placeholder="e.g. Dec 2024"
                  className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Practice Question</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBMODE 3: VIEW EXISTING QUESTIONS */}
      {mode === 'view_list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              <strong>{existingQuestions.length}</strong> questions currently in {activeSubject?.shortName} bank
            </span>
          </div>

          {existingQuestions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                No practice questions currently published for {activeSubject?.name}.
              </p>
              <button
                type="button"
                onClick={() => setMode('file_upload')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Upload questions file now
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {existingQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          #{idx + 1} Unit {q.unitNumber}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[10px] uppercase">
                          {q.type.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">• {q.marks} Marks</span>
                        {q.isPreviousExamQuestion && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                            PYQ {q.year || ''}
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                        {q.question}
                      </h5>
                    </div>

                    {confirmDeleteQId === q.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-xs transition"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteQId(null)}
                          className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteQId(q.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Answer: </span>
                    <span>{q.correctAnswer}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
