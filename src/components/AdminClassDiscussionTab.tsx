import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  BookOpen,
  User,
  FileText,
  CheckCircle2,
  Sparkles,
  Search,
  Clock,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Subject, ClassDiscussion } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';

interface AdminClassDiscussionTabProps {
  subjects: Subject[];
  onRefreshData: () => void;
  setSuccessMessage: (msg: string | null) => void;
  initialSubjectId?: string | null;
}

export const AdminClassDiscussionTab: React.FC<AdminClassDiscussionTabProps> = ({
  subjects,
  onRefreshData,
  setSuccessMessage,
  initialSubjectId
}) => {
  const [discussions, setDiscussions] = useState<ClassDiscussion[]>(() =>
    AcademicService.getClassDiscussions()
  );

  const defaultSubId = initialSubjectId || (subjects.length > 0 ? subjects[0].id : '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultSubId);
  const [editingDiscussionId, setEditingDiscussionId] = useState<string | null>(null);

  // Form states - specifically "which unit is discussed on the class as a text form"
  const [unitNumber, setUnitNumber] = useState<number>(1);
  const [unitName, setUnitName] = useState<string>('');
  const [classDate, setClassDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [facultyName, setFacultyName] = useState<string>('');
  const [discussionText, setDiscussionText] = useState<string>('');
  const [keyPointsRaw, setKeyPointsRaw] = useState<string>('');
  const [homeworkOrTask, setHomeworkOrTask] = useState<string>('');

  // Filter state for list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState<string>('all');

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);

  // When subject changes, prefill unit name if units exist
  const handleSubjectChange = (subId: string) => {
    setSelectedSubjectId(subId);
    const sub = subjects.find(s => s.id === subId);
    if (sub && sub.units.length > 0) {
      const matchUnit = sub.units.find(u => u.unitNumber === unitNumber) || sub.units[0];
      setUnitNumber(matchUnit.unitNumber);
      setUnitName(matchUnit.name);
    }
  };

  const handleUnitNumberChange = (num: number) => {
    setUnitNumber(num);
    if (activeSubject && activeSubject.units.length > 0) {
      const found = activeSubject.units.find(u => u.unitNumber === num);
      if (found) {
        setUnitName(found.name);
      }
    }
  };

  const loadDiscussionTemplate = () => {
    const subName = activeSubject ? activeSubject.name : 'Current Subject';
    setSessionTitle(`Classroom Discussion: Unit ${unitNumber} In-Depth Conceptual Review`);
    setDiscussionText(
`Unit ${unitNumber} Classroom Discussion Summary (${subName}):

1. TOPICS COVERED IN CLASS TODAY:
   - Core concepts, mathematical representations, and definitions of Unit ${unitNumber}.
   - In-depth classroom board demonstration and illustrative examples.
   - Analysis of common university exam patterns for this unit.

2. DETAILED FACULTY EXPLANATIONS:
   - Clarified fundamental theory and solved step-by-step questions on the board.
   - Addressed common student misconceptions regarding edge cases and problem formulation.

3. STUDENT QUESTIONS & DOUBTS RESOLVED:
   - Q: What are the primary distinctions between standard and alternative approaches?
     A: We demonstrated runtime complexity and practical considerations during live discussion.

4. EXAM TIPS & FORMULAS DISCUSSED:
   - Highlighted key theorems and diagrams expected in 5-mark and 10-mark semester questions.`
    );
    setKeyPointsRaw(
`Comprehensive overview of Unit ${unitNumber} fundamentals
Board walkthrough of 2 standard examination problems
Key formula derivations verified by students in class`
    );
    setHomeworkOrTask(`Review Unit ${unitNumber} notes and practice 3 problems from the question bank.`);
  };

  const handleEdit = (disc: ClassDiscussion) => {
    setEditingDiscussionId(disc.id);
    setSelectedSubjectId(disc.subjectId);
    setUnitNumber(disc.unitNumber);
    setUnitName(disc.unitName);
    setClassDate(disc.date);
    setSessionTitle(disc.classSessionTitle);
    setFacultyName(disc.facultyName || '');
    setDiscussionText(disc.discussionText);
    setKeyPointsRaw(disc.keyPoints ? disc.keyPoints.join('\n') : '');
    setHomeworkOrTask(disc.homeworkOrTask || '');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingDiscussionId(null);
    setSessionTitle('');
    setDiscussionText('');
    setKeyPointsRaw('');
    setHomeworkOrTask('');
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete discussion: "${title}"?`)) return;
    AcademicService.deleteClassDiscussion(id);
    const updated = AcademicService.getClassDiscussions();
    setDiscussions(updated);
    setSuccessMessage(`Discussion "${title}" removed.`);
    onRefreshData();
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleCleanAll = () => {
    if (!window.confirm('Are you sure you want to clean all classroom discussion data across all subjects and semesters?')) return;
    AcademicService.clearAllClassDiscussions();
    setDiscussions([]);
    setSuccessMessage('All class discussions have been cleaned.');
    onRefreshData();
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      alert('Please choose a subject.');
      return;
    }
    if (!discussionText.trim()) {
      alert('Please enter the classroom discussion text.');
      return;
    }

    const sub = subjects.find(s => s.id === selectedSubjectId);
    const subName = sub ? sub.name : 'Subject';
    const subShort = sub ? sub.shortName : '';
    const sem = sub ? sub.semester : 1;

    const keyPoints = keyPointsRaw
      .split('\n')
      .map(k => k.trim())
      .filter(Boolean);

    const unitLabel = unitName.trim() ? unitName.trim() : `Unit ${unitNumber}`;

    if (editingDiscussionId) {
      AcademicService.updateClassDiscussion(editingDiscussionId, {
        subjectId: selectedSubjectId,
        subjectName: subName,
        shortName: subShort,
        semester: sem,
        unitNumber,
        unitName: unitLabel,
        date: classDate,
        classSessionTitle: sessionTitle.trim() || `Class Discussion: Unit ${unitNumber}`,
        discussionText: discussionText.trim(),
        facultyName: facultyName.trim() || 'Faculty In-Charge',
        keyPoints,
        homeworkOrTask: homeworkOrTask.trim() || undefined
      });
      setSuccessMessage(`Class discussion for Unit ${unitNumber} updated successfully!`);
      setEditingDiscussionId(null);
    } else {
      AcademicService.addClassDiscussion({
        subjectId: selectedSubjectId,
        subjectName: subName,
        shortName: subShort,
        semester: sem,
        unitNumber,
        unitName: unitLabel,
        date: classDate,
        classSessionTitle: sessionTitle.trim() || `Class Discussion: Unit ${unitNumber}`,
        discussionText: discussionText.trim(),
        facultyName: facultyName.trim() || 'Faculty In-Charge',
        keyPoints,
        homeworkOrTask: homeworkOrTask.trim() || undefined
      });
      setSuccessMessage(`New class discussion for Unit ${unitNumber} (${subShort}) published successfully!`);
    }

    // Reset inputs
    setSessionTitle('');
    setDiscussionText('');
    setKeyPointsRaw('');
    setHomeworkOrTask('');

    const updated = AcademicService.getClassDiscussions();
    setDiscussions(updated);
    onRefreshData();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Filter discussions
  const filteredDiscussions = discussions.filter(d => {
    const matchesSem = filterSemester === 'all' || d.semester.toString() === filterSemester;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      d.subjectName.toLowerCase().includes(query) ||
      (d.shortName && d.shortName.toLowerCase().includes(query)) ||
      d.classSessionTitle.toLowerCase().includes(query) ||
      d.discussionText.toLowerCase().includes(query) ||
      `unit ${d.unitNumber}`.includes(query) ||
      d.unitName.toLowerCase().includes(query);
    return matchesSem && matchesQuery;
  });

  return (
    <div className="p-6 space-y-8">
      {/* Informative Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-950/40 dark:to-cyan-950/30 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <MessageSquare className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Class Discussion Upload — Which Unit is Discussed in Class
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Record classroom lecture discussions as a text form. Specify which unit is currently being taught and discussed in class, along with faculty notes, key concepts, student Q&A, and homework tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={loadDiscussionTemplate}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700 transition shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Load Discussion Template</span>
        </button>
      </div>

      {/* FORM: Record Which Unit is Discussed in Class */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 space-y-5 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingDiscussionId ? 'Edit Class Discussion Text' : 'Publish Class Discussion (Text Form)'}
            </h4>
          </div>
          {editingDiscussionId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-rose-500 hover:underline font-semibold"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Row 1: Subject Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <select
              id="admin-discussion-subject-select"
              value={selectedSubjectId}
              onChange={e => handleSubjectChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                const semSubs = subjects.filter(s => s.semester === sem);
                if (semSubs.length === 0) return null;
                return (
                  <optgroup key={sem} label={`Semester ${sem}`}>
                    {semSubs.map(s => (
                      <option key={s.id} value={s.id}>
                        Sem {s.semester}: {s.shortName} – {s.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Which Unit is Discussed in Class */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Which Unit is Discussed in Class? <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Unit {unitNumber}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                id="admin-discussion-unit-select"
                value={unitNumber}
                onChange={e => handleUnitNumberChange(parseInt(e.target.value, 10))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    Unit {num}
                  </option>
                ))}
              </select>
              <input
                type="text"
                id="admin-discussion-unit-name"
                value={unitName}
                onChange={e => setUnitName(e.target.value)}
                placeholder="Unit title / topic (e.g. Iteration & Loops)"
                className="col-span-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Date, Session Title, Faculty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Date of Class</span>
            </label>
            <input
              type="date"
              id="admin-discussion-date"
              value={classDate}
              onChange={e => setClassDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Session / Lecture Title</span>
            </label>
            <input
              type="text"
              id="admin-discussion-session-title"
              value={sessionTitle}
              onChange={e => setSessionTitle(e.target.value)}
              placeholder="e.g. Lecture 14: Loop Optimization & Tracing"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Faculty / Instructor</span>
            </label>
            <input
              type="text"
              id="admin-discussion-faculty-name"
              value={facultyName}
              onChange={e => setFacultyName(e.target.value)}
              placeholder="e.g. Dr. Raman / Prof. Sen"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Row 3: THE MAIN TEXT FORM - WHICH UNIT IS DISCUSSED ON THE CLASS */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Class Discussion (Text Form) <span className="text-rose-500">*</span></span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {discussionText.length} chars • {discussionText.trim() ? discussionText.trim().split(/\s+/).length : 0} words
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Write or paste the comprehensive text of what was discussed in class for Unit {unitNumber}. Include concepts explained, equations/algorithms derived, student doubts answered, and board notes.
          </p>

          <textarea
            id="admin-discussion-text-form"
            rows={8}
            value={discussionText}
            onChange={e => setDiscussionText(e.target.value)}
            placeholder={`Enter classroom discussion details for Unit ${unitNumber}...\n\nExample:\n- Today in class we covered Unit ${unitNumber} topics...\n- The instructor walked through key formulas and derivations...\n- Discussion centered on differences between approaches and runtime considerations...\n- Questions raised by students regarding university exam preparation...`}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 font-sans focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
            required
          />
        </div>

        {/* Row 4: Key Highlights & Homework / Task */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Discussion Highlights (One per line)
            </label>
            <textarea
              id="admin-discussion-key-points"
              rows={3}
              value={keyPointsRaw}
              onChange={e => setKeyPointsRaw(e.target.value)}
              placeholder="Point 1: Core definition and significance&#10;Point 2: Step-by-step problem walkthrough"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Homework / Next Class Action Item
            </label>
            <textarea
              id="admin-discussion-homework"
              rows={3}
              value={homeworkOrTask}
              onChange={e => setHomeworkOrTask(e.target.value)}
              placeholder="e.g. Read textbook Unit 2 pages 50-65; write code for problem 4 before Wednesday class."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {editingDiscussionId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            id="admin-publish-discussion-btn"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {editingDiscussionId
                ? 'Save Discussion Edits'
                : `Publish Unit ${unitNumber} Class Discussion`}
            </span>
          </button>
        </div>
      </form>

      {/* PUBLISHED CLASS DISCUSSIONS ARCHIVE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/80 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Published Classroom Discussions ({discussions.length})</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review, edit, or delete existing classroom discussion records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search discussions..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
              />
            </div>
            <select
              value={filterSemester}
              onChange={e => setFilterSemester(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s.toString()}>
                  Sem {s}
                </option>
              ))}
            </select>
            {discussions.length > 0 && (
              <button
                type="button"
                id="admin-clean-all-discussions-tab-btn"
                onClick={handleCleanAll}
                className="py-1.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 text-xs font-semibold transition flex items-center gap-1.5"
                title="Clean all discussions across all subjects"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clean All</span>
              </button>
            )}
          </div>
        </div>

        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No class discussions recorded
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Class discussion data is completely clean. Faculty instructors can record new discussions for any unit using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiscussions.map(disc => (
              <div
                key={disc.id}
                id={`admin-disc-card-${disc.id}`}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 space-y-3 shadow-2xs hover:border-indigo-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {disc.shortName || disc.subjectName}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Unit {disc.unitNumber} Discussed in Class
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {disc.date}
                      </span>
                      {disc.facultyName && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {disc.facultyName}
                        </span>
                      )}
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      {disc.classSessionTitle}
                    </h5>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Topic/Unit: <span className="text-slate-700 dark:text-slate-200">{disc.unitName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleEdit(disc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title="Edit discussion text"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(disc.id, disc.classSessionTitle)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title="Delete discussion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* The Discussion Text Form Content */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans line-clamp-4">
                    {disc.discussionText}
                  </div>
                </div>

                {disc.keyPoints && disc.keyPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {disc.keyPoints.map((pt, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        • {pt}
                      </span>
                    ))}
                  </div>
                )}

                {disc.homeworkOrTask && (
                  <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
                    <strong>Homework / Next Session:</strong> {disc.homeworkOrTask}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
