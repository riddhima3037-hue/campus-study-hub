import React, { useState } from 'react';
import { Resource, Subject, Topic, TopicProgress } from '../types';
import {
  Bookmark,
  Clock,
  CheckCircle2,
  FileText,
  Video,
  FileCheck2,
  GraduationCap,
  Trash2,
  ExternalLink,
  Download,
  BookOpen,
} from 'lucide-react';

interface SavedResourcesViewProps {
  savedResources: Resource[];
  recentViews: { resource: Resource; viewedAt: string }[];
  progress: TopicProgress[];
  subjects: Subject[];
  topics: Topic[];
  onRemoveBookmark: (resourceId: string) => void;
  onPreviewResource: (resource: Resource) => void;
  onToggleTopicProgress: (topicId: string) => void;
}

export const SavedResourcesView: React.FC<SavedResourcesViewProps> = ({
  savedResources,
  recentViews,
  progress,
  subjects,
  topics,
  onRemoveBookmark,
  onPreviewResource,
  onToggleTopicProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'history' | 'progress'>('saved');

  const completedTopicIdSet = new Set(progress.map(p => p.topicId));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-bloodstone mb-1">
              <Bookmark className="w-4 h-4" />
              <span>STUDY TRACKER</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal">
              Saved Resources & Progress
            </h1>
            <p className="text-xs text-charcoal/70 mt-1 max-w-xl">
              Quickly retrieve your saved lecture notes, revision bookmarks, recent history, and
              curriculum topic completion stats.
            </p>
          </div>

          {/* Tab Pill Buttons */}
          <div className="flex items-center bg-[#FAF4E5] p-1 rounded-xl border border-[#E8D9B8] text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'saved'
                  ? 'bg-bloodstone text-warm-white shadow-xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Saved ({savedResources.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-bloodstone text-warm-white shadow-xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Recent History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'progress'
                  ? 'bg-bloodstone text-warm-white shadow-xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Topic Progress
            </button>
          </div>
        </div>
      </div>

      {/* 1. Saved Bookmarks Tab */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedResources.map(res => (
                <div
                  key={res.id}
                  className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-charcoal/60">
                      <span className="font-semibold uppercase text-bloodstone">
                        {res.type.replace('_', ' ')}
                      </span>
                      <span>Uploaded {res.uploadDate}</span>
                    </div>

                    <h3
                      onClick={() => onPreviewResource(res)}
                      className="text-sm font-semibold text-charcoal hover:text-bloodstone transition-colors leading-snug cursor-pointer line-clamp-2"
                    >
                      {res.title}
                    </h3>

                    <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>

                    <div className="text-[11px] text-charcoal/60 pt-1">
                      <span>By {res.uploadedBy.name}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E8D9B8]/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(res.id)}
                      className="text-xs text-bloodstone hover:text-bloodstone-hover flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onPreviewResource(res)}
                      className="px-3.5 py-1.5 bg-bloodstone text-warm-white text-xs font-semibold rounded-lg hover:bg-bloodstone-hover transition-colors shadow-xs"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-warm-white border border-[#E8D9B8] rounded-2xl text-center space-y-3">
              <Bookmark className="w-8 h-8 text-charcoal/40 mx-auto" />
              <h3 className="font-semibold text-charcoal text-sm">No saved bookmarks yet</h3>
              <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
                While studying, click the bookmark icon on any teacher note or examination paper to
                save it here for quick offline reference.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. History Tab */}
      {activeTab === 'history' && (
        <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-charcoal flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-bloodstone" />
            <span>Recently Opened Items</span>
          </h2>

          {recentViews.length > 0 ? (
            <div className="divide-y divide-[#E8D9B8]/50">
              {recentViews.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onPreviewResource(item.resource)}
                  className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-vanilla/20 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-vanilla text-bloodstone flex items-center justify-center shrink-0">
                      {item.resource.type === 'notes' ? (
                        <FileText className="w-4 h-4" />
                      ) : item.resource.type === 'video' ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <FileCheck2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-charcoal truncate">
                        {item.resource.title}
                      </p>
                      <p className="text-[11px] text-charcoal/60">
                        {item.resource.uploadedBy.name} · Viewed on{' '}
                        {new Date(item.viewedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-bloodstone hover:underline shrink-0">
                    Open Again →
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-charcoal/60">
              No recent reading history recorded yet.
            </div>
          )}
        </div>
      )}

      {/* 3. Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-serif font-bold text-charcoal mb-4">
              Curriculum Mastery by Subject
            </h2>

            <div className="space-y-5">
              {subjects.map(sub => {
                const subTopics = topics.filter(t => t.subjectId === sub.id);
                const completed = subTopics.filter(t => completedTopicIdSet.has(t.id));
                const pct =
                  subTopics.length > 0 ? Math.round((completed.length / subTopics.length) * 100) : 0;

                return (
                  <div key={sub.id} className="p-4 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-bloodstone mr-2">{sub.code}</span>
                        <span className="font-semibold text-charcoal">{sub.name}</span>
                      </div>
                      <span className="font-mono font-bold text-charcoal">
                        {completed.length} / {subTopics.length} Topics ({pct}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#E8D9B8]/40 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-bloodstone h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
