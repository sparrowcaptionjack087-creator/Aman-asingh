import React from 'react';
import { GraduationCap, Sparkles, Award, Users, BookOpen, Compass, Cpu, Target, ExternalLink } from 'lucide-react';
import { ActiveView } from '../types.ts';

interface AboutDepartmentProps {
  setActiveView: (view: ActiveView) => void;
}

export const AboutDepartment: React.FC<AboutDepartmentProps> = ({ setActiveView }) => {
  const pillars = [
    {
      icon: Cpu,
      title: 'Foundational Computation',
      desc: 'Mastery over procedural, object-oriented, and algorithmic problem solving (PPS) combined with robust modern full-stack web engineering (WD).',
    },
    {
      icon: Target,
      title: 'Mathematical Rigor',
      desc: 'Comprehensive grounding in Linear Algebra, Multivariable Calculus, Probability, and Vector Spaces essential for machine learning models.',
    },
    {
      icon: Sparkles,
      title: 'Hardware & Edge Intelligence',
      desc: 'Understanding electrical circuits, digital logic gates, and sensor electronics to deploy intelligence at the physical edge.',
    },
    {
      icon: Compass,
      title: 'Professional Mastery',
      desc: 'Developing industry-grade technical articulation, leadership, ethics, and interpersonal communication skills (PE & PCS).',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold">
          <GraduationCap className="w-4 h-4" /> Department of Computer Science & Engineering
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Artificial Intelligence & Data Science (AI & DS)
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          The B.Tech program in AI & DS combines high-performance computational science, mathematical statistics, deep neural architectures, and software engineering to cultivate visionary innovators, researchers, and engineers.
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Program Vision
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To become a premier center of excellence in Artificial Intelligence and Data Science education and research, empowering engineering students with technical depth, ethical values, and multidisciplinary capabilities to solve impactful global challenges.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Department Mission
          </h2>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Provide robust pedagogical foundations in computing, mathematics, and data analytics.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Foster collaborative industry partnerships, hackathons, and research publications.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Nurture holistic interpersonal communication and ethical leadership in AI deployments.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Curriculum Pillars */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Curriculum Pillars & Core Competencies
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Engineered in alignment with national accreditation and global industry requirements:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
              >
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-indigo-600 dark:text-indigo-400 w-fit">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action to Explore Curriculum */}
      <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200">
            Ready to study the curriculum?
          </h3>
          <p className="text-xs text-indigo-800/80 dark:text-indigo-300">
            Review the 6 core semester subjects, access downloadable notes, and practice exam papers.
          </p>
        </div>
        <button
          onClick={() => { setActiveView('subjects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition shrink-0"
        >
          <span>Explore 6 Subjects</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
