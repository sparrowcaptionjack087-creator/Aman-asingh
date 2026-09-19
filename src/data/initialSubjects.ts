import { Subject } from '../types.ts';

export const INITIAL_SUBJECTS: Subject[] = [
  // ================= SEMESTER 1 =================
  {
    id: 'pps-sem1',
    code: 'PCC-CS101',
    name: 'Programming for Problem Solving',
    shortName: 'PPS',
    category: 'core_cs',
    semester: 1,
    credits: 4,
    description: 'Master algorithmic problem solving, procedural programming constructs in C, variables, branching, loops, modular functions, pointer arithmetic, and memory management tailored for Artificial Intelligence and systems foundational development.',
    accentColor: '#2563eb',
    gradient: 'from-blue-600 to-indigo-700',
    badge: 'Core Programming',
    syllabusOverview: 'Covers computational thinking, C syntax, branching, loops, multi-dimensional arrays, modular programming, pointer arithmetic, dynamic memory allocation, and structures.',
    courseObjectives: [
      'Understand computer architecture, compilation pipelines, and problem decomposition.',
      'Design structured algorithmic workflows using pseudocode and flowchart paradigms.',
      'Apply pointer mechanics and dynamic memory allocation for high-performance computing.',
      'Implement file handling and custom structured data types.'
    ],
    courseOutcomes: [
      'Formulate algorithms for arithmetic and logical problems.',
      'Test, execute, and debug modular C programs for complex computations.',
      'Deconstruct memory models using pointers and arrays.'
    ],
    units: []
  },
  {
    id: 'pe-sem1',
    code: 'PCC-PE101',
    name: 'Prompt Engineering',
    shortName: 'PE',
    category: 'applied_ai',
    semester: 1,
    credits: 3,
    description: 'Foundational prompt engineering principles, generative AI concepts, LLM context windows, zero-shot and few-shot prompt formulation, system instructions, and structured output formatting.',
    accentColor: '#ec4899',
    gradient: 'from-pink-600 to-rose-700',
    badge: 'Prompt Engineering',
    syllabusOverview: 'Covers foundations of prompt design, context window tokenization, zero-shot and few-shot paradigms, role prompting, delimiter formatting, output constraints, and prompt structuring.',
    courseObjectives: [
      'Understand LLM context window mechanics and tokenization behavior.',
      'Construct clear, effective prompt templates with explicit constraints and personas.',
      'Apply zero-shot and few-shot prompting techniques for classification and generation.',
      'Format model outputs into JSON, Markdown, and tabular structures.'
    ],
    courseOutcomes: [
      'Design reproducible prompt templates for real-world generative AI tasks.',
      'Diagnose and correct prompt ambiguity, drift, and formatting inconsistencies.',
      'Benchmark basic prompt variations for precision and relevance.'
    ],
    units: []
  },
  {
    id: 'eee-sem1',
    code: 'ESC-EE101',
    name: 'Electrical & Electronics Engineering',
    shortName: 'EEE',
    category: 'engineering',
    semester: 1,
    credits: 3,
    description: 'Fundamental principles of electrical circuits, DC/AC analysis, network theorems (Kirchhoff, Thevenin, Norton), transformers, semiconductor physics, diodes, rectifiers, and operational amplifiers.',
    accentColor: '#d97706',
    gradient: 'from-amber-600 to-orange-700',
    badge: 'Hardware & Circuits',
    syllabusOverview: 'Covers DC circuit theorems, AC sinusoidal waveforms, single-phase transformers, DC machines, PN junction diodes, rectifiers, BJT transistors, and Op-Amps.',
    courseObjectives: [
      'Apply KCL, KVL, Thevenin, and Norton theorems to analyze complex DC networks.',
      'Understand AC sinusoidal waveforms, phase relationships, and power factor.',
      'Analyze working mechanisms of single-phase transformers and rotating machines.',
      'Examine semiconductor diode rectifiers, transistors, and operational amplifiers.'
    ],
    courseOutcomes: [
      'Solve linear electrical networks using mesh and nodal formulations.',
      'Analyze electrical efficiency and losses in electromagnetic converters.',
      'Design basic rectifier and amplifier topologies for hardware-AI sensor interfaces.'
    ],
    units: []
  },
  {
    id: 'calculus-sem1',
    code: 'BSC-MA101',
    name: 'Calculus',
    shortName: 'Calculus',
    category: 'basic_sciences',
    semester: 1,
    credits: 4,
    description: 'Foundational mathematical theory for AI & Data Science: differential calculus, partial derivatives, limits, continuity, Taylor series, Jacobians, Euler theorem, and matrix rank formulations.',
    accentColor: '#7c3aed',
    gradient: 'from-purple-600 to-indigo-800',
    badge: 'Mathematical Foundations',
    syllabusOverview: 'Covers limits, continuity, Taylor & Maclaurin series, partial differentiation, Euler theorem on homogeneous functions, Jacobians, maxima and minima of several variables, and matrix rank.',
    courseObjectives: [
      'Master differential techniques for single and multi-variable functions.',
      'Apply partial derivatives and Jacobians to gradient-based computational models.',
      'Determine extreme values of multivariate functions using Lagrange multipliers.',
      'Analyze linear systems and compute matrix rank for dimensional analysis.'
    ],
    courseOutcomes: [
      'Evaluate maxima and minima for functions of several variables.',
      'Solve systems of linear equations using Gaussian elimination and matrix rank.',
      'Formulate Taylor expansions to approximate non-linear computational curves.'
    ],
    units: []
  },
  {
    id: 'pcs-sem1',
    code: 'HSC-CS101',
    name: 'Principal of Communication Skill',
    shortName: 'PCS',
    category: 'humanities',
    semester: 1,
    credits: 2,
    description: 'Enhance foundational technical and interpersonal communication: the 7 Cs of communication, active listening, grammatical accuracy, technical vocabulary, and workplace communication etiquette.',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-600 to-cyan-700',
    badge: 'Communication Skills',
    syllabusOverview: 'Covers technical communication models, barriers to communication, 7 Cs, grammatical concord, vocabulary enrichment, reading comprehension, active listening, and business correspondence.',
    courseObjectives: [
      'Apply the 7 Cs of effective communication to academic and technical interactions.',
      'Identify and overcome psychological, physical, and semantic barriers to communication.',
      'Develop precision in grammatical structures, technical vocabulary, and sentence concord.',
      'Practice professional email drafting and active listening skills.'
    ],
    courseOutcomes: [
      'Draft concise, grammatically sound emails and routine technical messages.',
      'Demonstrate active listening and accurate oral articulation in group settings.',
      'Comprehend technical texts and extract key quantitative and conceptual findings.'
    ],
    units: []
  },
  {
    id: 'wd-sem1',
    code: 'PCC-CS102',
    name: 'Web Designing',
    shortName: 'WD',
    category: 'applied_ai',
    semester: 1,
    credits: 3,
    description: 'Foundations of web designing, semantic HTML5 structure, modern CSS3 styling, box model, typography, color theory, Flexbox layout systems, and responsive design fundamentals.',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700',
    badge: 'Web Designing',
    syllabusOverview: 'Covers semantic HTML5 elements, CSS selectors, cascading rules, box model, typography, CSS Flexbox, background styling, and mobile-friendly responsive design fundamentals.',
    courseObjectives: [
      'Structure clean, accessible web pages using semantic HTML5 markup.',
      'Style web interfaces with modern CSS3 properties, typography, and color palettes.',
      'Implement fluid 1D layouts using CSS Flexbox.',
      'Apply mobile-first responsive design principles with media queries.'
    ],
    courseOutcomes: [
      'Construct standard-compliant, accessible HTML5 document structures.',
      'Style aesthetically pleasing web interfaces with balanced visual hierarchy.',
      'Build responsive layouts that seamlessly adapt across mobile and desktop displays.'
    ],
    units: []
  },

  // ================= SEMESTER 2 =================
  {
    id: 'pps-sem2',
    code: 'PCC-CS201',
    name: 'Programming for Problem Solving',
    shortName: 'PPS',
    category: 'core_cs',
    semester: 2,
    credits: 4,
    description: 'Advanced procedural and data-structured programming: pointer arithmetic, multi-dimensional structures, file I/O streams, linked lists, stacks, queues, recursion, and modular software design.',
    accentColor: '#1d4ed8',
    gradient: 'from-blue-700 to-indigo-900',
    badge: 'Advanced Programming',
    syllabusOverview: 'Covers dynamic memory management, multi-level pointers, file streams (text & binary), linear data structures (linked lists, stacks, queues), sorting algorithms, and modular compilation.',
    courseObjectives: [
      'Implement dynamic memory allocation and complex pointer arithmetic.',
      'Build linear data structures including singly linked lists, stacks, and queues.',
      'Manage persistent file input/output streams and binary record storage.',
      'Analyze time and space complexity of fundamental searching and sorting algorithms.'
    ],
    courseOutcomes: [
      'Develop robust programs leveraging dynamic data structures in C.',
      'Implement file-backed persistent data storage for technical applications.',
      'Evaluate algorithmic efficiency and modular code architecture.'
    ],
    units: []
  },
  {
    id: 'pe-sem2',
    code: 'PCC-PE202',
    name: 'Prompt Engineering',
    shortName: 'PE',
    category: 'applied_ai',
    semester: 2,
    credits: 3,
    description: 'Master advanced prompt engineering architectures, Chain-of-Thought (CoT), ReAct agent workflows, Retrieval-Augmented Generation (RAG) prompt pipelines, prompt security, and adversarial jailbreak defense.',
    accentColor: '#db2777',
    gradient: 'from-pink-700 to-rose-800',
    badge: 'Prompt Engineering',
    syllabusOverview: 'Covers advanced Chain-of-Thought (CoT), Self-Consistency, ReAct reasoning & acting loops, RAG prompt orchestration, vector context injection, prompt injection mitigation, and automated prompt evaluation.',
    courseObjectives: [
      'Orchestrate complex multi-step reasoning prompts using Chain-of-Thought and ReAct patterns.',
      'Integrate dynamic external context using Retrieval-Augmented Generation (RAG) prompt templates.',
      'Harden generative AI pipelines against prompt injection, jailbreaking, and data leakage.',
      'Benchmark and systematically evaluate prompt performance using automated metrics.'
    ],
    courseOutcomes: [
      'Build production-ready agentic prompt pipelines with reasoning and tool-calling capabilities.',
      'Design secure prompt firewalls to prevent adversarial prompt injection.',
      'Optimize token consumption and response latency across enterprise LLM models.'
    ],
    units: []
  },
  {
    id: 'eee-sem2',
    code: 'ESC-EE201',
    name: 'Electrical & Electronics Engineering',
    shortName: 'EEE',
    category: 'engineering',
    semester: 2,
    credits: 3,
    description: 'Digital electronics principles, Boolean algebra, logic gates, combinational & sequential logic circuits, flip-flops, counters, ADC/DAC conversion, and sensor interfacing for smart AI systems.',
    accentColor: '#b45309',
    gradient: 'from-amber-700 to-yellow-800',
    badge: 'Digital & Systems',
    syllabusOverview: 'Covers number systems, Boolean algebra minimization, Karnaugh maps, combinational circuits (adders, multiplexers), sequential circuits (flip-flops, registers, counters), and ADC/DAC interfaces.',
    courseObjectives: [
      'Simplify Boolean functions using Boolean laws and Karnaugh mapping techniques.',
      'Design combinational circuits including multiplexers, decoders, and arithmetic units.',
      'Analyze sequential logic systems including SR, JK, D, and T flip-flops and counters.',
      'Understand analog-to-digital (ADC) conversion and microcontroller sensor interfaces.'
    ],
    courseOutcomes: [
      'Construct optimized digital logic circuits with minimal gate counts.',
      'Design synchronous and asynchronous counters for digital timing applications.',
      'Interface hardware sensors with digital computing systems for AI telemetry.'
    ],
    units: []
  },
  {
    id: 'calculus-sem2',
    code: 'BSC-MA201',
    name: 'Calculus',
    shortName: 'Calculus',
    category: 'basic_sciences',
    semester: 2,
    credits: 4,
    description: 'Advanced multi-variable calculus and linear algebra for AI: multiple integrals (double & triple), vector calculus (gradient, divergence, curl), Green/Gauss/Stokes theorems, eigenvalues, and eigenvectors.',
    accentColor: '#6d28d9',
    gradient: 'from-purple-700 to-indigo-950',
    badge: 'Advanced Calculus',
    syllabusOverview: 'Covers double and triple integrals, change of order of integration, vector calculus (gradient, divergence, curl), line and surface integrals, Green, Stokes, and Gauss divergence theorems, eigenvalues, and eigenvectors.',
    courseObjectives: [
      'Evaluate double and triple integrals over general multi-dimensional regions.',
      'Compute vector fields, divergence, curl, and potential functions.',
      'Apply Green, Stokes, and Gauss divergence theorems to vector flux problems.',
      'Calculate eigenvalues, eigenvectors, and diagonalization for PCA and machine learning.'
    ],
    courseOutcomes: [
      'Compute volumes, surface areas, and moments using multiple integrals.',
      'Analyze conservative vector fields and apply integral theorems in physics and computing.',
      'Perform matrix diagonalization and spectral decomposition for data reduction.'
    ],
    units: []
  },
  {
    id: 'pcs-sem2',
    code: 'HSC-CS202',
    name: 'Principal of Communication Skill',
    shortName: 'PCS',
    category: 'humanities',
    semester: 2,
    credits: 2,
    description: 'Advanced technical communication: professional report drafting, technical proposals, research papers, oral presentations, public speaking, resume design, and group discussion strategies.',
    accentColor: '#0284c7',
    gradient: 'from-sky-700 to-cyan-800',
    badge: 'Professional Skills',
    syllabusOverview: 'Covers formal technical reports, research documentation, technical proposals, resume & portfolio design, group discussions, technical presentation delivery, and interview dynamics.',
    courseObjectives: [
      'Draft comprehensive formal technical reports and research papers adhering to academic standards.',
      'Create professional resumes, cover letters, and technical portfolios.',
      'Deliver persuasive technical presentations using modern visual communication tools.',
      'Exhibit leadership, constructive argumentation, and critical thinking in Group Discussions.'
    ],
    courseOutcomes: [
      'Produce publication-grade technical reports and documentation.',
      'Deliver engaging technical presentations with poise, clarity, and effective Q&A handling.',
      'Excel in recruitment group discussions and technical interview rounds.'
    ],
    units: []
  },
  {
    id: 'wd-sem2',
    code: 'PCC-CS202',
    name: 'Web Designing',
    shortName: 'WD',
    category: 'applied_ai',
    semester: 2,
    credits: 3,
    description: 'Modern interactive web designing: CSS Grid, advanced responsive layouts, CSS animations, JavaScript DOM events, interactive client-side components, and modern UI/UX design patterns.',
    accentColor: '#047857',
    gradient: 'from-emerald-700 to-teal-800',
    badge: 'Interactive Web UI',
    syllabusOverview: 'Covers CSS Grid layouts, CSS transitions & keyframe animations, JavaScript syntax & DOM manipulation, event handling, interactive form validation, and UI/UX design aesthetics.',
    courseObjectives: [
      'Design complex, multi-dimensional web layouts using CSS Grid.',
      'Create fluid user feedback loops with CSS transitions and keyframe animations.',
      'Program interactive client-side behavior with JavaScript and DOM event listeners.',
      'Apply UI/UX design principles to optimize usability and visual hierarchy.'
    ],
    courseOutcomes: [
      'Build modern, interactive web applications featuring custom animations and Grid systems.',
      'Implement real-time client-side validation and responsive user controls.',
      'Design user-centric web applications adhering to modern UX design heuristics.'
    ],
    units: []
  }
];
