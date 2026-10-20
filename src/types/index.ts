export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId?: string; // e.g. UGI/2023/CSE/1042
  branchId?: string;
  semester?: number;
  avatar?: string;
  department?: string;
  lastLogin?: string;
  loginCount?: number;
}

export interface StudentLoginRecord {
  id: string;
  userId: string;
  collegeId: string;
  studentName: string;
  email: string;
  department: string;
  semester: number;
  loginTimestamp: string;
  ip?: string;
  userAgent?: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  durationYears: number;
}

export interface Semester {
  id: string;
  number: number;
  branchId: string;
  academicYear: string; // e.g., 2024-2025
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  branchId: string;
  semester: number;
  description?: string;
  icon?: string;
  creditHours?: number;
}

export interface Unit {
  id: string;
  subjectId: string;
  unitNumber: number;
  title: string;
  description?: string;
}

export interface Chapter {
  id: string;
  unitId: string;
  chapterNumber: number;
  title: string;
}

export interface Topic {
  id: string;
  chapterId: string;
  unitId: string;
  subjectId: string;
  title: string;
  description?: string;
  isImportantForExam?: boolean;
}

export type ResourceType = 'notes' | 'video' | 'sessional' | 'aktu_pyq';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  subjectId: string;
  branchId: string;
  semester: number;
  unitId?: string;
  chapterId?: string;
  topicId?: string;
  
  // File details for notes and examination papers
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: 'pdf' | 'handwritten_scan' | 'doc';
  version?: number;
  
  // Video details for YouTube
  youtubeUrl?: string;
  youtubeId?: string;
  channelName?: string;
  duration?: string;
  
  // Examination paper details
  examType?: 'Sessional 1' | 'Sessional 2' | 'Pre-University (PUT)' | 'AKTU End Semester';
  academicYear?: string; // e.g. "2023-2024"
  examDate?: string;
  isVerifiedCollegePaper?: boolean;
  hasSolution?: boolean;
  solutionUrl?: string;
  
  // Metadata
  uploadedBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  uploadDate: string;
  viewsCount: number;
  downloadCount: number;
  isPublished: boolean;
  tags?: string[];
  importantQuestionFlags?: string[];
}

export interface Bookmark {
  id: string;
  userId: string;
  resourceId: string;
  createdAt: string;
}

export interface TopicProgress {
  id: string;
  userId: string;
  topicId: string;
  completedAt: string;
}

export interface ResourceReport {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reportedBy: {
    id: string;
    name: string;
    collegeId?: string;
  };
  reason: 'broken_file' | 'incorrect_subject' | 'poor_quality' | 'invalid_video' | 'other';
  comment: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'resource_upload' | 'exam_alert' | 'announcement';
  targetBranch?: string;
  targetSemester?: number;
  createdAt: string;
  linkUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface UgiIntegrationStatus {
  status: 'adapter_ready_pending_credentials' | 'official_connected';
  mode: 'demo_simulation' | 'production_sso';
  requirements: {
    title: string;
    description: string;
    provided: boolean;
  }[];
  contactInfo: string;
  lastChecked: string;
}
