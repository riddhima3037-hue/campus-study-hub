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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
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
