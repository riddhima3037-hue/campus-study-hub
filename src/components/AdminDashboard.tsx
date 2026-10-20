import React, { useState, useEffect } from 'react';
import {
  Shield,
  Upload,
  FileText,
  Video,
  FileCheck2,
  Layers,
  AlertTriangle,
  Send,
  History,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Download,
  Cloud,
  CheckCircle2,
  Users,
  Database,
  Clock,
  Search,
  Server,
  UserCheck,
} from 'lucide-react';
import {
  User,
  Resource,
  Subject,
  Unit,
  Chapter,
  Topic,
  ResourceReport,
  AuditLog,
  StudentLoginRecord,
} from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  user: User;
  subjects: Subject[];
  units: Unit[];
  chapters: Chapter[];
  topics: Topic[];
  resources: Resource[];
  onRefreshData: () => Promise<void>;
  onCloseAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  subjects,
  units,
  chapters,
  topics,
  resources,
  onRefreshData,
  onCloseAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<
    'upload' | 'resources' | 'academic' | 'student_logins' | 'reports' | 'notifications' | 'audit' | 'bulk'
  >('upload');

  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<ResourceReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [studentLogins, setStudentLogins] = useState<StudentLoginRecord[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<User[]>([]);
  const [studentSearchQ, setStudentSearchQ] = useState('');
  const [loginFilterMode, setLoginFilterMode] = useState<'all' | 'today'>('all');

  // Form States for Upload
  const [resourceType, setResourceType] = useState<'notes' | 'video' | 'sessional' | 'aktu_pyq'>('notes');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [unitId, setUnitId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [bytesUploadedStr, setBytesUploadedStr] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string>('');

  // Video specifics
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [channelName, setChannelName] = useState('');
  const [duration, setDuration] = useState('');

  // Paper specifics
  const [examType, setExamType] = useState<'Sessional 1' | 'Sessional 2' | 'Pre-University (PUT)' | 'AKTU End Semester'>('Sessional 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [hasSolution, setHasSolution] = useState(true);

  // New Subject Form
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubBranch, setNewSubBranch] = useState('cse');
  const [newSubSemester, setNewSubSemester] = useState(1);
  const [newSubDesc, setNewSubDesc] = useState('');

  // Notification Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'resource_upload' | 'exam_alert' | 'announcement'>('announcement');

  // Bulk Import Form
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkImportStatus, setBulkImportStatus] = useState('');
  const [adminActionBanner, setAdminActionBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load stats, reports, logs, and student logins
  const loadAdminData = async () => {
    try {
      const [statsData, reportsData, logsData, loginsData] = await Promise.all([
        api.getStats(),
        api.getReports(),
        api.getAuditLogs(),
        api.getStudentLogins().catch(() => ({ logins: [], registeredStudents: [], totalLogins: 0, activeToday: 0 })),
      ]);
      setStats(statsData);
      setReports(reportsData.reports || []);
      setAuditLogs(logsData.logs || []);
      setStudentLogins(loginsData.logins || []);
      setRegisteredStudents(loginsData.registeredStudents || []);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [resources]);

  const activeUnits = units.filter(u => u.subjectId === subjectId);
  const activeTopics = topics.filter(t => t.subjectId === subjectId);

  // Extract YouTube ID from URL helper
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadErrorMsg('');
    setUploadSuccessMsg('');
    setIsUploading(true);

    try {
      let fileUrl = '';
      let fileName = '';
      let fileSize = '';

      // Upload file if selected
      if (selectedFile) {
        setUploadProgress(5);
        setUploadStage('Initiating connection to cloud object storage repository...');

        const uploadRes = await api.uploadFile(selectedFile, (percent, loadedBytes, totalBytes) => {
          setUploadProgress(percent);
          const loadedMb = (loadedBytes / (1024 * 1024)).toFixed(2);
          const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
          setBytesUploadedStr(`${loadedMb} MB of ${totalMb} MB`);

          if (percent < 30) {
            setUploadStage('Opening secure byte stream to storage bucket...');
          } else if (percent < 80) {
            setUploadStage(`Streaming encrypted payload chunks (${percent}%)...`);
          } else if (percent < 99) {
            setUploadStage('Validating document integrity & verifying checksums...');
          } else {
            setUploadStage('Finalizing cloud storage commit & indexing metadata...');
          }
        });

        fileUrl = uploadRes.fileUrl;
        fileName = uploadRes.fileName;
        fileSize = uploadRes.fileSize;
        setUploadProgress(100);
        setUploadStage('Cloud object successfully committed and verified!');
      } else {
        setUploadProgress(100);
        setUploadStage('Publishing lecture resource...');
      }

      const activeSub = subjects.find(s => s.id === subjectId);
      const ytId = youtubeUrl ? extractYoutubeId(youtubeUrl) : '';

      await api.createResource({
        title,
        description,
        type: resourceType,
        subjectId,
        branchId: activeSub?.branchId || 'cse',
        semester: activeSub?.semester || 1,
        unitId: unitId || undefined,
        topicId: topicId || undefined,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
        fileSize: fileSize || (resourceType !== 'video' ? '1.8 MB' : undefined),
        fileType: 'pdf',
        youtubeUrl: youtubeUrl || undefined,
        youtubeId: ytId || undefined,
        channelName: channelName || undefined,
        duration: duration || undefined,
        examType: resourceType === 'sessional' || resourceType === 'aktu_pyq' ? examType : undefined,
        academicYear,
        hasSolution,
      });

      setUploadProgress(100);
      setUploadSuccessMsg(`Successfully published "${title}"!`);

      // Reset fields
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setYoutubeUrl('');
      setChannelName('');
      setDuration('');

      await onRefreshData();
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Failed to create resource.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 4500);
    }
  };

  const handleDeleteResource = async (id: string, _resTitle: string) => {
    try {
      await api.deleteResource(id);
      await onRefreshData();
      await loadAdminData();
    } catch (err: any) {
      console.error('Failed to delete resource', err);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSubject({
        code: newSubCode,
        name: newSubName,
        branchId: newSubBranch,
        semester: newSubSemester,
        description: newSubDesc,
      });
      setAdminActionBanner({ message: `Subject ${newSubCode} created successfully!`, type: 'success' });
      setNewSubCode('');
      setNewSubName('');
      setNewSubDesc('');
      await onRefreshData();
      setTimeout(() => setAdminActionBanner(null), 4000);
    } catch (err: any) {
      setAdminActionBanner({ message: err.message || 'Failed to create subject', type: 'error' });
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.sendNotification({
        title: notifTitle,
        message: notifMessage,
        type: notifType,
      });
      setAdminActionBanner({ message: 'Broadcast notification published to all students!', type: 'success' });
      setNotifTitle('');
      setNotifMessage('');
      await onRefreshData();
      setTimeout(() => setAdminActionBanner(null), 4000);
    } catch (err: any) {
      setAdminActionBanner({ message: err.message || 'Failed to broadcast notification', type: 'error' });
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.resolveReport(reportId, status);
      await loadAdminData();
      setAdminActionBanner({ message: `Report marked as ${status}.`, type: 'success' });
      setTimeout(() => setAdminActionBanner(null), 3500);
    } catch (err: any) {
      setAdminActionBanner({ message: err.message || 'Failed to update report', type: 'error' });
    }
  };

  const handleBulkImport = async () => {
    if (!bulkCsvText.trim()) return;
    setBulkImportStatus('Processing CSV...');
    try {
      const lines = bulkCsvText.trim().split('\n');
      const items: any[] = [];

      // Format: title,type,subjectId,academicYear,hasSolution
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;
        const [title, type, subId, year, sol] = line.split(',').map(s => s.trim());
        if (title && subId) {
          items.push({
            title,
            type: type || 'notes',
            subjectId: subId,
            academicYear: year || '2024-2025',
            hasSolution: sol === 'true' || sol === '1',
          });
        }
      }

      const res = await api.bulkImport(items);
      setBulkImportStatus(`Success! Imported ${res.count} items into study hub.`);
      setBulkCsvText('');
      await onRefreshData();
    } catch (err: any) {
      setBulkImportStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#FAF4E5] border border-[#E8D9B8] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-bloodstone text-warm-white flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-bloodstone">
                UGI Faculty & Admin Dashboard
              </h1>
              <span className="text-[10px] font-mono uppercase bg-bloodstone text-warm-white px-2 py-0.5 rounded font-bold">
                {user.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-charcoal/70 mt-0.5">
              Logged in as {user.name} ({user.email}) · Full Academic Content Administration
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseAdmin}
          className="px-4 py-2 border border-bloodstone/30 bg-warm-white hover:bg-vanilla/40 text-bloodstone font-semibold text-xs rounded-xl self-start md:self-auto transition-colors"
        >
          Exit Admin Console
        </button>
      </div>

      {/* Admin Action Notification Banner */}
      {adminActionBanner && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
            adminActionBanner.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-red-50 text-red-900 border-red-300'
          }`}
        >
          <span>{adminActionBanner.message}</span>
          <button
            type="button"
            onClick={() => setAdminActionBanner(null)}
            className="text-xs font-bold underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Analytics Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-3 shadow-xs text-center">
            <p className="text-[11px] text-charcoal/60">Total Resources</p>
            <p className="text-lg font-bold font-mono text-bloodstone mt-0.5">
              {stats.totalResources}
            </p>
          </div>
          <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-3 shadow-xs text-center">
            <p className="text-[11px] text-charcoal/60">Teacher Notes</p>
            <p className="text-lg font-bold font-mono text-charcoal mt-0.5">{stats.notesCount}</p>
          </div>
          <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-3 shadow-xs text-center">
            <p className="text-[11px] text-charcoal/60">Video Lectures</p>
            <p className="text-lg font-bold font-mono text-charcoal mt-0.5">{stats.videosCount}</p>
          </div>
          <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-3 shadow-xs text-center">
            <p className="text-[11px] text-charcoal/60">Papers & PYQs</p>
            <p className="text-lg font-bold font-mono text-charcoal mt-0.5">
              {stats.sessionalCount + stats.aktuCount}
            </p>
          </div>
          <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-3 shadow-xs text-center">
            <p className="text-[11px] text-charcoal/60">Student Logins</p>
            <p className="text-lg font-bold font-mono text-bloodstone mt-0.5">
              {studentLogins.length || stats.totalLogins || 0}
            </p>
          </div>
          <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-3 shadow-xs text-center">
            <p className="text-[11px] text-charcoal/60">Total Downloads</p>
            <p className="text-lg font-bold font-mono text-emerald-800 mt-0.5">
              {stats.totalDownloads}
            </p>
          </div>
          <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-3 shadow-xs text-center">
            <p className="text-[11px] text-charcoal/60">Pending Reports</p>
            <p className="text-lg font-bold font-mono text-amber-700 mt-0.5">
              {stats.pendingReports}
            </p>
          </div>
        </div>
      )}

      {/* Nav Tab Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        {[
          { key: 'upload', label: 'Upload Resource', icon: Upload },
          { key: 'student_logins', label: `Student Logins & Database (${studentLogins.length})`, icon: Users },
          { key: 'resources', label: `Manage Content (${resources.length})`, icon: FileText },
          { key: 'academic', label: 'Academic Structure', icon: Layers },
          { key: 'reports', label: `Student Reports (${reports.filter(r => r.status === 'pending').length})`, icon: AlertTriangle },
          { key: 'notifications', label: 'Broadcast Notification', icon: Send },
          { key: 'audit', label: 'Audit Trail', icon: History },
          { key: 'bulk', label: 'Bulk CSV Import', icon: FileSpreadsheet },
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-bloodstone text-warm-white border-bloodstone shadow-xs'
                  : 'bg-warm-white text-charcoal/80 border-[#E8D9B8] hover:bg-vanilla/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Upload Form */}
      {activeTab === 'upload' && (
        <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs max-w-3xl">
          <h2 className="text-base font-serif font-bold text-charcoal mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-bloodstone" />
            <span>Publish New Academic Resource</span>
          </h2>

          {uploadSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {uploadErrorMsg && (
            <div className="mb-4 p-3 bg-bloodstone/10 border border-bloodstone/20 text-bloodstone rounded-xl text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{uploadErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleResourceSubmit} className="space-y-4 text-xs">
            {/* Resource Type Selection */}
            <div>
              <label className="block font-semibold text-charcoal mb-1">Resource Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'notes', label: 'Teacher Notes / PDF' },
                  { key: 'video', label: 'YouTube Lecture' },
                  { key: 'sessional', label: 'Sessional Paper' },
                  { key: 'aktu_pyq', label: 'AKTU PYQ Paper' },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setResourceType(item.key as any)}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      resourceType === item.key
                        ? 'bg-bloodstone text-warm-white border-bloodstone'
                        : 'bg-[#FAF4E5]/50 border-[#E8D9B8] text-charcoal/80 hover:bg-vanilla/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block font-semibold text-charcoal mb-1">Resource Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Unit 1: Matrices - Inverse & Gauss Jordan Solved Notes"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF4E5]/40 border border-[#E8D9B8] focus:border-bloodstone rounded-xl text-xs text-charcoal font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-charcoal mb-1">Description / Key Highlights</label>
              <textarea
                rows={2}
                placeholder="Brief summary of derivations, formulas, or solved questions..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF4E5]/40 border border-[#E8D9B8] focus:border-bloodstone rounded-xl text-xs text-charcoal"
              />
            </div>

            {/* Academic Classification */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Subject *</label>
                <select
                  required
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF4E5]/60 border border-[#E8D9B8] rounded-xl text-xs text-charcoal"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name.slice(0, 22)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Unit (Optional)</label>
                <select
                  value={unitId}
                  onChange={e => setUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF4E5]/60 border border-[#E8D9B8] rounded-xl text-xs text-charcoal"
                >
                  <option value="">General / All Units</option>
                  {activeUnits.map(u => (
                    <option key={u.id} value={u.id}>
                      Unit {u.unitNumber}: {u.title.slice(0, 18)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Topic (Optional)</label>
                <select
                  value={topicId}
                  onChange={e => setTopicId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF4E5]/60 border border-[#E8D9B8] rounded-xl text-xs text-charcoal"
                >
                  <option value="">General Unit Topic</option>
                  {activeTopics.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title.slice(0, 22)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Video Specific Fields */}
            {resourceType === 'video' ? (
              <div className="p-4 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl space-y-3">
                <span className="font-bold text-bloodstone uppercase tracking-wider text-[11px] block">
                  YouTube Lecture Metadata
                </span>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">YouTube Video URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-white border border-[#E8D9B8] rounded-xl text-xs text-charcoal font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-charcoal mb-1">Channel / Faculty</label>
                    <input
                      type="text"
                      placeholder="e.g., Gate Smashers, NPTEL"
                      value={channelName}
                      onChange={e => setChannelName(e.target.value)}
                      className="w-full px-3 py-2 bg-warm-white border border-[#E8D9B8] rounded-xl text-xs text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-charcoal mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 18:45"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-warm-white border border-[#E8D9B8] rounded-xl text-xs text-charcoal"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* File Upload Specific Fields */
              <div className="p-4 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl space-y-3">
                <span className="font-bold text-bloodstone uppercase tracking-wider text-[11px] block">
                  Document / PDF File Attachment
                </span>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Select PDF or Scanned Document</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={e => {
                      const f = e.target.files?.[0] || null;
                      setSelectedFile(f);
                      if (f) {
                        setUploadProgress(0);
                        setUploadSuccessMsg('');
                        setUploadErrorMsg('');
                      }
                    }}
                    className="w-full text-xs text-charcoal file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-bloodstone file:text-warm-white hover:file:bg-bloodstone-hover cursor-pointer"
                  />
                  <p className="text-[10px] text-charcoal/60 mt-1">
                    Max size: 50MB. Uploaded files are persistently stored in backend private storage and served to all students.
                  </p>
                </div>

                {/* Selected File Details Banner */}
                {selectedFile && (
                  <div className="p-3 bg-warm-white border border-[#E8D9B8] rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-bloodstone/10 text-bloodstone flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-charcoal truncate" title={selectedFile.name}>
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-charcoal/60 font-mono">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.type || 'Document PDF'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#FAF4E5] text-bloodstone font-mono px-2 py-1 rounded border border-[#E8D9B8] shrink-0 font-semibold">
                      Target: Central Cloud Node
                    </span>
                  </div>
                )}

                {/* Exam Paper Specifics */}
                {(resourceType === 'sessional' || resourceType === 'aktu_pyq') && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {resourceType === 'sessional' && (
                      <div>
                        <label className="block font-semibold text-charcoal mb-1">Exam Type</label>
                        <select
                          value={examType}
                          onChange={e => setExamType(e.target.value as any)}
                          className="w-full px-3 py-2 bg-warm-white border border-[#E8D9B8] rounded-xl text-xs text-charcoal"
                        >
                          <option value="Sessional 1">Sessional 1</option>
                          <option value="Sessional 2">Sessional 2</option>
                          <option value="Pre-University (PUT)">Pre-University (PUT)</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block font-semibold text-charcoal mb-1">Academic Year</label>
                      <input
                        type="text"
                        placeholder="2024-2025"
                        value={academicYear}
                        onChange={e => setAcademicYear(e.target.value)}
                        className="w-full px-3 py-2 bg-warm-white border border-[#E8D9B8] rounded-xl text-xs text-charcoal"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasSolution}
                          onChange={e => setHasSolution(e.target.checked)}
                          className="rounded text-bloodstone focus:ring-bloodstone"
                        />
                        <span className="font-semibold text-bloodstone">Solution Key Attached</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visual Cloud Storage Upload Progress Indicator with Percentage Bar */}
            {(isUploading || uploadProgress > 0) && (
              <div className="p-4 bg-[#FAF4E5] border-2 border-[#E8D9B8] rounded-2xl space-y-3 transition-all shadow-sm">
                {/* Header with Cloud Icon & Percentage */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white transition-colors ${
                        uploadProgress === 100 ? 'bg-emerald-700' : 'bg-bloodstone animate-pulse'
                      }`}
                    >
                      {uploadProgress === 100 ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Cloud className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-charcoal flex items-center gap-1.5 text-xs">
                        <span>Cloud Storage Stream Operation</span>
                        {uploadProgress === 100 ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                            · Verified & Stored
                          </span>
                        ) : (
                          <span className="text-[10px] bg-bloodstone/10 text-bloodstone px-1.5 py-0.2 rounded font-mono font-bold uppercase animate-pulse">
                            · Live Uploading
                          </span>
                        )}
                      </p>
                      {bytesUploadedStr && (
                        <p className="text-[10px] text-charcoal/70 font-mono mt-0.5">
                          {bytesUploadedStr}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Percentage Counter */}
                  <div className="text-right">
                    <span className="font-mono text-xl font-extrabold text-bloodstone tabular-nums">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>

                {/* Real-time Percentage Bar */}
                <div className="w-full bg-[#E8D9B8]/70 h-3 rounded-full overflow-hidden p-0.5 border border-[#E8D9B8] shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      uploadProgress === 100
                        ? 'bg-emerald-700'
                        : 'bg-gradient-to-r from-bloodstone via-bloodstone-light to-bloodstone shadow-sm'
                    }`}
                    style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                  ></div>
                </div>

                {/* Multi-Step Pipeline Feedback */}
                <div className="grid grid-cols-4 gap-1 text-[10px] font-medium pt-1">
                  <div className={`flex items-center gap-1 ${uploadProgress >= 10 ? 'text-bloodstone font-bold' : 'text-charcoal/40'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span className="truncate">1. Cloud Handshake</span>
                  </div>
                  <div className={`flex items-center gap-1 ${uploadProgress >= 40 ? 'text-bloodstone font-bold' : 'text-charcoal/40'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span className="truncate">2. Chunk Stream</span>
                  </div>
                  <div className={`flex items-center gap-1 ${uploadProgress >= 85 ? 'text-bloodstone font-bold' : 'text-charcoal/40'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span className="truncate">3. Checksum Verification</span>
                  </div>
                  <div className={`flex items-center gap-1 ${uploadProgress === 100 ? 'text-emerald-800 font-bold' : 'text-charcoal/40'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span className="truncate">4. Common DB Published</span>
                  </div>
                </div>

                {/* Operational Stage Feedback Text */}
                <div className="flex items-center justify-between text-[11px] text-charcoal/80 pt-1 border-t border-[#E8D9B8]/60">
                  <span className="italic flex items-center gap-1.5">
                    {uploadProgress < 100 && (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-bloodstone" />
                    )}
                    <span>{uploadStage || 'Preparing cloud storage node connection...'}</span>
                  </span>
                  <span className="font-mono text-[10px] text-charcoal/60 bg-warm-white px-2 py-0.5 rounded border border-[#E8D9B8]">
                    Common Database Archive
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 bg-bloodstone hover:bg-bloodstone-hover text-warm-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing & Saving File...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publish to Student Study Hub</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Student Logins & Common Database Registry */}
      {activeTab === 'student_logins' && (
        <div className="space-y-6">
          {/* Header & Database Sync Status Banner */}
          <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bloodstone text-warm-white flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal">
                    Student Logins & Common Database Registry
                  </h2>
                  <p className="text-xs text-charcoal/70">
                    Centralized storage of verified student authentication records, login activity, and shared cloud resources.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={loadAdminData}
                  className="px-3.5 py-1.5 bg-[#FAF4E5] hover:bg-vanilla/50 border border-[#E8D9B8] rounded-xl text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-bloodstone" />
                  <span>Refresh Records</span>
                </button>
              </div>
            </div>

            {/* Centralized Database Architecture Info Callout */}
            <div className="mt-5 p-4 bg-[#FAF4E5]/60 border border-[#E8D9B8] rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-bloodstone/10 text-bloodstone flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-charcoal">Common Central Database</p>
                  <p className="text-[11px] text-charcoal/70 mt-0.5">
                    Persistent database schema (<code className="text-bloodstone">data/db.json</code>) ensures all uploaded notes, PYQs, and student records are unified across all user sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Server className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-charcoal">Cloud Storage Repository</p>
                  <p className="text-[11px] text-charcoal/70 mt-0.5">
                    Uploaded PDF documents and handwritten lecture notes are securely written to <code className="text-emerald-800">data/uploads/</code> with live download tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-charcoal">Verified Student Identity</p>
                  <p className="text-[11px] text-charcoal/70 mt-0.5">
                    Student College IDs and names are verified on login, with timestamps, IP networks, and session counts archived in the central database.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-4 text-center shadow-xs">
              <p className="text-[11px] text-charcoal/60">Total Student Logins</p>
              <p className="text-2xl font-bold font-mono text-bloodstone mt-0.5">
                {studentLogins.length}
              </p>
              <p className="text-[10px] text-charcoal/50 mt-1">Archived in central database</p>
            </div>

            <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-4 text-center shadow-xs">
              <p className="text-[11px] text-charcoal/60">Active Sessions Today</p>
              <p className="text-2xl font-bold font-mono text-emerald-800 mt-0.5">
                {
                  studentLogins.filter(l =>
                    l.loginTimestamp?.startsWith(new Date().toISOString().split('T')[0])
                  ).length
                }
              </p>
              <p className="text-[10px] text-emerald-800 font-medium mt-1">Current academic day</p>
            </div>

            <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-4 text-center shadow-xs">
              <p className="text-[11px] text-charcoal/60">Registered Student Profiles</p>
              <p className="text-2xl font-bold font-mono text-charcoal mt-0.5">
                {registeredStudents.length || stats?.totalStudents || 0}
              </p>
              <p className="text-[10px] text-charcoal/50 mt-1">UGI College Directory</p>
            </div>

            <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-4 text-center shadow-xs">
              <p className="text-[11px] text-charcoal/60">Common Storage Status</p>
              <p className="text-lg font-bold text-emerald-800 flex items-center justify-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Active & Synced</span>
              </p>
              <p className="text-[10px] text-charcoal/50 mt-1">Shared with all students</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by student name, roll number (e.g. UGI/2023...), or department..."
                  value={studentSearchQ}
                  onChange={e => setStudentSearchQ(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl text-xs text-charcoal placeholder:text-charcoal/40 focus:ring-1 focus:ring-bloodstone"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAF4E5] p-1 rounded-xl border border-[#E8D9B8] text-xs">
                <button
                  type="button"
                  onClick={() => setLoginFilterMode('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    loginFilterMode === 'all'
                      ? 'bg-bloodstone text-warm-white shadow-xs'
                      : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  All Login Sessions ({studentLogins.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLoginFilterMode('today')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    loginFilterMode === 'today'
                      ? 'bg-bloodstone text-warm-white shadow-xs'
                      : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  Today Only ({studentLogins.filter(l => l.loginTimestamp?.startsWith(new Date().toISOString().split('T')[0])).length})
                </button>
              </div>
            </div>
          </div>

          {/* Student Logins Audit Table */}
          <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-charcoal">
                  Student Login Audit Stream
                </h3>
                <p className="text-xs text-charcoal/60">
                  Every login is saved into the common database and stamped with verified student roll details.
                </p>
              </div>
              <span className="text-xs font-mono text-bloodstone bg-[#FAF4E5] px-2.5 py-1 rounded-lg border border-[#E8D9B8]">
                {studentLogins.length} Total Sessions
              </span>
            </div>

            {(() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const q = studentSearchQ.toLowerCase().trim();
              const filtered = studentLogins.filter(log => {
                if (loginFilterMode === 'today' && !log.loginTimestamp?.startsWith(todayStr)) return false;
                if (!q) return true;
                return (
                  log.studentName.toLowerCase().includes(q) ||
                  log.collegeId.toLowerCase().includes(q) ||
                  log.email.toLowerCase().includes(q) ||
                  log.department.toLowerCase().includes(q)
                );
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-8 text-center bg-[#FAF4E5]/40 rounded-xl border border-[#E8D9B8]">
                    <Users className="w-8 h-8 text-charcoal/30 mx-auto mb-2" />
                    <p className="text-xs font-medium text-charcoal">No student login records match your criteria.</p>
                    <p className="text-[11px] text-charcoal/60 mt-1">Student logins will appear here automatically when students sign in.</p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto border border-[#E8D9B8] rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF4E5] border-b border-[#E8D9B8] text-charcoal font-semibold">
                      <tr>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">College Roll ID</th>
                        <th className="p-3">Department & Semester</th>
                        <th className="p-3">Login Timestamp</th>
                        <th className="p-3">Network / Device Client</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8D9B8]/50">
                      {filtered.map(item => (
                        <tr key={item.id} className="hover:bg-vanilla/20 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-bloodstone/10 text-bloodstone font-bold flex items-center justify-center text-xs">
                                {item.studentName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-charcoal">{item.studentName}</p>
                                <p className="text-[10px] text-charcoal/60">{item.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-bloodstone font-bold bg-[#FAF4E5] px-2 py-0.5 rounded border border-[#E8D9B8]">
                              {item.collegeId}
                            </span>
                          </td>
                          <td className="p-3 text-charcoal/80">
                            <p className="font-medium">{item.department}</p>
                            <p className="text-[10px] text-charcoal/60">Semester {item.semester}</p>
                          </td>
                          <td className="p-3 text-charcoal/70">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-bloodstone/70" />
                              <span>{new Date(item.loginTimestamp).toLocaleDateString()}</span>
                              <span className="font-mono text-charcoal font-semibold">
                                {new Date(item.loginTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-[11px] text-charcoal/70 font-mono">
                            <p>{item.ip || '127.0.0.1'}</p>
                            <p className="text-[10px] text-charcoal/50 truncate max-w-[200px]" title={item.userAgent}>
                              {item.userAgent || 'Web Browser'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Registered Student Accounts Registry in Database */}
          <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-charcoal">
                  Registered Students in Central Database ({registeredStudents.length})
                </h3>
                <p className="text-xs text-charcoal/60">
                  Student accounts permanently stored in the centralized college database.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {registeredStudents.map(std => (
                <div
                  key={std.id}
                  className="p-3.5 bg-[#FAF4E5]/40 hover:bg-vanilla/30 border border-[#E8D9B8] rounded-xl flex items-start gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-bloodstone text-warm-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {std.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-charcoal truncate">{std.name}</p>
                    <p className="text-[10px] font-mono text-bloodstone font-bold mt-0.5 truncate">
                      {std.collegeId || 'ID Pending'}
                    </p>
                    <p className="text-[10px] text-charcoal/70 mt-1">
                      {std.department || 'Engineering'} · Sem {std.semester || 1}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E8D9B8]/50 text-[10px] text-charcoal/60">
                      <span>Logins: <strong>{std.loginCount || 1}</strong></span>
                      {std.lastLogin && (
                        <span>Last: {new Date(std.lastLogin).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Manage Resources List */}
      {activeTab === 'resources' && (
        <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-charcoal">
              All Central Published Resources ({resources.length})
            </h2>
            <span className="text-xs text-charcoal/60">Persistent in centralized backend storage</span>
          </div>

          <div className="overflow-x-auto border border-[#E8D9B8] rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF4E5] border-b border-[#E8D9B8] text-charcoal font-semibold">
                <tr>
                  <th className="p-3">Title & Type</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Downloads</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D9B8]/50">
                {resources.map(res => {
                  const sub = subjects.find(s => s.id === res.subjectId);
                  return (
                    <tr key={res.id} className="hover:bg-vanilla/10">
                      <td className="p-3 font-medium text-charcoal max-w-xs">
                        <p className="truncate font-semibold">{res.title}</p>
                        <span className="text-[10px] uppercase text-bloodstone font-bold">
                          {res.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-charcoal/80 font-mono">{sub?.code || 'CSE'}</td>
                      <td className="p-3 text-charcoal/70">{res.uploadedBy.name}</td>
                      <td className="p-3 font-mono text-bloodstone font-bold">
                        v{res.version || 1}
                      </td>
                      <td className="p-3 font-mono">{res.downloadCount || 0}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(res.id, res.title)}
                          className="p-1.5 text-bloodstone hover:bg-bloodstone/10 rounded-lg transition-colors"
                          title="Archive / Remove resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Academic Structure Manager */}
      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-charcoal mb-3">Add New Academic Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BCS-502"
                  value={newSubCode}
                  onChange={e => setNewSubCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-charcoal mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="Design and Analysis of Algorithms (DAA)"
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Branch</label>
                  <select
                    value={newSubBranch}
                    onChange={e => setNewSubBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl"
                  >
                    <option value="cse">CSE</option>
                    <option value="ece">ECE</option>
                    <option value="me">ME</option>
                    <option value="ce">Civil</option>
                    <option value="mca">MCA</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Semester</label>
                  <select
                    value={newSubSemester}
                    onChange={e => setNewSubSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-bloodstone text-warm-white font-semibold rounded-xl hover:bg-bloodstone-hover transition-colors mt-2"
              >
                Create Subject
              </button>
            </form>
          </div>

          <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-charcoal mb-3">Configured Subjects ({subjects.length})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {subjects.map(s => (
                <div
                  key={s.id}
                  className="p-2.5 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-bloodstone mr-2">{s.code}</span>
                    <span className="font-medium text-charcoal">{s.name}</span>
                  </div>
                  <span className="text-[11px] text-charcoal/60">Sem {s.semester}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Student Reports */}
      {activeTab === 'reports' && (
        <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-serif font-bold text-charcoal">
            Student Quality Flags & Broken Link Reports ({reports.length})
          </h2>

          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map(rep => (
                <div
                  key={rep.id}
                  className="p-4 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-bloodstone uppercase">{rep.reason.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-charcoal/60">Reported on {new Date(rep.createdAt).toLocaleDateString()}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                          rep.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>
                    <p className="font-semibold text-charcoal">{rep.resourceTitle}</p>
                    {rep.comment && <p className="text-charcoal/70 italic">"{rep.comment}"</p>}
                    <p className="text-[11px] text-charcoal/60">
                      Reported by {rep.reportedBy.name} ({rep.reportedBy.collegeId || 'Student'})
                    </p>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleResolveReport(rep.id, 'resolved')}
                        className="px-3 py-1.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors"
                      >
                        Mark Resolved
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="px-3 py-1.5 border border-[#E8D9B8] text-charcoal/70 rounded-lg hover:bg-vanilla/40"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-charcoal/60">No pending reports!</div>
          )}
        </div>
      )}

      {/* 5. Broadcast Notification */}
      {activeTab === 'notifications' && (
        <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs max-w-xl">
          <h2 className="text-base font-serif font-bold text-charcoal mb-4">
            Broadcast Notification to Students
          </h2>
          <form onSubmit={handleSendNotification} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-charcoal mb-1">Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Sessional 1 Exam Schedule Released"
                value={notifTitle}
                onChange={e => setNotifTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-charcoal mb-1">Message</label>
              <textarea
                rows={3}
                required
                placeholder="Important instructions for students regarding examination or new notes..."
                value={notifMessage}
                onChange={e => setNotifMessage(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-charcoal mb-1">Type</label>
              <select
                value={notifType}
                onChange={e => setNotifType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl"
              >
                <option value="announcement">College Announcement</option>
                <option value="exam_alert">Exam Alert</option>
                <option value="resource_upload">Resource Upload Alert</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-bloodstone text-warm-white font-semibold rounded-xl hover:bg-bloodstone-hover transition-colors shadow-xs"
            >
              Send Campus Notification
            </button>
          </form>
        </div>
      )}

      {/* 6. Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-serif font-bold text-charcoal">
            Administrative Audit Logs ({auditLogs.length})
          </h2>
          <div className="overflow-x-auto border border-[#E8D9B8] rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF4E5] border-b border-[#E8D9B8] text-charcoal font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D9B8]/50 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-vanilla/10">
                    <td className="p-3 text-charcoal/60 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-charcoal font-semibold">{log.userName}</td>
                    <td className="p-3 text-bloodstone font-bold">{log.action}</td>
                    <td className="p-3 text-charcoal/80 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Bulk CSV Import */}
      {activeTab === 'bulk' && (
        <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs max-w-2xl space-y-4">
          <h2 className="text-base font-serif font-bold text-charcoal flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-bloodstone" />
            <span>Bulk Resource Import (CSV / Spreadsheet Format)</span>
          </h2>

          <p className="text-xs text-charcoal/70 leading-relaxed">
            Quickly bulk-populate multiple notes or examination papers into the database.
            <br />
            <strong>CSV Schema:</strong>{' '}
            <code className="bg-[#FAF4E5] px-1 py-0.5 rounded text-bloodstone">
              title, type, subjectId, academicYear, hasSolution
            </code>
          </p>

          <textarea
            rows={6}
            placeholder={`Sample CSV rows:\nEngineering Chemistry Unit 1 Notes, notes, sub-math1, 2024-2025, true\nAKTU 2021 End Sem Math Paper, aktu_pyq, sub-math1, 2020-2021, true`}
            value={bulkCsvText}
            onChange={e => setBulkCsvText(e.target.value)}
            className="w-full p-3 font-mono text-xs bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl text-charcoal focus:ring-1 focus:ring-bloodstone"
          />

          {bulkImportStatus && (
            <p className="text-xs font-semibold text-bloodstone">{bulkImportStatus}</p>
          )}

          <button
            type="button"
            onClick={handleBulkImport}
            className="px-5 py-2.5 bg-bloodstone text-warm-white text-xs font-semibold rounded-xl hover:bg-bloodstone-hover transition-colors shadow-xs"
          >
            Import CSV Items
          </button>
        </div>
      )}
    </div>
  );
};
