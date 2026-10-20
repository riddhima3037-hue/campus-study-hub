import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Video, FileCheck2, BookOpen, ChevronRight, Layers } from 'lucide-react';
import { Resource, Subject, Topic } from '../types';

interface GlobalSearchModalProps {
  resources: Resource[];
  subjects: Subject[];
  topics: Topic[];
  onClose: () => void;
  onSelectResource: (resource: Resource) => void;
  onSelectSubject: (subjectId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  resources,
  subjects,
  topics,
  onClose,
  onSelectResource,
  onSelectSubject,
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'notes' | 'video' | 'paper' | 'subject'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const cleanQ = query.trim().toLowerCase();

  // Search Subjects
  const matchedSubjects = !cleanQ
    ? []
    : subjects.filter(
        s =>
          s.code.toLowerCase().includes(cleanQ) ||
          s.name.toLowerCase().includes(cleanQ) ||
          s.description?.toLowerCase().includes(cleanQ)
      );

  // Search Resources
  const matchedResources = !cleanQ
    ? []
    : resources.filter(r => {
        const titleMatch = r.title.toLowerCase().includes(cleanQ);
        const descMatch = r.description.toLowerCase().includes(cleanQ);
        const tagMatch = r.tags?.some(t => t.toLowerCase().includes(cleanQ));
        const authorMatch = r.uploadedBy.name.toLowerCase().includes(cleanQ);
        const channelMatch = r.channelName?.toLowerCase().includes(cleanQ);
        const yearMatch = r.academicYear?.toLowerCase().includes(cleanQ);

        return titleMatch || descMatch || tagMatch || authorMatch || channelMatch || yearMatch;
      });

  const matchedNotes = matchedResources.filter(r => r.type === 'notes');
  const matchedVideos = matchedResources.filter(r => r.type === 'video');
  const matchedPapers = matchedResources.filter(r => r.type === 'sessional' || r.type === 'aktu_pyq');

  const totalMatches =
    matchedSubjects.length + matchedNotes.length + matchedVideos.length + matchedPapers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-charcoal/70 backdrop-blur-xs p-3 sm:p-6 pt-16 sm:pt-20">
      <div className="bg-warm-white max-w-2xl w-full rounded-2xl border border-[#E8D9B8] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 bg-[#FAF4E5] border-b border-[#E8D9B8] flex items-center gap-3">
          <Search className="w-5 h-5 text-bloodstone shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search notes, videos, AKTU papers (e.g., 'Matrix', 'Gauss Jordan', 'PYQ 2024')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-charcoal focus:outline-none placeholder:text-charcoal/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-charcoal/50 hover:text-charcoal"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal/60 hover:text-bloodstone hover:bg-vanilla/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-warm-white border-b border-[#E8D9B8]/60 flex items-center gap-2 overflow-x-auto text-[11px] text-charcoal/70 scrollbar-none">
          <span className="font-semibold text-bloodstone shrink-0">Try:</span>
          {['Matrices notes', 'Gauss Jordan lecture', 'C 2D arrays', 'AKTU Maths PYQ', 'Sessional paper'].map(
            (suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="px-2 py-0.5 rounded-md bg-[#FAF4E5] hover:bg-vanilla/50 border border-[#E8D9B8] whitespace-nowrap transition-colors"
              >
                {suggestion}
              </button>
            )
          )}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {!cleanQ ? (
            <div className="p-8 text-center text-xs text-charcoal/60">
              <Search className="w-8 h-8 text-charcoal/30 mx-auto mb-2" />
              <p>Type keywords to search across the entire college study repository.</p>
            </div>
          ) : totalMatches === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal/60">
              <p className="font-semibold text-charcoal text-sm">No results found for “{query}”</p>
              <p className="mt-1">Try searching by topic, author, or exam year (e.g., “Inverse”, “2024”).</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Matched Subjects */}
              {matchedSubjects.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-bloodstone flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Subjects ({matchedSubjects.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedSubjects.map(sub => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          onSelectSubject(sub.id);
                          onClose();
                        }}
                        className="p-3 bg-[#FAF4E5]/40 hover:bg-vanilla/30 border border-[#E8D9B8] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-charcoal">
                            {sub.code}: {sub.name}
                          </p>
                          <p className="text-[11px] text-charcoal/60 line-clamp-1">{sub.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-charcoal/40" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Teacher Notes */}
              {matchedNotes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-bloodstone flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Teacher Notes & PDFs ({matchedNotes.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedNotes.map(res => (
                      <div
                        key={res.id}
                        onClick={() => {
                          onSelectResource(res);
                          onClose();
                        }}
                        className="p-3 bg-[#FAF4E5]/40 hover:bg-vanilla/30 border border-[#E8D9B8] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-semibold text-charcoal truncate">{res.title}</p>
                          <p className="text-[11px] text-charcoal/60">
                            By {res.uploadedBy.name} · {res.fileSize || '1.8 MB'}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-bloodstone shrink-0">
                          Read PDF →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Video Lectures */}
              {matchedVideos.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-bloodstone flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Lectures ({matchedVideos.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedVideos.map(vid => (
                      <div
                        key={vid.id}
                        onClick={() => {
                          onSelectResource(vid);
                          onClose();
                        }}
                        className="p-3 bg-[#FAF4E5]/40 hover:bg-vanilla/30 border border-[#E8D9B8] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-semibold text-charcoal truncate">{vid.title}</p>
                          <p className="text-[11px] text-charcoal/60">
                            {vid.channelName} · {vid.duration || 'Video'}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-bloodstone shrink-0">
                          Watch Lecture →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Exam Papers & PYQs */}
              {matchedPapers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-bloodstone flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Sessional Papers & AKTU PYQs ({matchedPapers.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedPapers.map(paper => (
                      <div
                        key={paper.id}
                        onClick={() => {
                          onSelectResource(paper);
                          onClose();
                        }}
                        className="p-3 bg-[#FAF4E5]/40 hover:bg-vanilla/30 border border-[#E8D9B8] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-semibold text-charcoal truncate">{paper.title}</p>
                          <p className="text-[11px] text-charcoal/60">
                            {paper.academicYear} · {paper.hasSolution ? 'With Solution' : 'Question Paper'}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-bloodstone shrink-0">
                          View Paper →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
