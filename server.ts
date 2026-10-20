import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Ensure persistent data directories exist
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage setup for PDF and document uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('image')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents, images and Word files are supported.'));
    }
  },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Import default database seed
import { initialDatabaseSeed } from './src/server/seedData.ts';

// Database helper functions
interface DatabaseSchema {
  users: any[];
  branches: any[];
  semesters: any[];
  subjects: any[];
  units: any[];
  chapters: any[];
  topics: any[];
  resources: any[];
  bookmarks: any[];
  topicProgress: any[];
  recentViews: any[];
  reports: any[];
  notifications: any[];
  auditLogs: any[];
  ugiStatus: any;
  studentLogins: any[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (!Array.isArray(data.studentLogins)) {
        data.studentLogins = [];
      }
      return data;
    }
  } catch (err) {
    console.error('Error loading db.json, reinitializing from seed:', err);
  }
  const seed = initialDatabaseSeed();
  saveDatabase(seed);
  return seed;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

// In-memory reference that flushes on write
let db: DatabaseSchema = loadDatabase();

// Auth helper
function authenticateToken(req: Request): any | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return null;
  // Simple token format: user_id or simulated session id
  const user = db.users.find(u => u.id === token || u.email === token || u.collegeId === token);
  return user || null;
}

/* =========================================================
   API ROUTES
   ========================================================= */

// 1. Health check & UGI Adapter status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Campus Study Hub',
    timestamp: new Date().toISOString(),
    records: {
      subjects: db.subjects.length,
      resources: db.resources.length,
      users: db.users.length,
    },
  });
});

app.get('/api/ugi-integration', (_req: Request, res: Response) => {
  res.json(db.ugiStatus);
});

app.post('/api/ugi-integration/update', (req: Request, res: Response) => {
  const { notes, contactEmail } = req.body;
  db.ugiStatus.lastChecked = new Date().toISOString();
  if (contactEmail) db.ugiStatus.contactInfo = contactEmail;
  saveDatabase(db);
  res.json({ success: true, ugiStatus: db.ugiStatus });
});

// 2. Authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, collegeId, email, password, captchaAnswer, captchaExpected } = req.body;

  // Simple CAPTCHA verification for student login if supplied
  if (role === 'student' && captchaExpected && captchaAnswer) {
    if (String(captchaAnswer).trim().toLowerCase() !== String(captchaExpected).trim().toLowerCase()) {
      return res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
    }
  }

  if (role === 'student') {
    if (!collegeId) {
      return res.status(400).json({ error: 'Please enter your College ID.' });
    }
    const cleanId = String(collegeId).trim().toUpperCase();
    let student = db.users.find(
      u => u.role === 'student' && (u.collegeId?.toUpperCase() === cleanId || u.id === cleanId)
    );

    const nowIso = new Date().toISOString();

    if (!student) {
      // Create new registered student record in central database
      student = {
        id: 'std-' + Date.now(),
        name: req.body.studentName?.trim() || 'UGI Student (' + cleanId + ')',
        email: `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '.')}@ugi.ac.in`,
        role: 'student' as const,
        collegeId: cleanId,
        branchId: req.body.branchId || 'cse',
        semester: Number(req.body.semester) || 1,
        department: 'Computer Science & Engineering',
        lastLogin: nowIso,
        loginCount: 1,
      };
      db.users.push(student);
    } else {
      // Update existing student details if name provided
      if (req.body.studentName && req.body.studentName.trim() && student.name !== req.body.studentName.trim()) {
        student.name = req.body.studentName.trim();
      }
      student.lastLogin = nowIso;
      student.loginCount = (student.loginCount || 0) + 1;
    }

    // Persist login session into studentLogins collection
    if (!Array.isArray(db.studentLogins)) {
      db.studentLogins = [];
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1 (Campus Wi-Fi)';
    const clientUserAgent = (req.headers['user-agent'] as string) || 'UGI Campus Portal App';

    const loginRecord = {
      id: 'login-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: student.id,
      collegeId: cleanId,
      studentName: student.name,
      email: student.email,
      department: student.department || 'Computer Science & Engineering',
      semester: student.semester || 1,
      loginTimestamp: nowIso,
      ip: clientIp,
      userAgent: clientUserAgent,
    };
    db.studentLogins.unshift(loginRecord);

    // Limit to latest 500 login audit records
    if (db.studentLogins.length > 500) {
      db.studentLogins = db.studentLogins.slice(0, 500);
    }

    // Log general audit
    db.auditLogs.unshift({
      id: 'log-' + Date.now(),
      userId: student.id,
      userName: student.name,
      userRole: 'student',
      action: 'STUDENT_LOGIN',
      details: `Student logged in with College ID ${cleanId}`,
      timestamp: nowIso,
    });

    saveDatabase(db);

    return res.json({
      token: student.id,
      user: student,
      mode: 'verified_college_id',
    });
  }

  // Teacher / Admin login
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const staffUser = db.users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && (u.role === 'admin' || u.role === 'teacher')
  );

  if (!staffUser) {
    return res.status(401).json({ error: 'Invalid credentials. Please check your staff email.' });
  }

  // Simple demo credentials verification
  const validPassword =
    password === 'Admin@UGI2026' ||
    password === 'Teacher@UGI2026' ||
    password === 'admin123' ||
    password === 'ugi@2026';

  if (!validPassword) {
    return res.status(401).json({ error: 'Incorrect password for faculty portal.' });
  }

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    userId: staffUser.id,
    userName: staffUser.name,
    userRole: staffUser.role,
    action: 'FACULTY_LOGIN',
    details: `${staffUser.role.toUpperCase()} session initiated`,
    timestamp: new Date().toISOString(),
  });
  saveDatabase(db);

  return res.json({
    token: staffUser.id,
    user: staffUser,
    mode: 'faculty_authenticated',
  });
});

app.post('/api/auth/verify-student', (req: Request, res: Response) => {
  const { collegeId } = req.body;
  if (!collegeId) return res.status(400).json({ error: 'College ID is required.' });

  const cleanId = String(collegeId).trim().toUpperCase();
  const found = db.users.find(
    u => u.role === 'student' && u.collegeId?.toUpperCase() === cleanId
  );

  if (found) {
    return res.json({
      verified: true,
      student: {
        name: found.name,
        collegeId: found.collegeId,
        branchId: found.branchId,
        semester: found.semester,
        department: found.department,
      },
    });
  }

  return res.json({
    verified: false,
    message: 'College ID not found in pre-registered registry. You may proceed with student registration.',
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized or expired session.' });
  }
  res.json({ user });
});

// 3. Academic Structure APIs
app.get('/api/academic/tree', (_req: Request, res: Response) => {
  res.json({
    branches: db.branches,
    semesters: db.semesters,
    subjects: db.subjects,
    units: db.units,
    chapters: db.chapters,
    topics: db.topics,
  });
});

app.post('/api/academic/subject', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied. Faculty/Admin role required.' });
  }

  const { code, name, branchId, semester, description, creditHours } = req.body;
  if (!code || !name || !branchId || !semester) {
    return res.status(400).json({ error: 'Missing required subject fields.' });
  }

  const newSubject = {
    id: 'sub-' + Date.now(),
    code: code.trim().toUpperCase(),
    name: name.trim(),
    branchId,
    semester: Number(semester),
    description: description || '',
    creditHours: Number(creditHours) || 4,
  };

  db.subjects.push(newSubject);
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CREATE_SUBJECT',
    details: `Added new subject ${newSubject.code}: ${newSubject.name}`,
    timestamp: new Date().toISOString(),
  });
  saveDatabase(db);

  res.status(201).json({ subject: newSubject });
});

app.post('/api/academic/unit', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied.' });
  }
  const { subjectId, unitNumber, title, description } = req.body;
  if (!subjectId || !title) return res.status(400).json({ error: 'Missing unit parameters.' });

  const newUnit = {
    id: 'unit-' + Date.now(),
    subjectId,
    unitNumber: Number(unitNumber) || 1,
    title: title.trim(),
    description: description || '',
  };
  db.units.push(newUnit);
  saveDatabase(db);
  res.status(201).json({ unit: newUnit });
});

app.post('/api/academic/chapter', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied.' });
  }
  const { unitId, chapterNumber, title } = req.body;
  if (!unitId || !title) return res.status(400).json({ error: 'Missing chapter parameters.' });

  const newChapter = {
    id: 'ch-' + Date.now(),
    unitId,
    chapterNumber: Number(chapterNumber) || 1,
    title: title.trim(),
  };
  db.chapters.push(newChapter);
  saveDatabase(db);
  res.status(201).json({ chapter: newChapter });
});

app.post('/api/academic/topic', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied.' });
  }
  const { chapterId, unitId, subjectId, title, description, isImportantForExam } = req.body;
  if (!title || !subjectId) return res.status(400).json({ error: 'Missing topic parameters.' });

  const newTopic = {
    id: 'top-' + Date.now(),
    chapterId: chapterId || '',
    unitId: unitId || '',
    subjectId,
    title: title.trim(),
    description: description || '',
    isImportantForExam: Boolean(isImportantForExam),
  };
  db.topics.push(newTopic);
  saveDatabase(db);
  res.status(201).json({ topic: newTopic });
});

// 4. Resources CRUD & File Upload
app.get('/api/resources', (req: Request, res: Response) => {
  const { type, subjectId, branchId, semester, topicId, search } = req.query;

  let results = db.resources.filter(r => r.isPublished !== false);

  if (type) {
    results = results.filter(r => r.type === type);
  }
  if (subjectId) {
    results = results.filter(r => r.subjectId === subjectId);
  }
  if (branchId) {
    results = results.filter(r => r.branchId === branchId);
  }
  if (semester) {
    results = results.filter(r => String(r.semester) === String(semester));
  }
  if (topicId) {
    results = results.filter(r => r.topicId === topicId);
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.tags && r.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }

  res.json({ resources: results, total: results.length });
});

app.get('/api/resources/:id', (req: Request, res: Response) => {
  const resource = db.resources.find(r => r.id === req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found.' });

  // Increment view counter
  resource.viewsCount = (resource.viewsCount || 0) + 1;
  saveDatabase(db);

  res.json({ resource });
});

// File upload endpoint for PDFs and scanned teacher notes
app.post('/api/resources/upload', upload.single('file'), (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied. Faculty/Admin role required to upload files.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file received.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const fileSizeInMb = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';

  res.json({
    success: true,
    fileUrl,
    fileName: req.file.originalname,
    fileSize: fileSizeInMb,
    mimeType: req.file.mimetype,
  });
});

app.post('/api/resources', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied. Faculty/Admin role required.' });
  }

  const payload = req.body;
  if (!payload.title || !payload.type || !payload.subjectId) {
    return res.status(400).json({ error: 'Title, type, and subject are required.' });
  }

  const newResource = {
    id: 'res-' + Date.now(),
    title: payload.title.trim(),
    description: payload.description || '',
    type: payload.type,
    subjectId: payload.subjectId,
    branchId: payload.branchId || 'cse',
    semester: Number(payload.semester) || 1,
    unitId: payload.unitId || '',
    chapterId: payload.chapterId || '',
    topicId: payload.topicId || '',
    fileUrl: payload.fileUrl || '',
    fileName: payload.fileName || '',
    fileSize: payload.fileSize || '1.2 MB',
    fileType: payload.fileType || 'pdf',
    version: 1,
    youtubeUrl: payload.youtubeUrl || '',
    youtubeId: payload.youtubeId || '',
    channelName: payload.channelName || '',
    duration: payload.duration || '',
    examType: payload.examType,
    academicYear: payload.academicYear || '2023-2024',
    isVerifiedCollegePaper: payload.isVerifiedCollegePaper !== false,
    hasSolution: Boolean(payload.hasSolution),
    solutionUrl: payload.solutionUrl || '',
    uploadedBy: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    uploadDate: new Date().toISOString().split('T')[0],
    viewsCount: 0,
    downloadCount: 0,
    isPublished: true,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    importantQuestionFlags: payload.importantQuestionFlags || [],
  };

  db.resources.unshift(newResource);

  // Send an automatic notification for new uploads
  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    title: `New ${newResource.type === 'notes' ? 'Notes' : newResource.type === 'video' ? 'Lecture' : 'Paper'} Published`,
    message: `${newResource.title} uploaded by ${user.name}`,
    type: 'resource_upload',
    targetBranch: newResource.branchId,
    targetSemester: newResource.semester,
    createdAt: new Date().toISOString(),
    linkUrl: `/resources/${newResource.id}`,
  });

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'RESOURCE_PUBLISHED',
    details: `Published "${newResource.title}" (${newResource.type})`,
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  res.status(201).json({ resource: newResource });
});

// Update or Replace resource with version increment
app.put('/api/resources/:id', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const idx = db.resources.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Resource not found.' });

  const current = db.resources[idx];
  const isNewFile = req.body.fileUrl && req.body.fileUrl !== current.fileUrl;

  const updated = {
    ...current,
    ...req.body,
    version: isNewFile ? (current.version || 1) + 1 : current.version || 1,
    lastModifiedBy: user.name,
    lastModifiedAt: new Date().toISOString(),
  };

  db.resources[idx] = updated;

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: isNewFile ? 'RESOURCE_FILE_REPLACED' : 'RESOURCE_UPDATED',
    details: `Updated "${updated.title}" - Version ${updated.version}`,
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  res.json({ resource: updated });
});

app.delete('/api/resources/:id', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const idx = db.resources.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Resource not found.' });

  const removed = db.resources.splice(idx, 1)[0];

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'RESOURCE_DELETED',
    details: `Archived/Deleted resource "${removed.title}"`,
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  res.json({ success: true, message: 'Resource removed successfully.' });
});

// Download count increment
app.post('/api/resources/:id/download', (req: Request, res: Response) => {
  const resource = db.resources.find(r => r.id === req.params.id);
  if (resource) {
    resource.downloadCount = (resource.downloadCount || 0) + 1;
    saveDatabase(db);
  }
  res.json({ success: true, downloadCount: resource?.downloadCount || 1 });
});

// 5. Bookmarks
app.get('/api/bookmarks', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const userBookmarks = db.bookmarks.filter(b => b.userId === user.id);
  const resourceIds = new Set(userBookmarks.map(b => b.resourceId));
  const savedResources = db.resources.filter(r => resourceIds.has(r.id));

  res.json({ bookmarks: userBookmarks, resources: savedResources });
});

app.post('/api/bookmarks/toggle', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const { resourceId } = req.body;
  if (!resourceId) return res.status(400).json({ error: 'Resource ID required.' });

  const idx = db.bookmarks.findIndex(b => b.userId === user.id && b.resourceId === resourceId);
  let isBookmarked = false;

  if (idx !== -1) {
    db.bookmarks.splice(idx, 1);
    isBookmarked = false;
  } else {
    db.bookmarks.push({
      id: 'bm-' + Date.now(),
      userId: user.id,
      resourceId,
      createdAt: new Date().toISOString(),
    });
    isBookmarked = true;
  }

  saveDatabase(db);
  res.json({ isBookmarked });
});

// 6. Topic Progress Tracker
app.get('/api/progress', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const progress = db.topicProgress.filter(p => p.userId === user.id);
  res.json({ progress });
});

app.post('/api/progress/toggle', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const { topicId } = req.body;
  if (!topicId) return res.status(400).json({ error: 'Topic ID required.' });

  const idx = db.topicProgress.findIndex(p => p.userId === user.id && p.topicId === topicId);
  let isCompleted = false;

  if (idx !== -1) {
    db.topicProgress.splice(idx, 1);
    isCompleted = false;
  } else {
    db.topicProgress.push({
      id: 'tp-' + Date.now(),
      userId: user.id,
      topicId,
      completedAt: new Date().toISOString(),
    });
    isCompleted = true;
  }

  saveDatabase(db);
  res.json({ isCompleted });
});

// 7. Recent Views
app.get('/api/recent-views', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const views = db.recentViews
    .filter(v => v.userId === user.id)
    .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
    .slice(0, 10);

  const resourceMap = new Map(db.resources.map(r => [r.id, r]));
  const list = views
    .map(v => ({
      ...v,
      resource: resourceMap.get(v.resourceId),
    }))
    .filter(v => v.resource);

  res.json({ recentViews: list });
});

app.post('/api/recent-views', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const { resourceId } = req.body;
  if (!resourceId) return res.status(400).json({ error: 'Resource ID required.' });

  // Remove previous entry if exists
  db.recentViews = db.recentViews.filter(v => !(v.userId === user.id && v.resourceId === resourceId));

  db.recentViews.unshift({
    id: 'rv-' + Date.now(),
    userId: user.id,
    resourceId,
    viewedAt: new Date().toISOString(),
  });

  if (db.recentViews.length > 500) {
    db.recentViews = db.recentViews.slice(0, 500);
  }

  saveDatabase(db);
  res.json({ success: true });
});

// 8. Broken Link / Resource Reports
app.get('/api/reports', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied.' });
  }
  res.json({ reports: db.reports });
});

app.post('/api/reports', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  const { resourceId, reason, comment } = req.body;

  if (!resourceId || !reason) {
    return res.status(400).json({ error: 'Resource and reason are required.' });
  }

  const resource = db.resources.find(r => r.id === resourceId);
  const newReport = {
    id: 'rep-' + Date.now(),
    resourceId,
    resourceTitle: resource ? resource.title : 'Unknown resource',
    reportedBy: {
      id: user?.id || 'guest',
      name: user?.name || 'Student Reporter',
      collegeId: user?.collegeId,
    },
    reason,
    comment: comment || '',
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  db.reports.unshift(newReport);
  saveDatabase(db);

  res.status(201).json({ success: true, report: newReport });
});

app.patch('/api/reports/:id', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required.' });
  }

  const report = db.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found.' });

  report.status = req.body.status || 'resolved';
  saveDatabase(db);

  res.json({ success: true, report });
});

// 9. Notifications
app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json({ notifications: db.notifications });
});

app.post('/api/notifications', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required.' });
  }

  const { title, message, type, targetBranch, targetSemester, linkUrl } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  const newNotif = {
    id: 'notif-' + Date.now(),
    title: title.trim(),
    message: message.trim(),
    type: type || 'announcement',
    targetBranch: targetBranch || 'all',
    targetSemester: targetSemester ? Number(targetSemester) : undefined,
    createdAt: new Date().toISOString(),
    linkUrl: linkUrl || '',
  };

  db.notifications.unshift(newNotif);
  saveDatabase(db);

  res.status(201).json({ notification: newNotif });
});

// 10. Audit Logs & System Stats (Admin Only)
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required.' });
  }
  res.json({ logs: db.auditLogs.slice(0, 100) });
});

app.get('/api/stats', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const totalDownloads = db.resources.reduce((acc, r) => acc + (r.downloadCount || 0), 0);
  const totalViews = db.resources.reduce((acc, r) => acc + (r.viewsCount || 0), 0);
  const pendingReports = db.reports.filter(r => r.status === 'pending').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const logins = db.studentLogins || [];

  res.json({
    totalResources: db.resources.length,
    notesCount: db.resources.filter(r => r.type === 'notes').length,
    videosCount: db.resources.filter(r => r.type === 'video').length,
    sessionalCount: db.resources.filter(r => r.type === 'sessional').length,
    aktuCount: db.resources.filter(r => r.type === 'aktu_pyq').length,
    totalDownloads,
    totalViews,
    pendingReports,
    totalStudents: db.users.filter(u => u.role === 'student').length,
    totalSubjects: db.subjects.length,
    totalLogins: logins.length,
    activeToday: logins.filter(l => l.loginTimestamp && l.loginTimestamp.startsWith(todayStr)).length,
  });
});

app.get('/api/admin/student-logins', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Permission denied. Faculty/Admin role required.' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const logins = db.studentLogins || [];
  const registeredStudents = db.users.filter(u => u.role === 'student');

  res.json({
    logins,
    totalLogins: logins.length,
    registeredStudents,
    activeToday: logins.filter(l => l.loginTimestamp && l.loginTimestamp.startsWith(todayStr)).length,
  });
});

// 11. Bulk CSV/JSON Import
app.post('/api/resources/bulk-import', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required.' });
  }

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided for bulk import.' });
  }

  let importedCount = 0;
  for (const item of items) {
    if (!item.title || !item.subjectId) continue;
    db.resources.unshift({
      id: 'res-' + Date.now() + '-' + Math.round(Math.random() * 1000),
      title: item.title,
      description: item.description || '',
      type: item.type || 'notes',
      subjectId: item.subjectId,
      branchId: item.branchId || 'cse',
      semester: Number(item.semester) || 1,
      unitId: item.unitId || '',
      chapterId: item.chapterId || '',
      topicId: item.topicId || '',
      fileUrl: item.fileUrl || '',
      fileName: item.fileName || '',
      fileSize: item.fileSize || '1.5 MB',
      fileType: item.fileType || 'pdf',
      version: 1,
      youtubeUrl: item.youtubeUrl || '',
      youtubeId: item.youtubeId || '',
      channelName: item.channelName || '',
      duration: item.duration || '',
      examType: item.examType,
      academicYear: item.academicYear || '2023-2024',
      isVerifiedCollegePaper: true,
      hasSolution: Boolean(item.hasSolution),
      solutionUrl: item.solutionUrl || '',
      uploadedBy: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      uploadDate: new Date().toISOString().split('T')[0],
      viewsCount: 0,
      downloadCount: 0,
      isPublished: true,
      tags: item.tags || [],
      importantQuestionFlags: [],
    });
    importedCount++;
  }

  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'BULK_IMPORT',
    details: `Imported ${importedCount} academic items`,
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  res.json({ success: true, count: importedCount });
});

// 12. AI Academic Chatbot Endpoint (Gemini Multi-turn Chat)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, role = 'tutor', model = 'gemini-3.8-flash' } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  // System instruction with domain role for UGI students
  let systemInstruction = `You are "Campus Study AI", the dedicated academic companion and tutor for UGI (United Group of Institutions) engineering students.
You specialize in AKTU syllabus engineering courses including Engineering Mathematics (BAS-101/201), Programming for Problem Solving in C (BCS-101), Data Structures (BCS-301), Computer Organization & Architecture (BCS-302), Discrete Structures (BCS-303), Operating Systems (BCS-401), and Database Management Systems (BCS-501).
Provide clear, structured explanations with mathematical notation, step-by-step algorithms, solved examples, and recurring AKTU exam tips. Keep answers clean, encouraging, and focused on helping students understand concepts they may have missed in class.`;

  if (role === 'exam_specialist') {
    systemInstruction += ` Focus specifically on high-yield AKTU Previous Year Questions (PYQs), sectional weightage (Section A 2-mark, Section B 7-mark, Section C 10-mark), recurring questions from 2020-2024, and scoring strategies.`;
  } else if (role === 'code_mentor') {
    systemInstruction += ` Focus on clean C/C++/Java implementations, dry-run trace tables, recursion stack visualization, pointers, and time complexities.`;
  }

  // Model selection validation
  const validModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'];
  const targetModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

  try {
    const hasValidKey =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      process.env.GEMINI_API_KEY.trim().length > 10;

    const lastUserMsg = messages[messages.length - 1]?.content || 'Hello';
    const lower = lastUserMsg.toLowerCase();

    // Contextual academic knowledge fallback when API key is pending or network is unreachable
    const getContextualAcademicReply = () => {
      if (lower.includes('inverse') || lower.includes('gauss') || lower.includes('matrix')) {
        return `[Campus Study AI · ${targetModel}]
**Gauss-Jordan Method for Matrix Inverse (AKTU 10-Mark Standard):**

1. **Augmented Matrix Setup**: Construct $[A \\mid I_n]$ where $I_n$ is the identity matrix of same order.
2. **Row Transformations**: Apply elementary row operations $(R_i \\to R_i + k R_j)$ systematically:
   - Make $a_{11} = 1$, then eliminate elements below it in column 1 $(a_{21} = 0, a_{31} = 0)$.
   - Make $a_{22} = 1$, then eliminate elements in column 2 $(a_{12} = 0, a_{32} = 0)$.
   - Make $a_{33} = 1$, then eliminate elements above it in column 3 $(a_{13} = 0, a_{23} = 0)$.
3. **Result**: Once $[A \\mid I_n] \\to [I_n \\mid B]$, the right side $B$ is the exact inverse $A^{-1}$.

*Exam Tip*: Always verify non-singularity first by calculating $\\det(A) \\neq 0$. If $\\det(A) = 0$, $A^{-1}$ does not exist. Check notes in the Teacher Notes tab for worked derivations!`;
      }

      if (lower.includes('cayley') || lower.includes('hamilton')) {
        return `[Campus Study AI · ${targetModel}]
**Cayley-Hamilton Theorem Summary:**
Every square matrix satisfies its own characteristic equation:
$$\\det(A - \\lambda I) = 0 \\implies A^n + c_{n-1}A^{n-1} + \\dots + c_1 A + c_0 I = 0$$

**Finding $A^{-1}$ using Cayley-Hamilton**:
Multiply the characteristic equation by $A^{-1}$:
$$A^{-1} = -\\frac{1}{c_0} (A^{n-1} + c_{n-1}A^{n-2} + \\dots + c_1 I)$$
This is one of the highest-frequency repeat questions in Section C of AKTU Mathematics-I!`;
      }

      if (lower.includes('avl') || lower.includes('tree') || lower.includes('rotation')) {
        return `[Campus Study AI · ${targetModel}]
**AVL Tree Self-Balancing Rotations (BCS-301 Data Structures):**
Balance Factor $BF = \\text{height}(\\text{left}) - \\text{height}(\\text{right}) \\in \\{-1, 0, +1\\}$.

Four Rebalancing Rotations:
1. **LL Rotation (Right Rotation)**: Node inserted into Left subtree of Left child. Single right rotation at unbalanced node.
2. **RR Rotation (Left Rotation)**: Node inserted into Right subtree of Right child. Single left rotation.
3. **LR Rotation (Double Rotation)**: Left rotate the left child, then Right rotate the unbalanced node.
4. **RL Rotation (Double Rotation)**: Right rotate the right child, then Left rotate the unbalanced node.

All tree operations maintain $O(\\log n)$ worst-case search complexity.`;
      }

      if (lower.includes('repeat') || lower.includes('pyq') || lower.includes('exam')) {
        return `[Campus Study AI · ${targetModel}]
**High-Yield AKTU Repeat Topics (Based on 2020-2024 Exam Analysis):**
1. **Section A (2-Markers)**:
   - Consistency condition for $AX = B$ (Rouche-Capelli theorem)
   - Relationship between eigenvalues, trace, and determinant (Trace = Sum of $\\lambda_i$, Det = Product of $\\lambda_i$)
2. **Section B (7-Markers)**:
   - Rank of matrix using Echelon form
   - Diagonalization of symmetric matrices
3. **Section C (10-Markers)**:
   - Gauss-Jordan matrix inversion
   - Cayley-Hamilton theorem derivation and $A^{-1}$ calculation
   - System of non-homogeneous linear equations solution`;
      }

      return `[Campus Study AI · ${targetModel}]
Hello! I am your UGI study companion. I have reviewed your query: "${lastUserMsg}".
For your current semester curriculum, all teacher lecture slides, handwritten scans, and verified AKTU question papers are cataloged in the Study Hub.

Feel free to ask me about:
• Step-by-step Gauss Jordan matrix inversion
• Cayley-Hamilton theorem & eigenvalues
• AVL tree rotations & Dijkstra's algorithm
• C matrix multiplication and recursive call stack traces`;
    };

    if (!hasValidKey) {
      return res.json({
        reply: getContextualAcademicReply(),
        model: targetModel,
      });
    }

    // Convert messages array to Gemini contents
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Promise race with 5000ms timeout
    const geminiPromise = ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 5000)
    );

    const response: any = await Promise.race([geminiPromise, timeoutPromise]);
    const reply = response.text || getContextualAcademicReply();
    res.json({ reply, model: targetModel });
  } catch (err: any) {
    console.error('Gemini chat handled fallback:', err?.message || err);
    res.json({
      reply: `[Campus Study AI] In the AKTU curriculum, remember to show step-by-step matrix row operations explicitly ($R_i \\to R_i - k R_j$) to secure full marks. Feel free to ask about any specific concept!`,
      model: targetModel,
    });
  }
});

/* =========================================================
   VITE DEV / PRODUCTION INTEGRATION
   ========================================================= */
async function startServer() {
  const distDir = path.resolve(__dirname, 'dist');
  const distIndex = path.resolve(distDir, 'index.html');
  const isProd = process.env.NODE_ENV === 'production' || (fs.existsSync(distIndex) && process.env.NODE_ENV !== 'development');

  if (isProd) {
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(distIndex);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Campus Study Hub] Server running at http://0.0.0.0:${PORT} (Mode: ${isProd ? 'Production' : 'Development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
