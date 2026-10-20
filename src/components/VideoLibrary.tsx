import React, { useState } from 'react';
import { Resource, Subject, Unit, Topic } from '../types';
import {
  Video,
  Play,
  ExternalLink,
  Search,
  BookOpen,
  FileCheck2,
  Clock,
  User as UserIcon,
  X,
  FileText,
} from 'lucide-react';

interface VideoLibraryProps {
  resources: Resource[];
  subjects: Subject[];
  units: Unit[];
  topics: Topic[];
  onPreviewResource: (resource: Resource) => void;
  onOpenReport: (resource: Resource) => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({
  resources,
  subjects,
  units,
  topics,
  onPreviewResource,
  onOpenReport,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePlayingVideo, setActivePlayingVideo] = useState<Resource | null>(null);

  const videoResources = resources.filter(r => r.type === 'video');

  const filteredVideos = videoResources.filter(vid => {
    if (selectedSubjectId !== 'all' && vid.subjectId !== selectedSubjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = vid.title.toLowerCase().includes(q);
      const matchChannel = vid.channelName?.toLowerCase().includes(q);
      const matchDesc = vid.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchChannel && !matchDesc) return false;
    }
    return true;
  });

  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const topicMap = new Map(topics.map(t => [t.id, t]));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-bloodstone mb-1">
              <Video className="w-4 h-4" />
              <span>TOPIC-WISE VIDEO LECTURES</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal">
              Curated YouTube Masterclasses
            </h1>
            <p className="text-xs text-charcoal/70 mt-1 max-w-xl">
              High-yield video lectures from top verified educators (Gate Smashers, Jenny's
              Lectures, Gajendra Purohit) structured according to your university syllabus.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-bloodstone bg-[#FAF4E5] px-3 py-1.5 rounded-lg border border-[#E8D9B8] self-start sm:self-auto">
            <span>{videoResources.length} Lectures Available</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-4 border-t border-[#E8D9B8]/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal/50 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search lectures by title, channel name, or concept..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF4E5]/40 border border-[#E8D9B8] focus:border-bloodstone rounded-xl text-xs text-charcoal"
            />
          </div>

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
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(vid => {
            const sub = subjectMap.get(vid.subjectId);
            const top = vid.topicId ? topicMap.get(vid.topicId) : null;

            // Find related notes & related PYQs for this subject/topic
            const relatedNotes = resources.find(
              r => r.type === 'notes' && (r.topicId === vid.topicId || r.subjectId === vid.subjectId)
            );
            const relatedPyq = resources.find(
              r => r.type === 'aktu_pyq' && r.subjectId === vid.subjectId
            );

            return (
              <div
                key={vid.id}
                className="bg-warm-white border border-[#E8D9B8] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* YouTube Player / Thumbnail Box */}
                  <div className="relative aspect-video bg-charcoal w-full overflow-hidden">
                    {vid.youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                        title={vid.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-vanilla/20">
                        <Video className="w-10 h-10 text-charcoal/40" />
                      </div>
                    )}
                  </div>

                  {/* Video Details */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-charcoal/60">
                      <span className="font-mono font-semibold text-bloodstone bg-vanilla/50 px-2 py-0.5 rounded border border-vanilla-dark">
                        {sub?.code || 'UGI'}
                      </span>
                      {vid.duration && (
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{vid.duration}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-charcoal group-hover:text-bloodstone transition-colors leading-snug line-clamp-2">
                      {vid.title}
                    </h3>

                    <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>

                    <div className="text-[11px] text-charcoal/70 pt-1 border-t border-[#E8D9B8]/50 flex items-center justify-between">
                      <span className="font-medium text-charcoal">
                        Channel: {vid.channelName || 'Faculty Lecture'}
                      </span>
                      <span>{vid.viewsCount || 0} views</span>
                    </div>

                    {/* Related Materials Links */}
                    <div className="p-2.5 bg-[#FAF4E5]/80 rounded-xl border border-[#E8D9B8] space-y-1.5 text-[11px]">
                      <span className="font-semibold text-bloodstone uppercase tracking-wider text-[10px] block">
                        Linked Study Materials:
                      </span>

                      {relatedNotes && (
                        <button
                          type="button"
                          onClick={() => onPreviewResource(relatedNotes)}
                          className="w-full text-left text-charcoal/80 hover:text-bloodstone flex items-center gap-1.5 truncate"
                        >
                          <FileText className="w-3 h-3 text-bloodstone shrink-0" />
                          <span className="truncate">Notes: {relatedNotes.title}</span>
                        </button>
                      )}

                      {relatedPyq && (
                        <button
                          type="button"
                          onClick={() => onPreviewResource(relatedPyq)}
                          className="w-full text-left text-charcoal/80 hover:text-bloodstone flex items-center gap-1.5 truncate"
                        >
                          <FileCheck2 className="w-3 h-3 text-bloodstone shrink-0" />
                          <span className="truncate">AKTU Exam: {relatedPyq.academicYear} Paper</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer link to YouTube */}
                <div className="px-5 py-3 border-t border-[#E8D9B8]/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-charcoal/60">Verified Lecture Link</span>
                  {vid.youtubeUrl && (
                    <a
                      href={vid.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-bloodstone font-semibold hover:underline flex items-center gap-1"
                    >
                      Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-warm-white border border-[#E8D9B8] rounded-2xl text-center space-y-3">
          <Video className="w-8 h-8 text-charcoal/40 mx-auto" />
          <h3 className="font-semibold text-charcoal text-sm">No lectures found matching your search</h3>
          <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
            Try choosing a different subject or reset your search query.
          </p>
        </div>
      )}
    </div>
  );
};
