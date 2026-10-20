import {
  User,
  Resource,
  Branch,
  Semester,
  Subject,
  Unit,
  Chapter,
  Topic,
  NotificationItem,
  ResourceReport,
  AuditLog,
  UgiIntegrationStatus,
  StudentLoginRecord,
} from '../types';

const TOKEN_KEY = 'campus_hub_token';
const USER_KEY = 'campus_hub_user';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: User) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to store session in localStorage', err);
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
}

import { initialDatabaseSeed } from '../server/seedData';

const CLIENT_DB_KEY = 'campus_hub_client_db';
const BOOKMARKS_KEY = 'campus_hub_bookmarks';
const PROGRESS_KEY = 'campus_hub_progress';
const RECENT_VIEWS_KEY = 'campus_hub_recent_views';
const AUDIT_LOGS_KEY = 'campus_hub_audit_logs';

function getClientDb(): any {
  try {
    const raw = localStorage.getItem(CLIENT_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  const initial = initialDatabaseSeed();
  try {
    localStorage.setItem(CLIENT_DB_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }
  return initial;
}

function saveClientDb(db: any) {
  try {
    localStorage.setItem(CLIENT_DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save client db', err);
  }
}

function handleClientFallback<T>(endpoint: string, options: RequestInit = {}): T {
  const db = getClientDb();
  const method = (options.method || 'GET').toUpperCase();
  const [path, queryString] = endpoint.split('?');
  const query = new URLSearchParams(queryString || '');

  // 1. Auth: Login
  if (path === '/api/auth/login' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    let user: User;

    if (body.role === 'student') {
      const match = (db.users || []).find(
        (u: any) => u.role === 'student' && (u.collegeId?.toUpperCase() === body.collegeId?.toUpperCase())
      );
      if (match) {
        user = match;
      } else {
        user = {
          id: 'std-' + Date.now(),
          name: body.studentName || 'UGI Student',
          email: `${(body.studentName || 'student').toLowerCase().replace(/\s+/g, '.')}@ugi.ac.in`,
          role: 'student',
          collegeId: body.collegeId || 'UGI/2023/CSE/1042',
          branchId: 'cse',
          semester: 5,
          department: 'Computer Science & Engineering',
        };
      }
    } else {
      const isAdmin = (body.email || '').toLowerCase().includes('admin');
      user = {
        id: isAdmin ? 'adm-001' : 'tea-' + Date.now(),
        name: isAdmin ? 'Academic Dean (UGI Admin)' : 'Dr. Sunita Verma',
        email: body.email || (isAdmin ? 'admin@ugi.edu' : 'teacher.cse@ugi.edu'),
        role: isAdmin ? 'admin' : 'teacher',
        department: 'Computer Science & Engineering',
      };
    }
    const token = 'token-offline-' + Date.now();
    setStoredSession(token, user);
    return { token, user, mode: 'client_offline' } as unknown as T;
  }

  // 2. Auth: Verify Student
  if (path === '/api/auth/verify-student') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const match = (db.users || []).find(
      (u: any) => u.role === 'student' && u.collegeId?.toUpperCase() === body.collegeId?.toUpperCase()
    );
    if (match) {
      return { verified: true, student: match } as unknown as T;
    }
    return {
      verified: true,
      student: {
        id: 'std-custom',
        name: 'UGI Student',
        collegeId: body.collegeId,
        branchId: 'cse',
        semester: 5,
        department: 'Computer Science & Engineering',
      },
    } as unknown as T;
  }

  // 3. Auth: Current User
  if (path === '/api/auth/me') {
    const user = getStoredUser();
    return { user } as unknown as T;
  }

  // 4. Academic Tree
  if (path === '/api/academic/tree') {
    return {
      branches: db.branches || [],
      semesters: db.semesters || [],
      subjects: db.subjects || [],
      units: db.units || [],
      chapters: db.chapters || [],
      topics: db.topics || [],
    } as unknown as T;
  }

  // 5. Academic creation
  if (path === '/api/academic/subject' && method === 'POST') {
    const data = JSON.parse(options.body as string);
    const subject = { ...data, id: 'sub-' + Date.now() };
    db.subjects = [...(db.subjects || []), subject];
    saveClientDb(db);
    return { subject } as unknown as T;
  }

  if (path === '/api/academic/unit' && method === 'POST') {
    const data = JSON.parse(options.body as string);
    const unit = { ...data, id: 'unit-' + Date.now() };
    db.units = [...(db.units || []), unit];
    saveClientDb(db);
    return { unit } as unknown as T;
  }

  if (path === '/api/academic/chapter' && method === 'POST') {
    const data = JSON.parse(options.body as string);
    const chapter = { ...data, id: 'chap-' + Date.now() };
    db.chapters = [...(db.chapters || []), chapter];
    saveClientDb(db);
    return { chapter } as unknown as T;
  }

  if (path === '/api/academic/topic' && method === 'POST') {
    const data = JSON.parse(options.body as string);
    const topic = { ...data, id: 'top-' + Date.now() };
    db.topics = [...(db.topics || []), topic];
    saveClientDb(db);
    return { topic } as unknown as T;
  }

  // 6. Resources List
  if (path === '/api/resources' && method === 'GET') {
    let list: Resource[] = db.resources || [];
    const type = query.get('type');
    const subjectId = query.get('subjectId');
    const branchId = query.get('branchId');
    const semester = query.get('semester');
    const topicId = query.get('topicId');
    const search = query.get('search');

    if (type) list = list.filter(r => r.type === type);
    if (subjectId) list = list.filter(r => r.subjectId === subjectId);
    if (branchId) list = list.filter(r => r.branchId === branchId);
    if (semester) list = list.filter(r => String(r.semester) === semester);
    if (topicId) list = list.filter(r => r.topicId === topicId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)));
    }
    return { resources: list, total: list.length } as unknown as T;
  }

  // 7. Create Resource
  if (path === '/api/resources' && method === 'POST') {
    const data = JSON.parse(options.body as string);
    const resource: Resource = {
      id: 'res-' + Date.now(),
      title: data.title || 'Untitled Resource',
      description: data.description || '',
      type: data.type || 'teacher_note',
      subjectId: data.subjectId || '',
      unitId: data.unitId || '',
      branchId: data.branchId || 'cse',
      semester: data.semester || 5,
      fileUrl: data.fileUrl || '/mock-pdf.pdf',
      fileSize: data.fileSize || '2.4 MB',
      mimeType: data.mimeType || 'application/pdf',
      downloadCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    db.resources = [resource, ...(db.resources || [])];
    saveClientDb(db);
    return { resource } as unknown as T;
  }

  // 8. Single Resource by ID
  if (path.startsWith('/api/resources/') && method === 'GET') {
    const id = path.replace('/api/resources/', '');
    const resource = (db.resources || []).find((r: any) => r.id === id);
    return { resource } as unknown as T;
  }

  // 9. Bookmarks
  if (path === '/api/bookmarks' && method === 'GET') {
    let rawBookmarks: any[] = [];
    try {
      rawBookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
    } catch {
      // ignore
    }
    const bookmarkedIds = new Set(rawBookmarks.map(b => b.resourceId));
    const bookmarkedResources = (db.resources || []).filter((r: any) => bookmarkedIds.has(r.id));
    return { bookmarks: rawBookmarks, resources: bookmarkedResources } as unknown as T;
  }

  if (path === '/api/bookmarks/toggle' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    let rawBookmarks: any[] = [];
    try {
      rawBookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
    } catch {
      // ignore
    }
    const existsIndex = rawBookmarks.findIndex(b => b.resourceId === body.resourceId);
    let isBookmarked = false;
    if (existsIndex >= 0) {
      rawBookmarks.splice(existsIndex, 1);
      isBookmarked = false;
    } else {
      rawBookmarks.push({ id: 'bm-' + Date.now(), resourceId: body.resourceId, createdAt: new Date().toISOString() });
      isBookmarked = true;
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(rawBookmarks));
    return { isBookmarked } as unknown as T;
  }

  // 10. Topic Progress
  if (path === '/api/progress' && method === 'GET') {
    let progress: any[] = [];
    try {
      progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    } catch {
      // ignore
    }
    return { progress } as unknown as T;
  }

  if (path === '/api/progress/toggle' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    let progress: any[] = [];
    try {
      progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    } catch {
      // ignore
    }
    const existsIndex = progress.findIndex(p => p.topicId === body.topicId);
    let isCompleted = false;
    if (existsIndex >= 0) {
      progress.splice(existsIndex, 1);
      isCompleted = false;
    } else {
      progress.push({ id: 'prog-' + Date.now(), topicId: body.topicId, completedAt: new Date().toISOString() });
      isCompleted = true;
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return { isCompleted } as unknown as T;
  }

  // 11. Recent Views
  if (path === '/api/recent-views' && method === 'GET') {
    let views: any[] = [];
    try {
      views = JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || '[]');
    } catch {
      // ignore
    }
    const populated = views.map(v => {
      const res = (db.resources || []).find((r: any) => r.id === v.resourceId);
      return { ...v, resource: res || { id: v.resourceId, title: 'Study Resource', type: 'teacher_note' } };
    });
    return { recentViews: populated } as unknown as T;
  }

  if (path === '/api/recent-views' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    let views: any[] = [];
    try {
      views = JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || '[]');
    } catch {
      // ignore
    }
    const nextViews = [{ id: 'view-' + Date.now(), resourceId: body.resourceId, viewedAt: new Date().toISOString() }, ...views.filter(v => v.resourceId !== body.resourceId)].slice(0, 20);
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(nextViews));
    return { success: true } as unknown as T;
  }

  // 12. Notifications
  if (path === '/api/notifications' && method === 'GET') {
    return { notifications: db.notifications || [] } as unknown as T;
  }

  // 13. Reports
  if (path === '/api/reports') {
    return { reports: db.reports || [] } as unknown as T;
  }

  // 14. Stats
  if (path === '/api/stats') {
    const resList = db.resources || [];
    return {
      totalResources: resList.length,
      notesCount: resList.filter((r: any) => r.type === 'teacher_note').length,
      videosCount: resList.filter((r: any) => r.type === 'video_lecture').length,
      sessionalCount: resList.filter((r: any) => r.type === 'sessional_paper').length,
      aktuCount: resList.filter((r: any) => r.type === 'aktu_pyq').length,
      totalDownloads: 1420,
      totalViews: 3840,
      pendingReports: 0,
      totalStudents: (db.users || []).filter((u: any) => u.role === 'student').length,
      totalSubjects: (db.subjects || []).length,
      totalLogins: 520,
      activeToday: 48,
    } as unknown as T;
  }

  // 15. Student logins for admin
  if (path === '/api/admin/student-logins') {
    return {
      logins: [
        { id: 'log-1', studentName: 'Aarav Sharma', collegeId: 'UGI/2023/CSE/1042', branch: 'CSE', semester: 3, loginTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(), ipAddress: '192.168.1.45', device: 'Chrome / Windows' },
        { id: 'log-2', studentName: 'Priya Verma', collegeId: 'UGI/2024/CSE/2018', branch: 'CSE', semester: 1, loginTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(), ipAddress: '192.168.1.88', device: 'Safari / iPhone' },
      ],
      totalLogins: 520,
      registeredStudents: (db.users || []).filter((u: any) => u.role === 'student'),
      activeToday: 48,
    } as unknown as T;
  }

  // 16. Audit logs
  if (path === '/api/audit-logs') {
    let logs: any[] = [];
    try {
      logs = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || '[]');
    } catch {
      // ignore
    }
    return { logs } as unknown as T;
  }

  // 17. Chat
  if (path === '/api/chat') {
    return {
      reply: 'Hello! I am your Campus Study Hub Academic Mentor. You are currently viewing the static offline edition. For any question regarding AKTU syllabus, CSE units, or numerical steps, review our curated Teacher Notes and Solved PYQs in the Academic Explorer tab!',
      model: 'Campus Tutor AI',
    } as unknown as T;
  }

  // 18. UGI integration status
  if (path === '/api/ugi-integration') {
    return {
      connected: false,
      endpoint: 'https://erp.ugi.ac.in/api/v1/sso',
      mode: 'mock',
      lastSyncedAt: new Date().toISOString(),
      studentCount: 1420,
      facultyCount: 84,
    } as unknown as T;
  }

  return {} as unknown as T;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    // If the server returned an HTML page (like Netlify/Vercel SPA rewrite) or 404, fall back to client mock
    if (!res.ok || !contentType.includes('application/json')) {
      return handleClientFallback<T>(endpoint, options);
    }

    return (await res.json()) as Promise<T>;
  } catch {
    // Network error, offline, or static deployment without backend
    return handleClientFallback<T>(endpoint, options);
  }
}

export const api = {
  // Auth
  async login(payload: {
    role: 'student' | 'teacher' | 'admin';
    collegeId?: string;
    studentName?: string;
    branchId?: string;
    semester?: number;
    email?: string;
    password?: string;
    captchaAnswer?: string;
    captchaExpected?: string;
  }) {
    const res = await request<{ token: string; user: User; mode: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredSession(res.token, res.user);
    return res;
  },

  async verifyStudent(collegeId: string) {
    return request<{ verified: boolean; student?: Partial<User>; message?: string }>(
      '/api/auth/verify-student',
      {
        method: 'POST',
        body: JSON.stringify({ collegeId }),
      }
    );
  },

  async getCurrentUser() {
    return request<{ user: User }>('/api/auth/me');
  },

  // Academic Tree
  async getAcademicTree() {
    return request<{
      branches: Branch[];
      semesters: Semester[];
      subjects: Subject[];
      units: Unit[];
      chapters: Chapter[];
      topics: Topic[];
    }>('/api/academic/tree');
  },

  async createSubject(data: {
    code: string;
    name: string;
    branchId: string;
    semester: number;
    description?: string;
    creditHours?: number;
  }) {
    return request<{ subject: Subject }>('/api/academic/subject', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createUnit(data: { subjectId: string; unitNumber: number; title: string; description?: string }) {
    return request<{ unit: Unit }>('/api/academic/unit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createChapter(data: { unitId: string; chapterNumber: number; title: string }) {
    return request<{ chapter: Chapter }>('/api/academic/chapter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createTopic(data: {
    subjectId: string;
    unitId: string;
    chapterId: string;
    title: string;
    description?: string;
    isImportantForExam?: boolean;
  }) {
    return request<{ topic: Topic }>('/api/academic/topic', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Resources
  async getResources(params: {
    type?: string;
    subjectId?: string;
    branchId?: string;
    semester?: number;
    topicId?: string;
    search?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.subjectId) query.set('subjectId', params.subjectId);
    if (params.branchId) query.set('branchId', params.branchId);
    if (params.semester) query.set('semester', String(params.semester));
    if (params.topicId) query.set('topicId', params.topicId);
    if (params.search) query.set('search', params.search);

    return request<{ resources: Resource[]; total: number }>(`/api/resources?${query.toString()}`);
  },

  async getResourceById(id: string) {
    return request<{ resource: Resource }>(`/api/resources/${id}`);
  },

  async uploadFile(
    file: File,
    onProgress?: (percent: number, loadedBytes: number, totalBytes: number) => void
  ) {
    return new Promise<{
      success: boolean;
      fileUrl: string;
      fileName: string;
      fileSize: string;
      mimeType: string;
    }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const token = getStoredToken();
      xhr.open('POST', '/api/resources/upload');

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent, event.loaded, event.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            reject(new Error('Invalid response received from storage server.'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload transfer.'));

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  },

  async sendChatMessage(payload: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    role?: 'tutor' | 'exam_specialist' | 'code_mentor';
    model?: string;
  }) {
    return request<{ reply: string; model: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createResource(data: Partial<Resource>) {
    return request<{ resource: Resource }>('/api/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateResource(id: string, data: Partial<Resource>) {
    return request<{ resource: Resource }>(`/api/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteResource(id: string) {
    return request<{ success: boolean; message: string }>(`/api/resources/${id}`, {
      method: 'DELETE',
    });
  },

  async trackDownload(id: string) {
    return request<{ success: boolean; downloadCount: number }>(`/api/resources/${id}/download`, {
      method: 'POST',
    });
  },

  // Bookmarks
  async getBookmarks() {
    return request<{ bookmarks: any[]; resources: Resource[] }>('/api/bookmarks');
  },

  async toggleBookmark(resourceId: string) {
    return request<{ isBookmarked: boolean }>('/api/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ resourceId }),
    });
  },

  // Topic Progress
  async getProgress() {
    return request<{ progress: { id: string; userId: string; topicId: string; completedAt: string }[] }>(
      '/api/progress'
    );
  },

  async toggleProgress(topicId: string) {
    return request<{ isCompleted: boolean }>('/api/progress/toggle', {
      method: 'POST',
      body: JSON.stringify({ topicId }),
    });
  },

  // Recent Views
  async getRecentViews() {
    return request<{ recentViews: { id: string; userId: string; resourceId: string; viewedAt: string; resource: Resource }[] }>(
      '/api/recent-views'
    );
  },

  async recordView(resourceId: string) {
    return request<{ success: boolean }>('/api/recent-views', {
      method: 'POST',
      body: JSON.stringify({ resourceId }),
    });
  },

  // Reports
  async reportResource(data: { resourceId: string; reason: string; comment?: string }) {
    return request<{ success: boolean; report: ResourceReport }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getReports() {
    return request<{ reports: ResourceReport[] }>('/api/reports');
  },

  async resolveReport(id: string, status: 'resolved' | 'dismissed') {
    return request<{ success: boolean; report: ResourceReport }>(`/api/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Notifications
  async getNotifications() {
    return request<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  async sendNotification(data: {
    title: string;
    message: string;
    type?: string;
    targetBranch?: string;
    targetSemester?: number;
    linkUrl?: string;
  }) {
    return request<{ notification: NotificationItem }>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin Stats & Audit Logs
  async getStats() {
    return request<{
      totalResources: number;
      notesCount: number;
      videosCount: number;
      sessionalCount: number;
      aktuCount: number;
      totalDownloads: number;
      totalViews: number;
      pendingReports: number;
      totalStudents: number;
      totalSubjects: number;
      totalLogins?: number;
      activeToday?: number;
    }>('/api/stats');
  },

  async getStudentLogins() {
    return request<{
      logins: StudentLoginRecord[];
      totalLogins: number;
      registeredStudents: User[];
      activeToday: number;
    }>('/api/admin/student-logins');
  },

  async getAuditLogs() {
    return request<{ logs: AuditLog[] }>('/api/audit-logs');
  },

  async bulkImport(items: any[]) {
    return request<{ success: boolean; count: number }>('/api/resources/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  // UGI Adapter
  async getUgiStatus() {
    return request<UgiIntegrationStatus>('/api/ugi-integration');
  },

  async updateUgiStatus(data: { notes?: string; contactEmail?: string }) {
    return request<{ success: boolean; ugiStatus: UgiIntegrationStatus }>('/api/ugi-integration/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
