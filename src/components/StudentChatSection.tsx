import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Heart,
  Reply,
  Trash2,
  Sparkles,
  Search,
  HelpCircle,
  BookOpen,
  Users,
  Flame,
  X,
  ShieldCheck,
  CheckCircle2,
  Tag,
  LogIn
} from 'lucide-react';
import { StudentAccount, StudentChatMessage, StudentChatCategory } from '../types.ts';
import { AcademicService } from '../services/academicService.ts';

interface StudentChatSectionProps {
  currentStudent: StudentAccount | null;
  isAdmin: boolean;
  onOpenAuth?: () => void;
}

const CATEGORIES: { id: StudentChatCategory | 'All'; label: string; icon: React.ReactNode }[] = [
  { id: 'All', label: 'All Messages', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: 'Doubt', label: 'Doubts & Questions', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { id: 'Exam Prep', label: 'Exam Prep', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'Study Group', label: 'Study Groups', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'Project / Lab', label: 'Projects & Labs', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'General', label: 'General', icon: <MessageSquare className="w-3.5 h-3.5" /> },
];

const QUICK_TAGS = [
  '#MachineLearning',
  '#DataStructures',
  '#PythonLab',
  '#DiscreteMath',
  '#ExamPreparation',
  '#AssignmentDoubt'
];

export const StudentChatSection: React.FC<StudentChatSectionProps> = ({
  currentStudent,
  isAdmin,
  onOpenAuth
}) => {
  const [messages, setMessages] = useState<StudentChatMessage[]>(() =>
    AcademicService.getStudentChatMessages()
  );
  const [selectedCategory, setSelectedCategory] = useState<StudentChatCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [activeCategory, setActiveCategory] = useState<StudentChatCategory>('General');
  const [replyingTo, setReplyingTo] = useState<StudentChatMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync state if messages change in local storage or tab
  const reloadMessages = () => {
    setMessages(AcademicService.getStudentChatMessages());
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'aids_hub_student_chats_v1') {
        reloadMessages();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Determine active poster identity
  const isAuthenticated = !!currentStudent || isAdmin;
  const senderUg = currentStudent ? currentStudent.ugNumber : isAdmin ? 'FACULTY-ADMIN' : 'GUEST';
  const senderName = currentStudent ? currentStudent.fullName : isAdmin ? 'Academic Faculty / Admin' : 'Guest';
  const senderSemester = currentStudent ? currentStudent.semester : undefined;

  // Filter and search
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchesCategory = selectedCategory === 'All' || msg.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        msg.message.toLowerCase().includes(query) ||
        msg.studentName.toLowerCase().includes(query) ||
        msg.ugNumber.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [messages, selectedCategory, searchQuery]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = messageText.trim();
    if (!clean) return;

    if (!isAuthenticated) {
      onOpenAuth?.();
      return;
    }

    setIsSubmitting(true);
    try {
      AcademicService.postStudentChatMessage({
        studentName: senderName,
        ugNumber: senderUg,
        semester: senderSemester,
        message: clean,
        category: activeCategory,
        replyToId: replyingTo ? replyingTo.id : undefined,
        replyToText: replyingTo ? replyingTo.message.substring(0, 75) : undefined,
        replyToSender: replyingTo ? `${replyingTo.studentName} (${replyingTo.ugNumber})` : undefined
      });

      setMessageText('');
      setReplyingTo(null);
      reloadMessages();
      setToastMessage('Message posted to Student Chat!');

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (id: string) => {
    AcademicService.toggleLikeChatMessage(id, senderUg);
    reloadMessages();
  };

  const handleDelete = (id: string) => {
    AcademicService.deleteStudentChatMessage(id);
    reloadMessages();
    setToastMessage('Message deleted.');
  };

  const handleClearAll = () => {
    AcademicService.clearAllStudentChatMessages();
    reloadMessages();
    setShowClearConfirm(false);
    setToastMessage('All student chat messages have been removed.');
  };

  const handleInsertTag = (tag: string) => {
    setMessageText(prev => {
      if (!prev) return `${tag} `;
      return `${prev.trim()} ${tag} `;
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section
      id="student-chat-section"
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-colors"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI & DS Student Community Lounge</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <MessageSquare className="w-7 h-7 text-cyan-400" />
              <span>Student Chat & Discussion</span>
            </h2>

            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Real-time peer chat and academic discussion visible to all registered AI & DS students. Connect, clear doubts, share study notes, and collaborate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2 rounded-2xl text-right">
              <div className="text-xs text-indigo-200">Active Messages</div>
              <div className="text-xl font-bold text-white font-mono">{messages.length}</div>
            </div>

            {(isAdmin || messages.length > 0) && (
              <button
                id="clear-all-chats-btn"
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-semibold transition cursor-pointer"
                title="Remove all student chat messages"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="student-chat-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search chat or UG..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages Feed Container */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[480px] overflow-y-auto bg-slate-50/30 dark:bg-slate-950/20">
        {filteredMessages.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500 mx-auto flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No discussions found in this view
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? `No messages matching "${searchQuery}". Try clearing the search query.`
                  : 'Be the first student to start a discussion! Post your doubt or study question below.'}
              </p>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl hover:bg-indigo-100 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredMessages.map(msg => {
            const isAuthor = currentStudent && currentStudent.ugNumber.toUpperCase() === msg.ugNumber.toUpperCase();
            const canDelete = isAuthor || isAdmin;
            const hasLiked = currentStudent && msg.likedBy?.includes(currentStudent.ugNumber.toUpperCase());

            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-md transition space-y-2.5"
              >
                {/* Reply quote banner if any */}
                {msg.replyToSender && msg.replyToText && (
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border-l-2 border-indigo-500 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Reply className="w-3 h-3 text-indigo-500 rotate-180 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {msg.replyToSender}:
                    </span>
                    <span className="truncate italic">"{msg.replyToText}"</span>
                  </div>
                )}

                {/* Author Info Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                        msg.ugNumber.includes('ADMIN')
                          ? 'bg-gradient-to-tr from-amber-600 to-rose-600'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                      }`}
                    >
                      {msg.studentName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {msg.studentName}
                        </span>

                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                          {msg.ugNumber}
                        </span>

                        {msg.semester && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            Sem {msg.semester}
                          </span>
                        )}

                        {msg.ugNumber.includes('ADMIN') && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                            Faculty Admin
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Category Pill */}
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    {msg.category}
                  </span>
                </div>

                {/* Message Body */}
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                  {msg.message}
                </p>

                {/* Action Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    {/* Like / Helpful button */}
                    <button
                      type="button"
                      onClick={() => handleLike(msg.id)}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        hasLiked
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                      }`}
                      title="Mark as helpful"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          hasLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                        }`}
                      />
                      <span>{msg.likes || 0}</span>
                    </button>

                    {/* Reply button */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(msg);
                        const inputEl = document.getElementById('student-chat-textarea');
                        inputEl?.focus();
                      }}
                      className="flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Delete button (Author or Admin) */}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(msg.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Posting Form */}
      <div className="p-4 sm:p-6 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        {/* If user is not logged in */}
        {!isAuthenticated ? (
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Log in to post in Student Chat
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Sign in with your verified UG number and password to discuss and ask doubts with peers.
                </div>
              </div>
            </div>

            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs whitespace-nowrap cursor-pointer self-start sm:self-auto"
              >
                Log In / Sign Up
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Replying banner */}
            {replyingTo && (
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 truncate text-indigo-900 dark:text-indigo-200">
                  <Reply className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold truncate">
                    Replying to {replyingTo.studentName} ({replyingTo.ugNumber}):
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 truncate italic">
                    "{replyingTo.message}"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 text-indigo-500 hover:text-indigo-800 cursor-pointer shrink-0"
                  title="Cancel reply"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3">
              {/* Identity & Category Selector row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Posting as:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {currentStudent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{senderName}</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          ({senderUg})
                        </span>
                        {senderSemester && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Sem {senderSemester}
                          </span>
                        )}
                      </>
                    ) : isAdmin ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>Faculty / Admin</span>
                      </>
                    ) : (
                      <span>Guest Student</span>
                    )}
                  </span>
                </div>

                {/* Category selection */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tag:</span>
                  <select
                    id="chat-category-select"
                    value={activeCategory}
                    onChange={e => setActiveCategory(e.target.value as StudentChatCategory)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Doubt">Doubt & Question</option>
                    <option value="Exam Prep">Exam Prep</option>
                    <option value="Study Group">Study Group</option>
                    <option value="Project / Lab">Project / Lab</option>
                  </select>
                </div>
              </div>

              {/* Quick topic tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-400">Quick inserts:</span>
                {QUICK_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertTag(tag)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-400 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Text Area & Submit */}
              <div className="relative">
                <textarea
                  id="student-chat-textarea"
                  rows={3}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Ask an AI & DS doubt, share exam notes, or discuss lectures with classmates..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl p-3.5 pr-24 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none transition"
                  required
                />

                <div className="absolute right-2.5 bottom-3.5 flex items-center gap-2">
                  <button
                    id="student-chat-send-btn"
                    type="submit"
                    disabled={isSubmitting || !messageText.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Confirmation Modal to Clear All Chats */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-500 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Remove All Chat Messages?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will delete all student messages and discussions from the chat section. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-remove-all-chats-btn"
                type="button"
                onClick={handleClearAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                Yes, Remove All Chats
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
