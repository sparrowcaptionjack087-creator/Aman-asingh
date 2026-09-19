import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Layers,
  HelpCircle,
  FileText,
  BookOpen,
  Info,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Users,
  Trash2,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react';
import { Subject, PracticeQuestion, QuestionPaper, StudentAccount } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';

interface AdminBackendExcelSheetTabProps {
  subjects: Subject[];
  onRefreshData: () => void;
  onNavigateTab?: (tab: string, subjectId?: string) => void;
}

type SheetView =
  | 'inventory_summary'
  | 'student_accounts'
  | 'syllabus_sem_wise'
  | 'practice_questions'
  | 'practice_papers'
  | 'units_topics';

export const AdminBackendExcelSheetTab: React.FC<AdminBackendExcelSheetTabProps> = ({
  subjects,
  onRefreshData,
  onNavigateTab
}) => {
  const [activeSheet, setActiveSheet] = useState<SheetView>('inventory_summary');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [activeCellContent, setActiveCellContent] = useState<string>('Backend Curriculum Database Master');
  const [students, setStudents] = useState<StudentAccount[]>(() => AcademicService.getStudents());
  const [showPasswords, setShowPasswords] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentAccount | null>(null);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const fetchFreshStudents = async () => {
    setIsSyncing(true);
    try {
      const fresh = await AcademicService.fetchStudentsFromServer();
      setStudents(fresh);
      setToastMessage(`Server synced: ${fresh.length} student account(s) loaded.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.warn('Sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Keep students in sync if updated or tab switched
  useEffect(() => {
    AcademicService.fetchStudentsFromServer().then(fresh => {
      if (fresh) setStudents(fresh);
    });
  }, [subjects, activeSheet]);

  // Load live questions and question papers from service
  const allQuestions: PracticeQuestion[] = useMemo(() => {
    return AcademicService.getQuestions();
  }, [subjects]);

  const allPapers: QuestionPaper[] = useMemo(() => {
    return AcademicService.getQuestionPapers();
  }, [subjects]);

  // Aggregate Metrics & Upload Counts
  const metrics = useMemo(() => {
    const totalSubjects = subjects.length;
    const uploadedSyllabiCount = subjects.filter(s => !!s.uploadedSyllabus).length;
    const totalQuestions = allQuestions.length;
    const totalPapers = allPapers.length;

    const totalUnits = subjects.reduce((acc, s) => acc + (s.units?.length || 0), 0);
    const totalTopics = subjects.reduce(
      (acc, s) => acc + (s.units?.reduce((uAcc, u) => uAcc + (u.topics?.length || 0), 0) || 0),
      0
    );

    // Semester breakdown
    const sem1Subjects = subjects.filter(s => s.semester === 1);
    const sem2Subjects = subjects.filter(s => s.semester === 2);

    const sem1Questions = allQuestions.filter(q => {
      const sub = subjects.find(s => s.id === q.subjectId);
      return sub?.semester === 1;
    }).length;

    const sem2Questions = allQuestions.filter(q => {
      const sub = subjects.find(s => s.id === q.subjectId);
      return sub?.semester === 2;
    }).length;

    const sem1Papers = allPapers.filter(p => {
      const sub = subjects.find(s => s.id === p.subjectId);
      return sub?.semester === 1;
    }).length;

    const sem2Papers = allPapers.filter(p => {
      const sub = subjects.find(s => s.id === p.subjectId);
      return sub?.semester === 2;
    }).length;

    const sem1Syllabi = sem1Subjects.filter(s => !!s.uploadedSyllabus).length;
    const sem2Syllabi = sem2Subjects.filter(s => !!s.uploadedSyllabus).length;

    return {
      totalSubjects,
      uploadedSyllabiCount,
      totalQuestions,
      totalPapers,
      totalUnits,
      totalTopics,
      sem1SubjectsCount: sem1Subjects.length,
      sem2SubjectsCount: sem2Subjects.length,
      sem1Questions,
      sem2Questions,
      sem1Papers,
      sem2Papers,
      sem1Syllabi,
      sem2Syllabi,
    };
  }, [subjects, allQuestions, allPapers]);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      if (selectedSemester !== 'all' && s.semester !== Number(selectedSemester)) return false;
      if (selectedSubjectId !== 'all' && s.id !== selectedSubjectId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCode = s.code.toLowerCase().includes(q);
        const matchShort = s.shortName.toLowerCase().includes(q);
        return matchName || matchCode || matchShort;
      }
      return true;
    });
  }, [subjects, selectedSemester, selectedSubjectId, searchQuery]);

  // Filtered Questions (Sem & Unit wise)
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const parentSubject = subjects.find(s => s.id === q.subjectId);
      if (selectedSemester !== 'all' && parentSubject && parentSubject.semester !== Number(selectedSemester)) {
        return false;
      }
      if (selectedSubjectId !== 'all' && q.subjectId !== selectedSubjectId) {
        return false;
      }
      if (searchQuery.trim()) {
        const qStr = searchQuery.toLowerCase();
        return (
          q.question.toLowerCase().includes(qStr) ||
          q.subjectName.toLowerCase().includes(qStr) ||
          q.unitName.toLowerCase().includes(qStr) ||
          q.type.toLowerCase().includes(qStr) ||
          q.difficulty.toLowerCase().includes(qStr)
        );
      }
      return true;
    });
  }, [allQuestions, subjects, selectedSemester, selectedSubjectId, searchQuery]);

  // Filtered Papers
  const filteredPapers = useMemo(() => {
    return allPapers.filter(p => {
      const parentSubject = subjects.find(s => s.id === p.subjectId);
      if (selectedSemester !== 'all' && parentSubject && parentSubject.semester !== Number(selectedSemester)) {
        return false;
      }
      if (selectedSubjectId !== 'all' && p.subjectId !== selectedSubjectId) {
        return false;
      }
      if (searchQuery.trim()) {
        const qStr = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(qStr) ||
          p.subjectName.toLowerCase().includes(qStr) ||
          p.paperType.toLowerCase().includes(qStr)
        );
      }
      return true;
    });
  }, [allPapers, subjects, selectedSemester, selectedSubjectId, searchQuery]);

  // Filtered Student Accounts (UG Number of AI & DS)
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedSemester !== 'all' && s.semester !== Number(selectedSemester)) {
        return false;
      }
      if (searchQuery.trim()) {
        const qStr = searchQuery.toLowerCase();
        return (
          s.ugNumber.toLowerCase().includes(qStr) ||
          s.fullName.toLowerCase().includes(qStr) ||
          s.email.toLowerCase().includes(qStr) ||
          (s.department && s.department.toLowerCase().includes(qStr))
        );
      }
      return true;
    });
  }, [students, selectedSemester, searchQuery]);

  // Handle Export Full Excel (.xlsx)
  const handleExportFullExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // --- Sheet 1: Inventory & Upload Summary ---
      const inventoryData = subjects.map((sub, index) => {
        const subQuestions = allQuestions.filter(q => q.subjectId === sub.id);
        const subPapers = allPapers.filter(p => p.subjectId === sub.id);
        const isSylUploaded = !!sub.uploadedSyllabus;

        return {
          'Row #': index + 1,
          'Semester': `Semester ${sub.semester}`,
          'Subject Code': sub.code,
          'Subject Short Name': sub.shortName,
          'Subject Full Title': sub.name,
          'Credits': sub.credits,
          'Category': sub.category.toUpperCase().replace('_', ' '),
          'Total Units': sub.units?.length || 0,
          'Syllabus Uploaded?': isSylUploaded ? 'YES' : 'NO',
          'Syllabus Status': isSylUploaded
            ? `Uploaded: ${sub.uploadedSyllabus?.fileName} (${sub.uploadedSyllabus?.regulation || 'R24'})`
            : 'Pending Upload',
          'Syllabus Upload Date': isSylUploaded && sub.uploadedSyllabus?.uploadedAt
            ? new Date(sub.uploadedSyllabus.uploadedAt).toISOString().split('T')[0]
            : 'N/A',
          'Uploaded By': sub.uploadedSyllabus?.uploadedBy || 'N/A',
          'Practice Questions Count': subQuestions.length,
          '2-Mark Questions': subQuestions.filter(q => q.marks === 2).length,
          '5-Mark Questions': subQuestions.filter(q => q.marks === 5).length,
          '10-Mark Questions': subQuestions.filter(q => q.marks === 10).length,
          '15-Mark Questions': subQuestions.filter(q => q.marks === 15).length,
          'Practice Papers Uploaded': subPapers.length,
        };
      });

      const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
      XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventory & Uploads');

      // --- Sheet 2: Syllabus (Semester-Wise) ---
      const syllabusData = subjects.map((sub, index) => {
        const unitNames = (sub.units || []).map(u => `U${u.unitNumber}: ${u.name}`).join(' | ');
        const totalTopics = (sub.units || []).reduce((acc, u) => acc + (u.topics?.length || 0), 0);

        return {
          'Index': index + 1,
          'Semester': `Semester ${sub.semester}`,
          'Subject Code': sub.code,
          'Subject Name': sub.name,
          'Short Name': sub.shortName,
          'Credits': sub.credits,
          'Regulation': sub.uploadedSyllabus?.regulation || 'R24 Regulation',
          'Total Units Count': sub.units?.length || 0,
          'Units Outline': unitNames || 'No units logged',
          'Total Topics Count': totalTopics,
          'Syllabus Upload Status': sub.uploadedSyllabus ? 'UPLOADED' : 'NOT UPLOADED',
          'File Name': sub.uploadedSyllabus?.fileName || 'N/A',
          'File Size (KB)': sub.uploadedSyllabus?.fileSize
            ? (sub.uploadedSyllabus.fileSize / 1024).toFixed(1)
            : 'N/A',
          'Academic Year': sub.uploadedSyllabus?.academicYear || '2025-2026',
          'Uploaded By': sub.uploadedSyllabus?.uploadedBy || 'N/A',
          'Notes': sub.uploadedSyllabus?.notes || sub.syllabusOverview || '',
        };
      });

      const wsSyllabus = XLSX.utils.json_to_sheet(syllabusData);
      XLSX.utils.book_append_sheet(wb, wsSyllabus, 'Syllabus Semester-Wise');

      // --- Sheet 3: Practice Questions (Unit & Sem-Wise) ---
      const questionsData = allQuestions.map((q, index) => {
        const parentSubject = subjects.find(s => s.id === q.subjectId);
        return {
          'Row ID': index + 1,
          'Question ID': q.id,
          'Semester': parentSubject ? `Semester ${parentSubject.semester}` : 'N/A',
          'Subject Code': parentSubject?.code || 'N/A',
          'Subject Name': q.subjectName || parentSubject?.name || 'N/A',
          'Unit Number': `Unit ${q.unitNumber}`,
          'Unit Name': q.unitName,
          'Topic Name': q.topicName || 'General Unit Topic',
          'Question Text': q.question,
          'Question Type': q.type.toUpperCase(),
          'Marks': q.marks,
          'Difficulty Level': q.difficulty.toUpperCase(),
          'Correct Answer / Outline': q.correctAnswer || 'Provided in portal',
          'Has Explanation?': q.explanation ? 'YES' : 'NO',
          'Previous Exam Question': q.isPreviousExamQuestion ? `YES (${q.year || 'Past Year'})` : 'NO',
        };
      });

      const wsQuestions = XLSX.utils.json_to_sheet(
        questionsData.length > 0
          ? questionsData
          : [{ 'Status': 'No practice questions currently uploaded in website' }]
      );
      XLSX.utils.book_append_sheet(wb, wsQuestions, 'Practice Questions');

      // --- Sheet 4: Practice Question Papers Uploaded ---
      const papersData = allPapers.map((p, index) => {
        const parentSubject = subjects.find(s => s.id === p.subjectId);
        const totalSections = p.sections?.length || 0;
        const totalPaperQuestions = (p.sections || []).reduce(
          (acc, sec) => acc + (sec.questions?.length || 0),
          0
        );

        return {
          'Paper ID': p.id,
          'Index': index + 1,
          'Semester': parentSubject ? `Semester ${parentSubject.semester}` : 'N/A',
          'Subject Code': parentSubject?.code || 'N/A',
          'Subject Name': p.subjectName || parentSubject?.name || 'N/A',
          'Paper Title': p.title,
          'Paper Type': p.paperType.toUpperCase().replace('_', ' '),
          'Total Marks': p.totalMarks,
          'Duration (Minutes)': p.durationMinutes,
          'Total Sections': totalSections,
          'Total Questions in Paper': totalPaperQuestions,
          'Unit Scope': p.unitNumber ? `Unit ${p.unitNumber} Only` : 'Full Subject Syllabus',
          'Upload Status in Website': 'UPLOADED & ACTIVE',
        };
      });

      const wsPapers = XLSX.utils.json_to_sheet(
        papersData.length > 0
          ? papersData
          : [{ 'Status': 'No practice question papers currently uploaded in website' }]
      );
      XLSX.utils.book_append_sheet(wb, wsPapers, 'Question Papers Uploaded');

      // --- Sheet 5: Student Accounts (UG Roster of AI & DS) ---
      const studentRosterData = students.map((stu, index) => ({
        'Row #': index + 1,
        'Student ID / UG Number': stu.ugNumber,
        'Full Student Name': stu.fullName,
        'Semester': `Semester ${stu.semester}`,
        'Department': stu.department || 'Artificial Intelligence & Data Science',
        'Academic Email': stu.email,
        'Account Password': stu.password,
        'Account Created At': new Date(stu.createdAt).toLocaleString(),
        'Last Login At': stu.lastLoginAt ? new Date(stu.lastLoginAt).toLocaleString() : 'Never',
        'Account Status': 'ACTIVE'
      }));

      const wsStudents = XLSX.utils.json_to_sheet(
        studentRosterData.length > 0
          ? studentRosterData
          : [{ 'Status': 'No registered student accounts' }]
      );
      XLSX.utils.book_append_sheet(wb, wsStudents, 'Student Accounts (UG Roster)');

      // Write file
      const fileName = `Curriculum_Backend_Database_SemWise_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Failed to export excel file', err);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  // Dedicated Student Roster Excel Export (.xlsx)
  const handleExportStudentsOnlyExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const currentList = AcademicService.getStudents();
      const studentRosterData = currentList.map((stu, index) => ({
        'Row #': index + 1,
        'Student ID / UG Number': stu.ugNumber,
        'Full Student Name': stu.fullName,
        'Semester': `Semester ${stu.semester}`,
        'Department': stu.department || 'Artificial Intelligence & Data Science',
        'Academic Email': stu.email,
        'Account Password': stu.password,
        'Account Created At': new Date(stu.createdAt).toLocaleString(),
        'Last Login At': stu.lastLoginAt ? new Date(stu.lastLoginAt).toLocaleString() : 'Never',
        'Account Status': 'ACTIVE'
      }));

      const wsStudents = XLSX.utils.json_to_sheet(
        studentRosterData.length > 0
          ? studentRosterData
          : [{ 'Status': 'No registered student accounts in database' }]
      );
      XLSX.utils.book_append_sheet(wb, wsStudents, 'AI & DS Students Roster');

      const fileName = `AI_DS_Student_Accounts_Roster_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setToastMessage(`Student accounts roster exported to ${fileName}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to export student roster Excel', err);
      alert('Failed to export student accounts. Please try again.');
    }
  };

  // Import Student Roster from Excel / CSV
  const handleImportStudentsExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[firstSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rows || rows.length === 0) {
        alert('The uploaded Excel spreadsheet is empty.');
        return;
      }

      const parsedStudents: StudentAccount[] = [];
      for (const row of rows) {
        const ug = (
          row['Student ID / UG Number'] ||
          row['Student ID'] ||
          row['UG Number'] ||
          row['UGNumber'] ||
          row['Roll No'] ||
          row['Roll Number'] ||
          row['ugNumber'] ||
          row['ID'] ||
          ''
        ).toString().trim().toUpperCase();

        const name = (
          row['Full Student Name'] ||
          row['Student Name'] ||
          row['Full Name'] ||
          row['Name'] ||
          row['fullName'] ||
          ''
        ).toString().trim();

        if (!ug) continue;

        const email = (
          row['Academic Email'] ||
          row['Email'] ||
          row['Email ID'] ||
          row['email'] ||
          `${ug.toLowerCase()}@college.edu`
        ).toString().trim();

        const semesterRaw = (
          row['Semester'] ||
          row['Sem'] ||
          row['semester'] ||
          '1'
        ).toString().replace(/[^0-9]/g, '');
        const semester = parseInt(semesterRaw, 10) || 1;

        const password = (
          row['Account Password'] ||
          row['Password'] ||
          row['password'] ||
          'Student@123'
        ).toString().trim();

        const department = (
          row['Department'] ||
          row['Dept'] ||
          row['department'] ||
          'Artificial Intelligence & Data Science'
        ).toString().trim();

        parsedStudents.push({
          ugNumber: ug,
          fullName: name || `Student (${ug})`,
          email,
          semester,
          password: password || 'Student@123',
          createdAt: Date.now(),
          department
        });
      }

      if (parsedStudents.length === 0) {
        alert('No valid student entries found in the file. Please make sure the sheet includes columns for "Student ID / UG Number" and "Full Name".');
        return;
      }

      const res = await AcademicService.bulkImportStudents(parsedStudents);
      const fresh = await AcademicService.fetchStudentsFromServer();
      setStudents(fresh);
      onRefreshData();

      setToastMessage(`Imported ${res.importedCount} new student account(s) into database! Total accounts: ${res.total}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to import student Excel', err);
      alert('Error parsing Excel spreadsheet: ' + (err?.message || 'Invalid format'));
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  // Copy current active sheet data to clipboard (TSV format)
  const handleCopyCurrentSheet = () => {
    let tsvContent = '';

    if (activeSheet === 'inventory_summary') {
      const headers = ['Row', 'Semester', 'Code', 'Subject', 'Credits', 'Units', 'Syllabus Uploaded', 'Questions Count', 'Papers Uploaded'];
      const rows = filteredSubjects.map((s, idx) => {
        const subQuestions = allQuestions.filter(q => q.subjectId === s.id);
        const subPapers = allPapers.filter(p => p.subjectId === s.id);
        return [
          idx + 1,
          `Semester ${s.semester}`,
          s.code,
          s.shortName,
          s.credits,
          s.units?.length || 0,
          s.uploadedSyllabus ? 'Uploaded' : 'Pending',
          subQuestions.length,
          subPapers.length
        ].join('\t');
      });
      tsvContent = [headers.join('\t'), ...rows].join('\n');
    } else if (activeSheet === 'student_accounts') {
      const headers = ['Row', 'Student ID (UG Number)', 'Full Name', 'Semester', 'Department', 'Email', 'Password', 'Created At', 'Last Login'];
      const rows = filteredStudents.map((s, idx) => [
        idx + 1,
        s.ugNumber,
        `"${s.fullName.replace(/"/g, '""')}"`,
        `Semester ${s.semester}`,
        s.department || 'AI & DS',
        s.email,
        s.password,
        new Date(s.createdAt).toLocaleString(),
        s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : 'Never'
      ].join('\t'));
      tsvContent = [headers.join('\t'), ...rows].join('\n');
    } else if (activeSheet === 'syllabus_sem_wise') {
      const headers = ['Row', 'Semester', 'Code', 'Subject Name', 'Credits', 'Units', 'Upload Status', 'File Name', 'Uploaded By'];
      const rows = filteredSubjects.map((s, idx) => [
        idx + 1,
        `Semester ${s.semester}`,
        s.code,
        s.name,
        s.credits,
        s.units?.length || 0,
        s.uploadedSyllabus ? 'Uploaded' : 'Pending',
        s.uploadedSyllabus?.fileName || 'N/A',
        s.uploadedSyllabus?.uploadedBy || 'N/A'
      ].join('\t'));
      tsvContent = [headers.join('\t'), ...rows].join('\n');
    } else if (activeSheet === 'practice_questions') {
      const headers = ['Row', 'Subject', 'Unit', 'Question Text', 'Marks', 'Difficulty', 'Type'];
      const rows = filteredQuestions.map((q, idx) => [
        idx + 1,
        q.subjectName,
        `Unit ${q.unitNumber}`,
        `"${q.question.replace(/"/g, '""')}"`,
        q.marks,
        q.difficulty,
        q.type
      ].join('\t'));
      tsvContent = [headers.join('\t'), ...rows].join('\n');
    } else if (activeSheet === 'practice_papers') {
      const headers = ['Row', 'Subject', 'Paper Title', 'Type', 'Total Marks', 'Duration', 'Sections'];
      const rows = filteredPapers.map((p, idx) => [
        idx + 1,
        p.subjectName,
        `"${p.title.replace(/"/g, '""')}"`,
        p.paperType,
        p.totalMarks,
        `${p.durationMinutes}m`,
        p.sections?.length || 0
      ].join('\t'));
      tsvContent = [headers.join('\t'), ...rows].join('\n');
    }

    navigator.clipboard.writeText(tsvContent);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Backend Excel Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute right-0 top-0 w-80 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Backend Master Spreadsheet
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Admin Portal Only (Hidden from Students)
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Curriculum & Upload Inventory Excel Database
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Consolidated backend data sheet tracking all semester-wise syllabi, unit and semester-wise practice questions, practice question papers, and live upload counts across your entire website.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-2.5">
            <button
              id="btn-copy-backend-sheet"
              type="button"
              onClick={handleCopyCurrentSheet}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition flex items-center gap-1.5"
              title="Copy active sheet data to clipboard (can be pasted in Google Sheets or Excel)"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Copy Sheet</span>
                </>
              )}
            </button>

            <button
              id="btn-download-master-excel"
              type="button"
              onClick={handleExportFullExcel}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/30 transition flex items-center gap-2"
              title="Download full multi-worksheet .xlsx Excel file"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Upload Inventory Cards - How many uploaded in website */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Syllabi Uploaded */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Syllabi Uploaded</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.uploadedSyllabiCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {metrics.totalSubjects} subjects
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${metrics.totalSubjects > 0 ? (metrics.uploadedSyllabiCount / metrics.totalSubjects) * 100 : 0}%`
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
            Sem 1: {metrics.sem1Syllabi} • Sem 2: {metrics.sem2Syllabi} uploaded
          </p>
        </div>

        {/* Practice Questions Uploaded */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Practice Questions</span>
            <HelpCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.totalQuestions}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              Live in Bank
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Sem 1: {metrics.sem1Questions} • Sem 2: {metrics.sem2Questions} questions
          </p>
        </div>

        {/* Question Papers Uploaded */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Papers Uploaded</span>
            <FileText className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.totalPapers}
            </span>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
              Exams Uploaded
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Sem 1: {metrics.sem1Papers} • Sem 2: {metrics.sem2Papers} full papers
          </p>
        </div>

        {/* Units & Topics Coverage */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Curriculum Units</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.totalUnits}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              across {metrics.totalSubjects} subjects
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {metrics.totalTopics} active curriculum topics mapped
          </p>
        </div>

        {/* Registered Student Accounts (UG Numbers) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Student Accounts</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {students.length}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
              UG Accounts
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {students.filter(s => s.semester === 1).length} in Sem 1 • {students.filter(s => s.semester === 2).length} in Sem 2
          </p>
        </div>
      </div>

      {/* Spreadsheet Workspace Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Excel Formula & Controls Ribbon Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          {/* Formula bar simulation */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
              {selectedCell}
            </span>
            <span className="text-slate-400 text-xs font-mono font-bold">fx</span>
            <div className="flex-1 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-200 truncate">
              {activeCellContent}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search cell data..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-36 sm:w-48"
              />
            </div>

            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>

            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500 max-w-[160px] truncate"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.shortName} (Sem {s.semester})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onRefreshData}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Refresh live spreadsheet data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Worksheets Tabs (Top Navigation styled as Excel tabs) */}
        <div className="flex items-center gap-1 px-3 pt-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveSheet('inventory_summary');
              setSelectedCell('A1');
              setActiveCellContent('Inventory & Upload Status Matrix');
            }}
            className={`px-3 py-2 rounded-t-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 border-t-2 ${
              activeSheet === 'inventory_summary'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>📊 Inventory & Upload Summary</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              {filteredSubjects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSheet('syllabus_sem_wise');
              setSelectedCell('A1');
              setActiveCellContent('Semester-Wise Syllabus Registry');
            }}
            className={`px-3 py-2 rounded-t-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 border-t-2 ${
              activeSheet === 'syllabus_sem_wise'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>📚 Syllabus (Sem-Wise)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              {filteredSubjects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSheet('practice_questions');
              setSelectedCell('A1');
              setActiveCellContent('Practice Questions Master Registry (Unit & Sem)');
            }}
            className={`px-3 py-2 rounded-t-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 border-t-2 ${
              activeSheet === 'practice_questions'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>❓ Practice Questions ({filteredQuestions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSheet('practice_papers');
              setSelectedCell('A1');
              setActiveCellContent('Uploaded Practice Question Papers Registry');
            }}
            className={`px-3 py-2 rounded-t-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 border-t-2 ${
              activeSheet === 'practice_papers'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>📝 Practice Papers ({filteredPapers.length})</span>
          </button>

          <button
            id="btn-worksheet-students"
            type="button"
            onClick={() => {
              setActiveSheet('student_accounts');
              setSelectedCell('A1');
              setActiveCellContent('Student Accounts Master Roster (UG Number of AI & DS)');
            }}
            className={`px-3 py-2 rounded-t-xl font-semibold whitespace-nowrap transition flex items-center gap-1.5 border-t-2 ${
              activeSheet === 'student_accounts'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-purple-500 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>👥 Student Accounts ({filteredStudents.length})</span>
          </button>
        </div>

        {/* Data Grid Table with Authentic Spreadsheet styling */}
        <div className="overflow-x-auto max-h-[500px] divide-y divide-slate-200 dark:divide-slate-800">
          {/* ================= VIEW 1: INVENTORY & UPLOAD SUMMARY ================= */}
          {activeSheet === 'inventory_summary' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-mono text-[11px] sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2.5 w-12 text-center bg-slate-200/70 dark:bg-slate-800 text-slate-500">#</th>
                  <th className="p-2.5">A : Semester</th>
                  <th className="p-2.5">B : Code</th>
                  <th className="p-2.5">C : Subject Name</th>
                  <th className="p-2.5 text-center">D : Credits</th>
                  <th className="p-2.5 text-center">E : Units</th>
                  <th className="p-2.5">F : Syllabus Uploaded?</th>
                  <th className="p-2.5">G : Upload Document Details</th>
                  <th className="p-2.5 text-center">H : Questions Count</th>
                  <th className="p-2.5 text-center">I : Papers Uploaded</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredSubjects.map((sub, idx) => {
                  const subQuestions = allQuestions.filter(q => q.subjectId === sub.id);
                  const subPapers = allPapers.filter(p => p.subjectId === sub.id);
                  const isUploaded = !!sub.uploadedSyllabus;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => {
                        setSelectedCell(`A${idx + 1}`);
                        setActiveCellContent(`${sub.name} (${sub.code}) - Units: ${sub.units?.length || 0}, Questions: ${subQuestions.length}, Papers: ${subPapers.length}`);
                      }}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition cursor-pointer"
                    >
                      <td className="p-2.5 text-center font-mono text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        Semester {sub.semester}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400 font-bold whitespace-nowrap">
                        {sub.code}
                      </td>
                      <td className="p-2.5 font-medium text-slate-900 dark:text-white">
                        <div className="font-semibold">{sub.name}</div>
                        <span className="text-[10px] text-slate-400">{sub.shortName}</span>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {sub.credits}
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {sub.units?.length || 0}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        {isUploaded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {isUploaded ? (
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {sub.uploadedSyllabus?.fileName}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {sub.uploadedSyllabus?.regulation || 'R24'} • By {sub.uploadedSyllabus?.uploadedBy || 'Admin'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No syllabus file uploaded yet</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                          subQuestions.length > 0
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {subQuestions.length}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                          subPapers.length > 0
                            ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {subPapers.length}
                        </span>
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap">
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateTab('upload_syllabus', sub.id);
                            }}
                            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-300 text-[10px] font-semibold transition"
                          >
                            Manage
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ================= VIEW 2: SYLLABUS SEMESTER-WISE ================= */}
          {activeSheet === 'syllabus_sem_wise' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-mono text-[11px] sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2.5 w-12 text-center bg-slate-200/70 dark:bg-slate-800 text-slate-500">#</th>
                  <th className="p-2.5">A : Semester</th>
                  <th className="p-2.5">B : Subject Code</th>
                  <th className="p-2.5">C : Subject Name</th>
                  <th className="p-2.5">D : Regulation</th>
                  <th className="p-2.5 text-center">E : Units Count</th>
                  <th className="p-2.5">F : Units List Breakdown</th>
                  <th className="p-2.5">G : Upload Status</th>
                  <th className="p-2.5">H : File Name</th>
                  <th className="p-2.5">I : Uploaded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredSubjects.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    onClick={() => {
                      setSelectedCell(`B${idx + 1}`);
                      setActiveCellContent(`Syllabus for ${sub.name} - Regulation: ${sub.uploadedSyllabus?.regulation || 'R24'}`);
                    }}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition cursor-pointer"
                  >
                    <td className="p-2.5 text-center font-mono text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      Semester {sub.semester}
                    </td>
                    <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                      {sub.code}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-900 dark:text-white">
                      {sub.name}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {sub.uploadedSyllabus?.regulation || 'R24 Scheme'}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">
                      {sub.units?.length || 0}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400 max-w-sm truncate text-[11px]">
                      {(sub.units || []).map(u => `U${u.unitNumber}: ${u.name}`).join(' • ') || 'No units specified'}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      {sub.uploadedSyllabus ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-amber-500 font-medium">
                          Not Uploaded
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate max-w-[150px]">
                      {sub.uploadedSyllabus?.fileName || '—'}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {sub.uploadedSyllabus?.uploadedBy || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ================= VIEW 3: PRACTICE QUESTIONS ================= */}
          {activeSheet === 'practice_questions' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-mono text-[11px] sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2.5 w-12 text-center bg-slate-200/70 dark:bg-slate-800 text-slate-500">#</th>
                  <th className="p-2.5">A : Sem</th>
                  <th className="p-2.5">B : Subject</th>
                  <th className="p-2.5">C : Unit #</th>
                  <th className="p-2.5">D : Question Text</th>
                  <th className="p-2.5 text-center">E : Marks</th>
                  <th className="p-2.5">F : Difficulty</th>
                  <th className="p-2.5">G : Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No practice questions uploaded matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q, idx) => {
                    const sub = subjects.find(s => s.id === q.subjectId);
                    return (
                      <tr
                        key={q.id || idx}
                        onClick={() => {
                          setSelectedCell(`D${idx + 1}`);
                          setActiveCellContent(q.question);
                        }}
                        className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                      >
                        <td className="p-2.5 text-center font-mono text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          Sem {sub?.semester || '—'}
                        </td>
                        <td className="p-2.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {sub?.shortName || q.subjectName}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold">
                            Unit {q.unitNumber}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 max-w-md">
                          <div className="line-clamp-2 font-normal leading-relaxed">{q.question}</div>
                          {q.correctAnswer && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate mt-0.5">
                              Ans: {q.correctAnswer}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {q.marks}M
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            q.difficulty === 'easy'
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              : q.difficulty === 'hard'
                              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px] uppercase whitespace-nowrap">
                          {q.type.replace('_', ' ')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* ================= VIEW 4: QUESTION PAPERS ================= */}
          {activeSheet === 'practice_papers' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-mono text-[11px] sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2.5 w-12 text-center bg-slate-200/70 dark:bg-slate-800 text-slate-500">#</th>
                  <th className="p-2.5">A : Sem</th>
                  <th className="p-2.5">B : Subject</th>
                  <th className="p-2.5">C : Paper Title</th>
                  <th className="p-2.5">D : Exam Type</th>
                  <th className="p-2.5 text-center">E : Total Marks</th>
                  <th className="p-2.5 text-center">F : Duration</th>
                  <th className="p-2.5 text-center">G : Sections</th>
                  <th className="p-2.5">H : Upload Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredPapers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No practice question papers currently uploaded in the website.
                    </td>
                  </tr>
                ) : (
                  filteredPapers.map((paper, idx) => {
                    const sub = subjects.find(s => s.id === paper.subjectId);
                    return (
                      <tr
                        key={paper.id || idx}
                        onClick={() => {
                          setSelectedCell(`C${idx + 1}`);
                          setActiveCellContent(`${paper.title} - Total Marks: ${paper.totalMarks}, Duration: ${paper.durationMinutes}m`);
                        }}
                        className="hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 transition cursor-pointer"
                      >
                        <td className="p-2.5 text-center font-mono text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          Sem {sub?.semester || '—'}
                        </td>
                        <td className="p-2.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {sub?.shortName || paper.subjectName}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {paper.title}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold uppercase">
                            {paper.paperType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {paper.totalMarks}
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-600 dark:text-slate-400">
                          {paper.durationMinutes} mins
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {paper.sections?.length || 0}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Uploaded in Website</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* ================= VIEW 5: STUDENT ACCOUNTS (UG NUMBER OF AI & DS) ================= */}
          {activeSheet === 'student_accounts' && (
            <div className="space-y-0">
              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 border-b border-purple-200/60 dark:border-purple-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-purple-900 dark:text-purple-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="font-bold">
                      Registered AI & DS Student Accounts Database ({students.length})
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-[10px] border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Server Persistent Storage Active (Survives Rebuilds)</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchFreshStudents}
                    disabled={isSyncing}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 font-semibold text-[11px] flex items-center gap-1.5 hover:bg-purple-100/50 transition cursor-pointer disabled:opacity-60"
                    title="Reload latest students directly from backend database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Server'}</span>
                  </button>

                  <label
                    className={`px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 font-semibold text-[11px] flex items-center gap-1.5 hover:bg-purple-100/50 transition cursor-pointer ${isImporting ? 'opacity-60 pointer-events-none' : ''}`}
                    title="Upload existing student roster Excel (.xlsx, .xls) or CSV"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{isImporting ? 'Importing...' : 'Import Excel'}</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleImportStudentsExcel}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleExportStudentsOnlyExcel}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    title="Export all student accounts as dedicated .xlsx Excel spreadsheet"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 font-semibold text-[11px] flex items-center gap-1.5 hover:bg-purple-100/50 transition cursor-pointer"
                  >
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPasswords ? 'Mask' : 'Show Passwords'}</span>
                  </button>

                  {students.length > 0 && (
                    <button
                      id="btn-clear-all-students"
                      type="button"
                      onClick={() => setIsConfirmClearAllOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-semibold text-[11px] flex items-center gap-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-mono text-[11px] sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5 w-12 text-center bg-slate-200/70 dark:bg-slate-800 text-slate-500">#</th>
                    <th className="p-2.5">A : Student ID / UG Number</th>
                    <th className="p-2.5">B : Full Student Name</th>
                    <th className="p-2.5 text-center">C : Semester</th>
                    <th className="p-2.5">D : Department</th>
                    <th className="p-2.5">E : Academic Email</th>
                    <th className="p-2.5">F : Account Password</th>
                    <th className="p-2.5">G : Account Created</th>
                    <th className="p-2.5">H : Last Login</th>
                    <th className="p-2.5 text-center">I : Status</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-400">
                        No registered student accounts matching your filter. Any account created on the website login page will automatically appear here.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu, idx) => (
                      <tr
                        key={stu.ugNumber}
                        onClick={() => {
                          setSelectedCell(`A${idx + 1}`);
                          setActiveCellContent(`${stu.fullName} (${stu.ugNumber}) - Sem ${stu.semester}, Email: ${stu.email}`);
                        }}
                        className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition cursor-pointer"
                      >
                        <td className="p-2.5 text-center font-mono text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-purple-700 dark:text-purple-400 whitespace-nowrap">
                          {stu.ugNumber}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {stu.fullName}
                        </td>
                        <td className="p-2.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          Semester {stu.semester}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap text-[11px]">
                          {stu.department || 'AI & DS'}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">
                          {stu.email}
                        </td>
                        <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">
                          {showPasswords ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                              {stu.password}
                            </span>
                          ) : (
                            <span className="tracking-widest text-slate-400">••••••••</span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(stu.createdAt).toLocaleDateString()} {new Date(stu.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                          {stu.lastLoginAt ? new Date(stu.lastLoginAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                            ACTIVE
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            id={`btn-delete-student-${stu.ugNumber}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStudentToDelete(stu);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 transition cursor-pointer"
                            title={`Delete student account (${stu.ugNumber})`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Excel Status Bar at Bottom */}
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>READY</span>
            </span>
            <span className="hidden sm:inline">
              Active Sheet: {activeSheet.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Total Rows: {
                activeSheet === 'inventory_summary' || activeSheet === 'syllabus_sem_wise'
                  ? filteredSubjects.length
                  : activeSheet === 'practice_questions'
                  ? filteredQuestions.length
                  : activeSheet === 'practice_papers'
                  ? filteredPapers.length
                  : filteredStudents.length
              }
            </span>
            <span className="text-slate-400">|</span>
            <span>
              Live Uploads: {metrics.uploadedSyllabiCount} Syllabi • {metrics.totalQuestions} Questions • {metrics.totalPapers} Papers • {students.length} Student Accounts
            </span>
          </div>
        </div>
      </div>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700 dark:border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* In-App Modal: Confirm Delete Single Student Account */}
      {studentToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setStudentToDelete(null);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Delete Student Account?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This account will be permanently removed from the master Excel roster.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Student ID / UG:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  {studentToDelete.ugNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Student Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {studentToDelete.fullName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Semester:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Semester {studentToDelete.semester}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Academic Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {studentToDelete.email}
                </span>
              </div>
            </div>

            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              Note: Once deleted, this student will not be able to log in to the portal unless they create a new account.
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-student"
                type="button"
                onClick={() => {
                  const ug = studentToDelete.ugNumber;
                  AcademicService.deleteStudent(ug);
                  const updated = AcademicService.getStudents();
                  setStudents(updated);
                  onRefreshData();
                  setToastMessage(`Student account (${ug}) deleted successfully.`);
                  setStudentToDelete(null);
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Modal: Confirm Clear All Accounts */}
      {isConfirmClearAllOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirmClearAllOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Clear All Student Accounts?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This will remove all {students.length} registered student accounts from the database.
                </p>
              </div>
            </div>

            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              Warning: All student credentials and registration records will be wiped out from the system. Any active student sessions will be invalidated.
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-clear-all-students"
                type="button"
                onClick={() => {
                  AcademicService.clearAllStudents();
                  setStudents([]);
                  onRefreshData();
                  setToastMessage('All student accounts have been cleared.');
                  setIsConfirmClearAllOpen(false);
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Accounts</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
