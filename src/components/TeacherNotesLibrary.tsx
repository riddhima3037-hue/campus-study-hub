import React, { useState } from 'react';
import { Resource, Subject, Unit } from '../types';
import {
  FileText,
  Download,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  User as UserIcon,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

interface TeacherNotesLibraryProps {
  resources: Resource[];
  subjects: Subject[];
  units: Unit[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (resourceId: string) => void;
  onPreviewResource: (resource: Resource) => void;
  onOpenReport: (resource: Resource) => void;
}

export const TeacherNotesLibrary: React.FC<TeacherNotesLibraryProps> = ({
  resources,
  subjects,
  units,
  bookmarkedIds,
  onToggleBookmark,
  onPreviewResource,
  onOpenReport,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter only notes
  const notesResources = resources.filter(r => r.type === 'notes');

  const filteredNotes = notesResources.filter(note => {
    if (selectedSubjectId !== 'all' && note.subjectId !== selectedSubjectId) return false;
    if (selectedFileType !== 'all') {
      if (selectedFileType === 'handwritten' && note.fileType !== 'handwritten_scan') return false;
      if (selectedFileType === 'pdf' && note.fileType === 'handwritten_scan') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchDesc = note.description.toLowerCase().includes(q);
      const matchTags = note.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  const handleDownload = async (note: Resource) => {
    try {
      await api.trackDownload(note.id);
      if (note.fileUrl) {
        const link = document.createElement('a');
        link.href = note.fileUrl;
        link.download = note.fileName || `${note.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const cleanContent = `CAMPUS STUDY HUB - UGI DIGITAL REPOSITORY\n\nTitle: ${note.title}\nUploaded By: ${note.uploadedBy.name}\nDate: ${note.uploadDate}\n\nDescription:\n${note.description}\n\n[Verified Faculty Academic Material - Stored in Centralized Repository]`;
        const blob = new Blob([cleanContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Notes.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Description */}
      <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-bloodstone mb-1">
              <FileText className="w-4 h-4" />
              <span>DIGITAL ACADEMIC LIBRARY</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal">
              Teacher Notes & Handwritten Scans
            </h1>
            <p className="text-xs text-charcoal/70 mt-1 max-w-xl">
              Official faculty slides, classroom derivations, and step-by-step solved tutorials
              uploaded by UGI department teachers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-bloodstone bg-[#FAF4E5] px-3 py-1.5 rounded-lg border border-[#E8D9B8] self-start sm:self-auto">
            <span>{notesResources.length} Documents Indexed</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-4 border-t border-[#E8D9B8]/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal/50 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search notes by topic, author, or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF4E5]/40 border border-[#E8D9B8] focus:border-bloodstone rounded-xl text-xs text-charcoal"
            />
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="bg-[#FAF4E5] border border-[#E8D9B8] text-xs font-medium rounded-xl px-3 py-2 text-charcoal focus:ring-1 focus:ring-bloodstone"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name.slice(0, 24)}...
                </option>
              ))}
            </select>

            {/* File Type Filter */}
            <select
              value={selectedFileType}
              onChange={e => setSelectedFileType(e.target.value)}
              className="bg-[#FAF4E5] border border-[#E8D9B8] text-xs font-medium rounded-xl px-3 py-2 text-charcoal focus:ring-1 focus:ring-bloodstone"
            >
              <option value="all">All Note Formats</option>
              <option value="pdf">Official PDFs</option>
              <option value="handwritten">Handwritten Faculty Scans</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map(note => {
            const sub = subjectMap.get(note.subjectId);
            const isSaved = bookmarkedIds.has(note.id);

            return (
              <div
                key={note.id}
                className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Card Header Metadata */}
                  <div className="flex items-center justify-between text-[11px] text-charcoal/60">
                    <span className="font-mono font-semibold text-bloodstone bg-vanilla/50 px-2 py-0.5 rounded border border-vanilla-dark">
                      {sub?.code || 'UGI'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {note.version && note.version > 1 && (
                        <span className="text-[10px] font-mono font-bold text-bloodstone">
                          v{note.version}
                        </span>
                      )}
                      <span className="uppercase text-[10px] font-semibold text-charcoal/50">
                        {note.fileType === 'handwritten_scan' ? 'Handwritten' : 'PDF'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => onPreviewResource(note)}
                    className="text-sm sm:text-base font-semibold text-charcoal group-hover:text-bloodstone transition-colors leading-snug cursor-pointer line-clamp-2"
                  >
                    {note.title}
                  </h3>

                  <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                    {note.description}
                  </p>

                  {/* Faculty & Upload Date */}
                  <div className="space-y-1 pt-1 text-[11px] text-charcoal/70 border-t border-[#E8D9B8]/50">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-bloodstone" />
                      <span className="font-medium text-charcoal">{note.uploadedBy.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-charcoal/60">
                      <span>Uploaded {note.uploadDate}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{note.fileSize || '2.1 MB'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{note.downloadCount || 0} dl</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-[#E8D9B8]/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Bookmark Toggle */}
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(note.id)}
                      title={isSaved ? 'Remove from Saved' : 'Save Bookmark'}
                      className={`p-2 rounded-lg transition-colors ${
                        isSaved
                          ? 'text-bloodstone bg-bloodstone/10'
                          : 'text-charcoal/60 hover:text-charcoal hover:bg-vanilla/40'
                      }`}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    {/* Report File */}
                    <button
                      type="button"
                      onClick={() => onOpenReport(note)}
                      title="Report broken or incorrect document"
                      className="p-2 text-charcoal/50 hover:text-bloodstone hover:bg-bloodstone/10 rounded-lg transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Download */}
                    <button
                      type="button"
                      onClick={() => handleDownload(note)}
                      title="Download file"
                      className="p-2 text-charcoal/70 hover:text-bloodstone hover:bg-vanilla/40 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Preview PDF */}
                    <button
                      type="button"
                      onClick={() => onPreviewResource(note)}
                      className="px-3.5 py-1.5 bg-bloodstone hover:bg-bloodstone-hover text-warm-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      Read PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-warm-white border border-[#E8D9B8] rounded-2xl text-center space-y-3">
          <FileText className="w-8 h-8 text-charcoal/40 mx-auto" />
          <h3 className="font-semibold text-charcoal text-sm">No notes found matching your criteria</h3>
          <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
            Try adjusting your search terms or selecting a different subject filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedSubjectId('all');
              setSelectedFileType('all');
              setSearchQuery('');
            }}
            className="text-xs text-bloodstone font-semibold underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
