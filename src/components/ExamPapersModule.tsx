import React, { useState } from 'react';
import { Resource, Subject, Branch } from '../types';
import {
  FileCheck2,
  GraduationCap,
  Download,
  Bookmark,
  BookmarkCheck,
  Search,
  CheckCircle,
  FileText,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

interface ExamPapersModuleProps {
  resources: Resource[];
  subjects: Subject[];
  branches: Branch[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (resourceId: string) => void;
  onPreviewResource: (resource: Resource) => void;
  initialMode?: 'sessional' | 'aktu';
}

export const ExamPapersModule: React.FC<ExamPapersModuleProps> = ({
  resources,
  subjects,
  branches,
  bookmarkedIds,
  onToggleBookmark,
  onPreviewResource,
  initialMode = 'sessional',
}) => {
  const [activeTab, setActiveTab] = useState<'sessional' | 'aktu'>(initialMode);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  const [onlySolved, setOnlySolved] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const papers = resources.filter(r =>
    activeTab === 'sessional' ? r.type === 'sessional' : r.type === 'aktu_pyq'
  );

  const filteredPapers = papers.filter(p => {
    if (selectedSubjectId !== 'all' && p.subjectId !== selectedSubjectId) return false;
    if (selectedYear !== 'all' && p.academicYear !== selectedYear) return false;
    if (selectedExamType !== 'all' && p.examType !== selectedExamType) return false;
    if (onlySolved && !p.hasSolution) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchYear = p.academicYear?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchYear) return false;
    }
    return true;
  });

  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  // Available academic years in the archive
  const years = Array.from(
    new Set(
      resources
        .filter(r => (activeTab === 'sessional' ? r.type === 'sessional' : r.type === 'aktu_pyq'))
        .map(r => r.academicYear)
        .filter(Boolean)
    )
  );

  const handleDownload = async (paper: Resource) => {
    try {
      await api.trackDownload(paper.id);
      if (paper.fileUrl) {
        const link = document.createElement('a');
        link.href = paper.fileUrl;
        link.download = paper.fileName || `${paper.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const cleanContent = `CAMPUS STUDY HUB - UGI EXAMINATION ARCHIVE\n\nTitle: ${paper.title}\nSession/Year: ${paper.academicYear || '2023-2024'}\nExam Type: ${paper.examType || 'Examination Paper'}\nUploaded By: ${paper.uploadedBy.name}\n\nDescription:\n${paper.description}\n\n[Official College Verified Paper Archive]`;
        const blob = new Blob([cleanContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${paper.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Exam_Paper.txt`;
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
      {/* Module Navigation Tabs */}
      <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-bloodstone mb-1">
              {activeTab === 'sessional' ? (
                <FileCheck2 className="w-4 h-4" />
              ) : (
                <GraduationCap className="w-4 h-4" />
              )}
              <span>EXAMINATION ARCHIVE & SOLUTIONS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal">
              {activeTab === 'sessional'
                ? 'UGI Departmental Sessional Papers'
                : 'AKTU Previous-Year Question Papers (PYQs)'}
            </h1>
            <p className="text-xs text-charcoal/70 mt-1 max-w-xl">
              {activeTab === 'sessional'
                ? 'Official college question papers for Sessional 1, Sessional 2, and PUT with faculty verified step-by-step solution keys.'
                : 'Official Dr. A.P.J. Abdul Kalam Technical University end-semester question papers with topic tagging and solutions.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#FAF4E5] p-1 rounded-xl border border-[#E8D9B8] text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('sessional');
                setSelectedExamType('all');
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'sessional'
                  ? 'bg-bloodstone text-warm-white shadow-xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              UGI Sessional Papers
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('aktu');
                setSelectedExamType('all');
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'aktu'
                  ? 'bg-bloodstone text-warm-white shadow-xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              AKTU PYQ Repository
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-4 border-t border-[#E8D9B8]/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal/50 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF4E5]/40 border border-[#E8D9B8] focus:border-bloodstone rounded-xl text-xs text-charcoal"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="bg-[#FAF4E5] border border-[#E8D9B8] text-xs font-medium rounded-xl px-3 py-2 text-charcoal"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name.slice(0, 20)}...
              </option>
            ))}
          </select>

          {/* Academic Year */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="bg-[#FAF4E5] border border-[#E8D9B8] text-xs font-medium rounded-xl px-3 py-2 text-charcoal"
          >
            <option value="all">All Academic Years</option>
            {years.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Exam Type (if sessional) / Solved toggle */}
          {activeTab === 'sessional' ? (
            <select
              value={selectedExamType}
              onChange={e => setSelectedExamType(e.target.value)}
              className="bg-[#FAF4E5] border border-[#E8D9B8] text-xs font-medium rounded-xl px-3 py-2 text-charcoal"
            >
              <option value="all">All Sessional Types</option>
              <option value="Sessional 1">Sessional 1</option>
              <option value="Sessional 2">Sessional 2</option>
              <option value="Pre-University (PUT)">Pre-University (PUT)</option>
            </select>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2 bg-[#FAF4E5] border border-[#E8D9B8] rounded-xl text-xs text-charcoal cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlySolved}
                onChange={e => setOnlySolved(e.target.checked)}
                className="rounded border-[#E8D9B8] text-bloodstone focus:ring-bloodstone"
              />
              <span className="font-medium">With Verified Solutions Only</span>
            </label>
          )}
        </div>
      </div>

      {/* Papers Grid */}
      {filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map(paper => {
            const sub = subjectMap.get(paper.subjectId);
            const isSaved = bookmarkedIds.has(paper.id);

            return (
              <div
                key={paper.id}
                className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between text-[11px] text-charcoal/60">
                    <span className="font-mono font-semibold text-bloodstone bg-vanilla/50 px-2 py-0.5 rounded border border-vanilla-dark">
                      {sub?.code || 'UGI'}
                    </span>
                    <span className="font-mono font-bold text-charcoal/80">
                      {paper.academicYear}
                    </span>
                  </div>

                  {/* Title & Exam Type */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-bloodstone block mb-1">
                      {paper.examType || (activeTab === 'sessional' ? 'Sessional Exam' : 'AKTU End Sem')}
                    </span>
                    <h3
                      onClick={() => onPreviewResource(paper)}
                      className="text-sm sm:text-base font-semibold text-charcoal group-hover:text-bloodstone transition-colors leading-snug cursor-pointer line-clamp-2"
                    >
                      {paper.title}
                    </h3>
                  </div>

                  <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                    {paper.description}
                  </p>

                  {/* Verification & Solution Status */}
                  <div className="pt-2 border-t border-[#E8D9B8]/50 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{paper.isVerifiedCollegePaper ? 'College Verified' : 'Student Copy'}</span>
                    </div>

                    {paper.hasSolution && (
                      <span className="text-bloodstone font-bold text-[10px] uppercase tracking-wider bg-bloodstone/10 px-2 py-0.5 rounded">
                        ✓ Solved Key
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-[#E8D9B8]/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(paper.id)}
                    title={isSaved ? 'Remove from Saved' : 'Save Paper'}
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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(paper)}
                      title="Download PDF"
                      className="p-2 text-charcoal/70 hover:text-bloodstone hover:bg-vanilla/40 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onPreviewResource(paper)}
                      className="px-3.5 py-1.5 bg-bloodstone hover:bg-bloodstone-hover text-warm-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      View Paper & Solution
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-warm-white border border-[#E8D9B8] rounded-2xl text-center space-y-3">
          <FileCheck2 className="w-8 h-8 text-charcoal/40 mx-auto" />
          <h3 className="font-semibold text-charcoal text-sm">No examination papers found</h3>
          <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
            Try resetting your filters or selecting another academic year.
          </p>
        </div>
      )}
    </div>
  );
};
