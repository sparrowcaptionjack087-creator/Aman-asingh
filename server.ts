import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const CURRICULUM_FILE = path.join(DATA_DIR, 'curriculum.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getStudents(): any[] {
  try {
    if (fs.existsSync(STUDENTS_FILE)) {
      const content = fs.readFileSync(STUDENTS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.error('Failed to read students file:', err);
  }
  return [];
}

function saveStudents(students: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write students file:', err);
  }
}

function getCurriculum(): any {
  try {
    if (fs.existsSync(CURRICULUM_FILE)) {
      const content = fs.readFileSync(CURRICULUM_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to read curriculum file:', err);
  }
  return null;
}

function saveCurriculum(data: any): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CURRICULUM_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write curriculum file:', err);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// GET all students
app.get('/api/students', (req, res) => {
  const students = getStudents();
  res.json({ success: true, students });
});

// Register a student
app.post('/api/students/register', (req, res) => {
  try {
    const { ugNumber, fullName, email, semester, password, department } = req.body;
    const ugClean = (ugNumber || '').trim().toUpperCase();

    if (!ugClean) {
      return res.status(400).json({ success: false, message: 'UG Number is required.' });
    }
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters.' });
    }

    const students = getStudents();
    const existing = students.find(s => (s.ugNumber || '').trim().toUpperCase() === ugClean);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Account Limit Enforced: UG Number "${ugClean}" already has an account. Each UG number is strictly limited to ONE account only.`
      });
    }

    const newStudent = {
      ugNumber: ugClean,
      fullName: fullName.trim(),
      email: (email || '').trim() || `${ugClean.toLowerCase()}@college.edu`,
      semester: Number(semester) || 1,
      password: password,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      department: department || 'Artificial Intelligence & Data Science'
    };

    students.unshift(newStudent);
    saveStudents(students);

    res.json({
      success: true,
      message: `Account created successfully for ${newStudent.fullName} (${newStudent.ugNumber})!`,
      student: newStudent
    });
  } catch (err: any) {
    console.error('Error registering student on server:', err);
    res.status(500).json({ success: false, message: 'Internal server error while saving student.' });
  }
});

// Login student
app.post('/api/students/login', (req, res) => {
  try {
    const { ugNumber, password } = req.body;
    const ugClean = (ugNumber || '').trim().toUpperCase();

    const students = getStudents();
    const student = students.find(s => (s.ugNumber || '').trim().toUpperCase() === ugClean);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student account found with UG Number "${ugClean}". Please create an account.`
      });
    }

    if (student.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.'
      });
    }

    student.lastLoginAt = Date.now();
    saveStudents(students);

    res.json({
      success: true,
      message: `Welcome back, ${student.fullName}!`,
      student
    });
  } catch (err: any) {
    console.error('Error during student login:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// Two-way synchronization of students (merges client & server)
app.post('/api/students/sync', (req, res) => {
  try {
    const clientStudents = Array.isArray(req.body.students) ? req.body.students : [];
    const serverStudents = getStudents();

    const studentMap = new Map<string, any>();
    // First index server students
    serverStudents.forEach(s => {
      if (s && s.ugNumber) {
        studentMap.set(s.ugNumber.trim().toUpperCase(), s);
      }
    });

    // Merge in any client students that aren't on the server or have newer data
    clientStudents.forEach((cs: any) => {
      if (cs && cs.ugNumber) {
        const key = cs.ugNumber.trim().toUpperCase();
        if (!studentMap.has(key)) {
          studentMap.set(key, cs);
        } else {
          const existing = studentMap.get(key);
          if ((cs.lastLoginAt || 0) > (existing.lastLoginAt || 0)) {
            studentMap.set(key, { ...existing, ...cs });
          }
        }
      }
    });

    const merged = Array.from(studentMap.values());
    merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveStudents(merged);

    res.json({ success: true, students: merged });
  } catch (err: any) {
    console.error('Error syncing students:', err);
    res.status(500).json({ success: false, message: 'Failed to sync students' });
  }
});

// Delete single student
app.delete('/api/students/:ugNumber', (req, res) => {
  try {
    const ugClean = req.params.ugNumber.trim().toUpperCase();
    const students = getStudents();
    const filtered = students.filter(s => (s.ugNumber || '').trim().toUpperCase() !== ugClean);
    saveStudents(filtered);
    res.json({ success: true, message: `Student ${ugClean} deleted successfully.` });
  } catch (err: any) {
    console.error('Error deleting student:', err);
    res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
});

// Clear all students
app.delete('/api/students', (req, res) => {
  try {
    saveStudents([]);
    res.json({ success: true, message: 'All student accounts cleared from server.' });
  } catch (err: any) {
    console.error('Error clearing students:', err);
    res.status(500).json({ success: false, message: 'Failed to clear students.' });
  }
});

// Bulk import student roster
app.post('/api/students/bulk-import', (req, res) => {
  try {
    const newStudents = Array.isArray(req.body.students) ? req.body.students : [];
    const currentStudents = getStudents();
    const existingUgs = new Set(currentStudents.map(s => (s.ugNumber || '').trim().toUpperCase()));

    let importedCount = 0;
    newStudents.forEach((s: any) => {
      const ug = (s.ugNumber || '').trim().toUpperCase();
      if (ug && !existingUgs.has(ug)) {
        currentStudents.push({
          ugNumber: ug,
          fullName: (s.fullName || 'Student').trim(),
          email: (s.email || `${ug.toLowerCase()}@college.edu`).trim(),
          semester: Number(s.semester) || 1,
          password: s.password || 'Student@123',
          createdAt: s.createdAt || Date.now(),
          lastLoginAt: s.lastLoginAt || undefined,
          department: s.department || 'Artificial Intelligence & Data Science'
        });
        existingUgs.add(ug);
        importedCount++;
      }
    });

    currentStudents.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveStudents(currentStudents);

    res.json({
      success: true,
      importedCount,
      total: currentStudents.length,
      students: currentStudents
    });
  } catch (err: any) {
    console.error('Error bulk importing students:', err);
    res.status(500).json({ success: false, message: 'Failed to import students.' });
  }
});

// Curriculum endpoints (backup & sync)
app.get('/api/curriculum', (req, res) => {
  const data = getCurriculum();
  res.json({ success: true, data });
});

app.post('/api/curriculum', (req, res) => {
  try {
    saveCurriculum(req.body);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error saving curriculum:', err);
    res.status(500).json({ success: false, message: 'Failed to save curriculum.' });
  }
});

// ==========================================
// SERVER START & VITE MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI & DS Academic Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
