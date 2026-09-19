import React, { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  ListFilter,
  Check,
  Award,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Subject, QuestionPaper, QuestionPaperSection, QuestionType } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';

interface AdminPracticePapersTabProps {
  subjects: Subject[];
  initialSubjectId?: string | null;
  onRefreshData: () => void;
  onShowSuccess: (msg: string) => void;
}

type TabMode = 'file_upload' | 'manual' | 'view_list';

export const AdminPracticePapersTab: React.FC<AdminPracticePapersTabProps> = ({
  subjects,
  initialSubjectId,
  onRefreshData,
  onShowSuccess,
}) => {
  const [mode, setMode] = useState<TabMode>('file_upload');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || 'pps'
  );

  // Manual Paper Form State
  const [paperTitle, setPaperTitle] = useState('');
  const [paperType, setPaperType] = useState<'unit_test' | 'mid_sem' | 'end_sem' | 'practice'>('unit_test');
  const [unitNumber, setUnitNumber] = useState<number | 'all'>('all');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [totalMarks, setTotalMarks] = useState<number>(50);
  const [instructionsText, setInstructionsText] = useState(
    'All Part A questions are compulsory.\nAnswer any three questions from Part B.\nScientific calculators are permitted.'
  );

  // Sections State
  const [sections, setSections] = useState<QuestionPaperSection[]>([
    {
      title: 'Part A – Objective & Conceptual Questions (10 Marks)',
      instructions: 'Answer all 5 questions (2 marks each).',
      questions: [
        {
          questionNumber: 1,
          question: 'Define the fundamental difference between compiler and interpreter.',
          marks: 2,
          type: 'short_answer',
          answer: 'A compiler translates the entire source program into machine code before execution, whereas an interpreter translates and executes line-by-line.',
          detailedSolution: 'Compilers produce faster standalone executables; interpreters offer interactive debugging.',
        },
        {
          questionNumber: 2,
          question: 'What is the format specifier for a double variable in printf and scanf?',
          marks: 2,
          type: 'mcq',
          options: ['%f for both', '%lf for scanf, %f or %lf for printf', '%d and %ld', '%c and %s'],
          answer: '%lf for scanf, %f or %lf for printf',
          detailedSolution: 'In C99+, printf accepts %f or %lf for double, but scanf requires %lf.',
        },
      ],
    },
    {
      title: 'Part B – Analytical & Long Answer Questions (40 Marks)',
      instructions: 'Answer any 4 questions out of 6 (10 marks each).',
      questions: [
        {
          questionNumber: 3,
          question: 'Explain the working of binary search with an algorithm and step-by-step trace on an array of size 7.',
          marks: 10,
          type: 'long_answer',
          answer: 'Binary search maintains low and high pointers, computes mid = low + (high - low)/2, compares target with arr[mid], and halves the search space.',
          detailedSolution: 'Time complexity: Best O(1), Worst O(log N). Space complexity: O(1) iterative.',
        },
      ],
    },
  ]);

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [parsedPaper, setParsedPaper] = useState<QuestionPaper | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDeletePaperId, setConfirmDeletePaperId] = useState<string | null>(null);

  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const existingPapers = AcademicService.getQuestionPapers().filter(p => p.subjectId === selectedSubjectId);

  // Download Sample Paper JSON
  const handleDownloadSamplePaper = () => {
    const samplePaper: QuestionPaper = {
      id: `sample-paper-${activeSubject?.id || 'pps'}`,
      title: `Sample Mid-Semester Examination: ${activeSubject?.name || 'Curriculum Subject'}`,
      subjectId: activeSubject?.id || 'pps',
      subjectName: activeSubject?.name || 'Curriculum Subject',
      paperType: 'mid_sem',
      durationMinutes: 90,
      totalMarks: 50,
      instructions: [
        'Read all instructions carefully before writing.',
        'Part A questions are mandatory (2 marks each).',
        'Part B questions carry 10 marks each.',
      ],
      sections: [
        {
          title: 'Part A – Objective & Conceptual (10 Marks)',
          instructions: 'Answer all 5 questions.',
          questions: [
            {
              questionNumber: 1,
              question: 'Explain the difference between call by value and call by reference.',
              marks: 2,
              type: 'short_answer',
              answer: 'Call by value passes copies of variables, whereas call by reference passes actual memory addresses through pointers.',
              detailedSolution: 'Modifications made in call by value do not reflect in the calling function, whereas call by reference alters original values.'
            },
            {
              questionNumber: 2,
              question: 'Which asymptotic notation provides a strict upper bound?',
              marks: 2,
              type: 'mcq',
              options: ['Big-O', 'Omega (Ω)', 'Theta (Θ)', 'Little-o'],
              answer: 'Big-O',
              detailedSolution: 'Big-O notation describes an asymptotic upper bound f(n) <= c * g(n) for n >= n0.'
            }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(samplePaper, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `practice_paper_template_${activeSubject?.shortName || 'subject'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  // Process File Upload
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
        const data = JSON.parse(text);

        // Check if paper object or array of papers
        const paperObj = Array.isArray(data) ? data[0] : data;
        if (!paperObj || !paperObj.title) {
          throw new Error('Invalid paper file format. Must include a paper title and sections.');
        }

        const subId = paperObj.subjectId || selectedSubjectId;
        const subObj = subjects.find(s => s.id === subId) || activeSubject;

        const validatedPaper: QuestionPaper = {
          id: paperObj.id || `paper-${subId}-${Date.now()}`,
          title: paperObj.title,
          subjectId: subId,
          subjectName: subObj?.name || 'Department Subject',
          unitNumber: paperObj.unitNumber ? Number(paperObj.unitNumber) : undefined,
          paperType: paperObj.paperType || 'practice',
          durationMinutes: Number(paperObj.durationMinutes) || 60,
          totalMarks: Number(paperObj.totalMarks) || 50,
          instructions: Array.isArray(paperObj.instructions)
            ? paperObj.instructions
            : ['Answer all questions systematically.', 'Verify all answers before submission.'],
          sections: Array.isArray(paperObj.sections) ? paperObj.sections : [],
        };

        setParsedPaper(validatedPaper);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to parse question paper JSON.');
        setParsedPaper(null);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read file from disk.');
    };

    reader.readAsText(selectedFile);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedPaper) {
      setUploadError('Please select a valid question paper JSON file to import.');
      return;
    }

    AcademicService.addQuestionPaper(parsedPaper);
    onRefreshData();
    onShowSuccess(`Practice paper "${parsedPaper.title}" published successfully for ${activeSubject?.name}!`);
    setFile(null);
    setParsedPaper(null);
  };

  // Add a new empty question to a section in manual builder
  const handleAddQuestionToSection = (secIdx: number) => {
    const copy = [...sections];
    const targetSec = copy[secIdx];
    const nextQNum = targetSec.questions.length + 1;
    targetSec.questions.push({
      questionNumber: nextQNum,
      question: '',
      marks: 5,
      type: 'short_answer',
      answer: '',
      detailedSolution: '',
    });
    setSections(copy);
  };

  const handleRemoveQuestionFromSection = (secIdx: number, qIdx: number) => {
    const copy = [...sections];
    copy[secIdx].questions.splice(qIdx, 1);
    setSections(copy);
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        title: `Part ${String.fromCharCode(65 + sections.length)} – Additional Section`,
        instructions: 'Answer the questions according to unit guidelines.',
        questions: [
          {
            questionNumber: 1,
            question: '',
            marks: 5,
            type: 'short_answer',
            answer: '',
            detailedSolution: '',
          },
        ],
      },
    ]);
  };

  const handleRemoveSection = (secIdx: number) => {
    if (sections.length <= 1) {
      alert('A paper must have at least one section.');
      return;
    }
    const copy = [...sections];
    copy.splice(secIdx, 1);
    setSections(copy);
  };

  // Handle Manual Paper Creation Form Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle.trim()) {
      alert('Please enter the paper title.');
      return;
    }

    // Verify all questions have statements
    for (const sec of sections) {
      for (const q of sec.questions) {
        if (!q.question.trim()) {
          alert('Please make sure all questions have a question statement.');
          return;
        }
      }
    }

    const instructionsList = instructionsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newPaper: QuestionPaper = {
      id: `paper-${selectedSubjectId}-${Date.now()}`,
      title: paperTitle.trim(),
      subjectId: selectedSubjectId,
      subjectName: activeSubject?.name || 'Department Subject',
      unitNumber: unitNumber === 'all' ? undefined : Number(unitNumber),
      paperType: paperType,
      durationMinutes: Number(durationMinutes) || 60,
      totalMarks: Number(totalMarks) || 50,
      instructions: instructionsList.length > 0 ? instructionsList : ['Answer questions as per instructions.'],
      sections: sections,
    };

    AcademicService.addQuestionPaper(newPaper);
    onRefreshData();
    onShowSuccess(`Practice paper "${newPaper.title}" published successfully!`);
    setPaperTitle('');
  };

  const handleDeletePaper = (paperId: string) => {
    AcademicService.deleteQuestionPaper(paperId);
    onRefreshData();
    onShowSuccess('Question paper deleted from the archive.');
    setConfirmDeletePaperId(null);
  };

  const handleDownloadExistingPaperJSON = (p: QuestionPaper) => {
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${p.id}_${activeSubject?.shortName || 'paper'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
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
            id="admin-papers-subject-select"
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
            <span>Upload Paper JSON</span>
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
            <span>Create Exam Paper</span>
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
            <span>Papers ({existingPapers.length})</span>
          </button>
        </div>
      </div>

      {/* SUBMODE 1: UPLOAD PAPER FILE */}
      {mode === 'file_upload' && (
        <form onSubmit={handleImportSubmit} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                Upload Official Examination Paper
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload a structured JSON file containing sections, marks distribution, and model solutions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSamplePaper}
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
              accept=".json"
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
                  {parsedPaper ? `Paper Validated: "${parsedPaper.title}"` : 'File loaded • Click to change'}
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Choose Question Paper (.json)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400"> or drag & drop here</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports JSON formatted according to standard QuestionPaper schema
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

          {/* Paper Preview */}
          {parsedPaper && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/80 pb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {parsedPaper.paperType.replace('_', ' ')} • {parsedPaper.durationMinutes} Mins • {parsedPaper.totalMarks} Marks
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {parsedPaper.title}
                  </h4>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {parsedPaper.sections.length} Sections ({parsedPaper.sections.reduce((acc, s) => acc + s.questions.length, 0)} Questions)
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {parsedPaper.sections.map((sec, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white">{sec.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{sec.instructions} ({sec.questions.length} Questions)</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish Examination Paper</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* SUBMODE 2: MANUAL EXAM PAPER BUILDER */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paper Title
              </label>
              <input
                type="text"
                value={paperTitle}
                onChange={e => setPaperTitle(e.target.value)}
                placeholder="e.g. Unit 2 Mid-Semester Test: Data Structures & Algorithms"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exam Paper Category
              </label>
              <select
                value={paperType}
                onChange={e => setPaperType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="unit_test">Unit Class Test</option>
                <option value="mid_sem">Mid-Semester Exam</option>
                <option value="end_sem">Semester End Examination</option>
                <option value="practice">Full Syllabus Practice Mock</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min={15}
                  max={300}
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={totalMarks}
                  onChange={e => setTotalMarks(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              General Examination Instructions (one per line)
            </label>
            <textarea
              rows={2}
              value={instructionsText}
              onChange={e => setInstructionsText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Examination Sections & Questions ({sections.length})
              </h4>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            {sections.map((sec, sIdx) => (
              <div
                key={sIdx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                    <input
                      type="text"
                      value={sec.title}
                      onChange={e => {
                        const copy = [...sections];
                        copy[sIdx].title = e.target.value;
                        setSections(copy);
                      }}
                      placeholder="Section Title, e.g. Part A"
                      className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                      required
                    />
                    <input
                      type="text"
                      value={sec.instructions}
                      onChange={e => {
                        const copy = [...sections];
                        copy[sIdx].instructions = e.target.value;
                        setSections(copy);
                      }}
                      placeholder="Section Instructions, e.g. Answer all questions"
                      className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300"
                    />
                  </div>

                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sIdx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                      title="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Questions in this section */}
                <div className="space-y-2.5 pt-1">
                  {sec.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          Q{q.questionNumber || qIdx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={q.type}
                            onChange={e => {
                              const copy = [...sections];
                              copy[sIdx].questions[qIdx].type = e.target.value as QuestionType;
                              setSections(copy);
                            }}
                            className="bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded px-2 py-0.5 text-[11px]"
                          >
                            <option value="short_answer">Short Answer</option>
                            <option value="mcq">MCQ</option>
                            <option value="long_answer">Long Answer</option>
                            <option value="numerical">Numerical</option>
                          </select>
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-400">Marks:</span>
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={q.marks}
                              onChange={e => {
                                const copy = [...sections];
                                copy[sIdx].questions[qIdx].marks = Number(e.target.value);
                                setSections(copy);
                              }}
                              className="w-12 bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded px-1 py-0.5 text-xs text-center"
                            />
                          </div>
                          {sec.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionFromSection(sIdx, qIdx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={e => {
                          const copy = [...sections];
                          copy[sIdx].questions[qIdx].question = e.target.value;
                          setSections(copy);
                        }}
                        placeholder="Question text..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-xs"
                        required
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={q.answer}
                          onChange={e => {
                            const copy = [...sections];
                            copy[sIdx].questions[qIdx].answer = e.target.value;
                            setSections(copy);
                          }}
                          placeholder="Correct Answer..."
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1 text-xs"
                          required
                        />
                        <input
                          type="text"
                          value={q.detailedSolution}
                          onChange={e => {
                            const copy = [...sections];
                            copy[sIdx].questions[qIdx].detailedSolution = e.target.value;
                            setSections(copy);
                          }}
                          placeholder="Model solution / marking scheme notes..."
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1 text-xs"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddQuestionToSection(sIdx)}
                    className="w-full py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 font-medium transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Question to {sec.title}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Publish Examination Paper</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBMODE 3: VIEW EXISTING PAPERS */}
      {mode === 'view_list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              <strong>{existingPapers.length}</strong> examination papers published for {activeSubject?.shortName}
            </span>
          </div>

          {existingPapers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                No examination papers currently published for {activeSubject?.name}.
              </p>
              <button
                type="button"
                onClick={() => setMode('file_upload')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Upload paper JSON now
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {existingPapers.map(p => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        <span>{p.paperType.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{p.durationMinutes} Mins</span>
                        <span>•</span>
                        <span>{p.totalMarks} Marks</span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {p.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleDownloadExistingPaperJSON(p)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1"
                        title="Download Paper JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-[11px]">JSON</span>
                      </button>
                      {confirmDeletePaperId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeletePaper(p.id)}
                            className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-xs transition"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePaperId(null)}
                            className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePaperId(p.id)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                          title="Delete examination paper"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                      <strong>Sections:</strong> {p.sections.length} ({p.sections.map(s => s.title).join(', ')})
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                      <strong>Total Questions:</strong>{' '}
                      {p.sections.reduce((acc, s) => acc + s.questions.length, 0)}
                    </div>
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
