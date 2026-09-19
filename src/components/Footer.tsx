import React from 'react';
import { GraduationCap, Heart, BookOpen, CheckCircle2, FileText, LayoutDashboard, Sparkles, ExternalLink } from 'lucide-react';
import { ActiveView } from '../types.ts';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
  onSelectSubject: (subjectId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView, onSelectSubject }) => {
  const semester1Subjects = [
    { id: 'pps-sem1', name: 'PPS – Programming for Problem Solving (Sem 1)' },
    { id: 'pe-sem1', name: 'PE – Prompt Engineering (Sem 1)' },
    { id: 'eee-sem1', name: 'EEE – Electrical & Electronics Engineering (Sem 1)' },
    { id: 'calculus-sem1', name: 'Calculus – Calculus (Sem 1)' },
    { id: 'pcs-sem1', name: 'PCS – Principal of Communication Skill (Sem 1)' },
    { id: 'wd-sem1', name: 'WD – Web Designing (Sem 1)' },
  ];

  const semester2Subjects = [
    { id: 'pps-sem2', name: 'PPS – Programming for Problem Solving (Sem 2)' },
    { id: 'pe-sem2', name: 'PE – Prompt Engineering (Sem 2)' },
    { id: 'eee-sem2', name: 'EEE – Electrical & Electronics Engineering (Sem 2)' },
    { id: 'calculus-sem2', name: 'Calculus – Calculus (Sem 2)' },
    { id: 'pcs-sem2', name: 'PCS – Principal of Communication Skill (Sem 2)' },
    { id: 'wd-sem2', name: 'WD – Web Designing (Sem 2)' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Branding & Department */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  AI & DS Academic Hub
                </h3>
                <p className="text-xs text-indigo-400 font-semibold tracking-wide uppercase">
                  B.Tech CSE – Artificial Intelligence & Data Science
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              A comprehensive student-focused academic ecosystem providing complete semester syllabi, modular unit breakdowns, in-depth study material, interactive topic quizzes, and authentic examination practice papers.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI-Curated Learning Pathways
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                Semester I & II
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  id="footer-link-home"
                  onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Home
                </button>
              </li>
              <li>
                <button
                  id="footer-link-syllabus"
                  onClick={() => { setActiveView('syllabus'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Complete Syllabus
                </button>
              </li>
              <li>
                <button
                  id="footer-link-practice"
                  onClick={() => { setActiveView('practice'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Practice Questions
                </button>
              </li>
              <li>
                <button
                  id="footer-link-papers"
                  onClick={() => { setActiveView('question-papers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Question Papers
                </button>
              </li>
              <li>
                <button
                  id="footer-link-progress"
                  onClick={() => { setActiveView('progress'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" /> Student Dashboard
                </button>
              </li>
              <li>
                <button
                  id="footer-link-about"
                  onClick={() => { setActiveView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> About Department
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Subjects */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Academic Subjects (Semesters 1 & 2)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1.5">
                  Semester 1 (6 Subjects)
                </div>
                <div className="space-y-1">
                  {semester1Subjects.map(sub => (
                    <button
                      key={sub.id}
                      id={`footer-sub-${sub.id}`}
                      onClick={() => {
                        onSelectSubject(sub.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="block w-full text-left text-slate-400 hover:text-indigo-400 transition py-0.5 truncate"
                      title={sub.name}
                    >
                      • {sub.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1.5">
                  Semester 2 (6 Subjects)
                </div>
                <div className="space-y-1">
                  {semester2Subjects.map(sub => (
                    <button
                      key={sub.id}
                      id={`footer-sub-${sub.id}`}
                      onClick={() => {
                        onSelectSubject(sub.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="block w-full text-left text-slate-400 hover:text-indigo-400 transition py-0.5 truncate"
                      title={sub.name}
                    >
                      • {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} AI & DS Academic Hub. Department of Computer Science & Engineering (AI & DS).</p>
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span className="text-indigo-400 font-semibold">for AI & DS Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
