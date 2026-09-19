import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  Mail,
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  Building2,
  Sun,
  Moon
} from 'lucide-react';
import { AcademicService } from '../services/academicService.ts';
import { StudentAccount } from '../types.ts';

interface StudentAuthPageProps {
  onLoginSuccess: (student: StudentAccount) => void;
  onOpenAdmin: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const StudentAuthPage: React.FC<StudentAuthPageProps> = ({
  onLoginSuccess,
  onOpenAdmin,
  isDarkMode,
  setIsDarkMode
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUgNumber, setLoginUgNumber] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regUgNumber, setRegUgNumber] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSemester, setRegSemester] = useState<number>(1);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Clean UG and duplicate registration check (Limit: strictly 1 user/account per UG number)
  const cleanRegUg = regUgNumber.trim().toUpperCase();
  const isUgAlreadyTaken = useMemo(() => {
    if (!cleanRegUg) return false;
    return AcademicService.isUgNumberRegistered(cleanRegUg);
  }, [cleanRegUg]);

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync latest roster from server on load
  useEffect(() => {
    AcademicService.fetchStudentsFromServer().catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await AcademicService.loginStudentAsync(loginUgNumber, loginPassword);
      if (res.success && res.student) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onLoginSuccess(res.student!);
        }, 300);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('An unexpected error occurred during login. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUg = regUgNumber.trim().toUpperCase();
    if (!cleanUg) {
      setErrorMsg('Please enter your UG Number (e.g. UG24AIDS001).');
      return;
    }

    // STRICT 1-ACCOUNT LIMIT CHECK: Do not allow the same UG number to create a new account
    if (isUgAlreadyTaken || AcademicService.isUgNumberRegistered(cleanUg)) {
      setErrorMsg(
        `Account Limit Enforced: UG Number "${cleanUg}" already has an account. Each UG number is strictly limited to ONE account only. Please switch to the Sign In tab.`
      );
      return;
    }

    if (!cleanUg.startsWith('UG') && !/^[A-Z0-9]+$/i.test(cleanUg)) {
      setErrorMsg('Student ID must be a valid UG Number (e.g. UG24AIDS001).');
      return;
    }
    if (!regFullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await AcademicService.registerStudentAsync({
        ugNumber: cleanUg,
        fullName: regFullName,
        email: regEmail,
        semester: regSemester,
        password: regPassword,
        department: 'Artificial Intelligence & Data Science'
      });

      if (res.success && res.student) {
        setSuccessMsg(
          `Account registered successfully for ${res.student.fullName}! All account details are saved in the Admin Portal Excel Database.`
        );
        setTimeout(() => {
          onLoginSuccess(res.student!);
        }, 700);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to register account. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                AI & DS Academic Hub
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                CSE (AI & DS)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Department of Artificial Intelligence & Data Science
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDarkMode(prev => !prev)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle color theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            title="Faculty / Administrator Access Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          {/* Card Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5" />
                <span>Authorized Student Gateway</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                B.Tech AI & DS Academic Portal
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                Log in or create an account using your official AI & DS <strong>UG Number</strong> to access university syllabi, modular units, question bank, and practice exam papers.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-3.5 px-4 text-xs sm:text-sm font-semibold text-center border-b-2 transition flex items-center justify-center gap-2 ${
                authMode === 'login'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Student Sign In</span>
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-3.5 px-4 text-xs sm:text-sm font-semibold text-center border-b-2 transition flex items-center justify-center gap-2 ${
                authMode === 'register'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Student ID / UG Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="student-login-ug-input"
                      type="text"
                      value={loginUgNumber}
                      onChange={e => setLoginUgNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. UG24AIDS001"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono placeholder:font-sans placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Use your official AI & DS undergraduate enrollment number.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="student-login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="student-login-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In & Access Website</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    New student?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Create Account with your UG Number
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* TAB 2: CREATE ACCOUNT */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs">
                  <div className="font-semibold flex items-center justify-between gap-1.5 mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Create Your AI & DS Student Account</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Limit: 1 Account / UG
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                    Each student UG number is strictly restricted to create <strong>only one account</strong>. Duplicate accounts with the same UG number are not permitted.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Student ID (UG Number) <span className="text-rose-500">*</span>
                      </label>
                      {isUgAlreadyTaken && (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          Already Registered
                        </span>
                      )}
                    </div>
                    <input
                      id="reg-ug-number-input"
                      type="text"
                      value={regUgNumber}
                      onChange={e => setRegUgNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. UG24AIDS055"
                      className={`w-full bg-slate-50 dark:bg-slate-800/80 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden transition ${
                        isUgAlreadyTaken
                          ? 'border-rose-500 ring-2 ring-rose-500/20 text-rose-800 dark:text-rose-200 bg-rose-50/40 dark:bg-rose-950/30'
                          : cleanRegUg.length >= 4
                          ? 'border-emerald-500/80 ring-1 ring-emerald-500/20'
                          : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                      }`}
                      required
                    />

                    {/* Live duplicate alert or availability feedback */}
                    {isUgAlreadyTaken ? (
                      <div className="mt-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>UG Number already registered!</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[10.5px] leading-tight">
                          Only one account can be created per student UG number. You cannot register this UG number again.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setLoginUgNumber(cleanRegUg);
                            setLoginPassword('');
                            setErrorMsg(null);
                            setSuccessMsg(`UG Number "${cleanRegUg}" found. Please enter your password to sign in.`);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-0.5 cursor-pointer"
                        >
                          <span>Switch to Sign In with {cleanRegUg}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ) : cleanRegUg.length >= 4 ? (
                      <div className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Available UG Number (Allowed for single account creation)</span>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current Semester <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="reg-semester-select"
                      value={regSemester}
                      onChange={e => setRegSemester(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Student Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-fullname-input"
                    type="text"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="e.g. Riya Deshmukh"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic / Personal Email
                  </label>
                  <input
                    id="reg-email-input"
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="student@college.edu (optional)"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password-input"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Min. 4 characters"
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-confirm-password-input"
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="student-register-submit-btn"
                    type="submit"
                    disabled={isLoading || isUgAlreadyTaken}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 ${
                      isUgAlreadyTaken
                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer disabled:opacity-50'
                    }`}
                  >
                    <span>
                      {isUgAlreadyTaken
                        ? `UG Number Already Used (1 Account Limit)`
                        : 'Create Account & Enter Website'}
                    </span>
                    {!isUgAlreadyTaken && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer note inside card */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Registered accounts logged in Excel</span>
            </span>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Faculty / Admin Portal
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        Department of Artificial Intelligence & Data Science • Academic Resource System
      </footer>
    </div>
  );
};
