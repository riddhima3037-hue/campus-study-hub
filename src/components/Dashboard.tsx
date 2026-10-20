import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  FileCheck2,
  GraduationCap,
  Bookmark,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { User, Resource, Subject, TopicProgress } from '../types';

interface DashboardProps {
  user: User;
  subjects: Subject[];
  resources: Resource[];
  recentViews: { resource: Resource; viewedAt: string }[];
  progress: TopicProgress[];
  onSelectNav: (nav: string, extraId?: string) => void;
  onOpenSearch: () => void;
  onPreviewResource: (resource: Resource) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  subjects,
  resources,
  recentViews,
  progress,
  onSelectNav,
  onOpenSearch,
  onPreviewResource,
}) => {
  const [recentFilter, setRecentFilter] = useState<'all' | 'semester'>('all');

  const userSemester = user.semester || 1;
  const semSubjects = subjects.filter(s => s.semester === userSemester);
  const semResources = resources.filter(r => r.semester === userSemester);

  // Filter recently added published notes & resources (sorted by date)
  const displayPool = recentFilter === 'semester' ? semResources : resources;
  const recentlyAdded = [...displayPool]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 5);

  const completedCount = progress.length;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcoming Academic Hero Section */}
      <div className="bg-gradient-to-r from-vanilla-light via-[#FAF4E5] to-vanilla border border-[#E8D9B8] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-bloodstone font-semibold">
              <span className="w-2 h-2 rounded-full bg-bloodstone"></span>
              <span>ACADEMIC SEMESTER {userSemester}</span>
              <span aria-hidden="true">·</span>
              <span className="uppercase text-charcoal/70">{user.department || 'Engineering'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-charcoal leading-tight">
              Welcome back, <span className="text-bloodstone">{user.name}</span>
            </h1>

            <p className="text-sm text-charcoal/80 max-w-xl">
              “Missed a Class? Never Miss a Concept.” Access your department's verified class notes,
              curated YouTube lectures, and AKTU previous year question papers.
            </p>

            {user.collegeId && (
              <div className="inline-flex items-center gap-2 text-xs font-mono text-bloodstone bg-warm-white/80 px-2.5 py-1 rounded-md border border-[#E8D9B8]">
                <span>Verified Roll No:</span>
                <span className="font-bold">{user.collegeId}</span>
              </div>
            )}
          </div>

          {/* Quick Learning Stats Box */}
          <div className="flex sm:flex-row md:flex-col gap-3 shrink-0 bg-warm-white/80 p-4 rounded-xl border border-[#E8D9B8] text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-bloodstone/10 text-bloodstone flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-charcoal/60 text-[11px]">Enrolled Subjects</p>
                <p className="font-bold font-mono text-charcoal text-base">
                  {semSubjects.length || 5} Subjects
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:border-t md:border-[#E8D9B8]/60">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-charcoal/60 text-[11px]">Topics Mastered</p>
                <p className="font-bold font-mono text-charcoal text-base">
                  {completedCount} Completed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-4 py-3 bg-warm-white hover:bg-warm-white/90 border border-[#E8D9B8] rounded-xl text-sm text-charcoal/60 shadow-xs transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-bloodstone" />
              <span>
                Search for “Matrices notes”, “Inverse Gauss Jordan”, “C recursion”, “AKTU PYQ
                2024”...
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-vanilla/60 text-[11px] font-mono text-charcoal/80 rounded border border-[#E8D9B8]">
              Press / to search
            </span>
          </button>
        </div>
      </div>

      {/* 6 Prominent Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-charcoal flex items-center gap-2">
            <span>Academic Study Modules</span>
          </h2>
          <span className="text-xs text-charcoal/60">Core student modules</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {/* 1. My Subjects */}
          <button
            type="button"
            onClick={() => onSelectNav('subjects')}
            className="group p-5 bg-warm-white hover:bg-vanilla-light border border-[#E8D9B8] rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-bloodstone text-warm-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-charcoal text-sm sm:text-base group-hover:text-bloodstone transition-colors">
                My Subjects
              </h3>
              <p className="text-xs text-charcoal/70 mt-1 leading-snug">
                Unit-wise syllabus breakdown, chapters, and topic tracking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8D9B8]/50 flex items-center justify-between text-xs font-medium text-bloodstone">
              <span>{semSubjects.length} Courses</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. Teacher Notes */}
          <button
            type="button"
            onClick={() => onSelectNav('notes')}
            className="group p-5 bg-warm-white hover:bg-vanilla-light border border-[#E8D9B8] rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-bloodstone text-warm-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-charcoal text-sm sm:text-base group-hover:text-bloodstone transition-colors">
                Teacher Notes
              </h3>
              <p className="text-xs text-charcoal/70 mt-1 leading-snug">
                Faculty lecture slides, handwritten derivations & PDF downloads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8D9B8]/50 flex items-center justify-between text-xs font-medium text-bloodstone">
              <span>PDF Reader</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 3. Video Lectures */}
          <button
            type="button"
            onClick={() => onSelectNav('videos')}
            className="group p-5 bg-warm-white hover:bg-vanilla-light border border-[#E8D9B8] rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-bloodstone text-warm-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-charcoal text-sm sm:text-base group-hover:text-bloodstone transition-colors">
                Video Lectures
              </h3>
              <p className="text-xs text-charcoal/70 mt-1 leading-snug">
                Curated YouTube videos matched topic-by-topic to your syllabus.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8D9B8]/50 flex items-center justify-between text-xs font-medium text-bloodstone">
              <span>Topic-wise</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 4. Sessional Papers */}
          <button
            type="button"
            onClick={() => onSelectNav('papers', 'sessional')}
            className="group p-5 bg-warm-white hover:bg-vanilla-light border border-[#E8D9B8] rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-bloodstone text-warm-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-charcoal text-sm sm:text-base group-hover:text-bloodstone transition-colors">
                Sessional Papers
              </h3>
              <p className="text-xs text-charcoal/70 mt-1 leading-snug">
                Official Sessional 1, Sessional 2 & PUT exams with solution keys.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8D9B8]/50 flex items-center justify-between text-xs font-medium text-bloodstone">
              <span>Verified Solutions</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 5. AKTU PYQs */}
          <button
            type="button"
            onClick={() => onSelectNav('papers', 'aktu')}
            className="group p-5 bg-warm-white hover:bg-vanilla-light border border-[#E8D9B8] rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-bloodstone text-warm-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-charcoal text-sm sm:text-base group-hover:text-bloodstone transition-colors">
                AKTU PYQs
              </h3>
              <p className="text-xs text-charcoal/70 mt-1 leading-snug">
                Past 5-year university exam papers tagged by syllabus units.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8D9B8]/50 flex items-center justify-between text-xs font-medium text-bloodstone">
              <span>2020–2024 Archive</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 6. Saved Resources */}
          <button
            type="button"
            onClick={() => onSelectNav('saved')}
            className="group p-5 bg-warm-white hover:bg-vanilla-light border border-[#E8D9B8] rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-bloodstone text-warm-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-charcoal text-sm sm:text-base group-hover:text-bloodstone transition-colors">
                Saved Resources
              </h3>
              <p className="text-xs text-charcoal/70 mt-1 leading-snug">
                Bookmarked PDFs, favorite lecture videos, and topic progress.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8D9B8]/50 flex items-center justify-between text-xs font-medium text-bloodstone">
              <span>Study List</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Continue Learning / Recent Views vs Recently Added Material */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Continue Learning & Recently Viewed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-charcoal flex items-center gap-2">
              <Clock className="w-4 h-4 text-bloodstone" />
              <span>Recently Viewed Resources</span>
            </h2>
            <button
              type="button"
              onClick={() => onSelectNav('saved')}
              className="text-xs text-bloodstone hover:underline font-medium"
            >
              View All History
            </button>
          </div>

          {recentViews.length > 0 ? (
            <div className="space-y-3">
              {recentViews.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onPreviewResource(item.resource)}
                  className="p-3.5 bg-warm-white hover:bg-vanilla/30 border border-[#E8D9B8] rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs"
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
                      <div className="flex items-center gap-2 text-[11px] text-charcoal/60 mt-0.5">
                        <span className="capitalize">{item.resource.type.replace('_', ' ')}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.resource.uploadedBy.name}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-charcoal/40 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-warm-white border border-[#E8D9B8] rounded-xl text-center text-xs text-charcoal/70">
              <p>No recently viewed resources yet.</p>
              <p className="mt-1">
                Explore your subjects below to start reading notes or watching lectures.
              </p>
            </div>
          )}

          {/* Quick Continue Learning Spotlight */}
          <div className="p-5 bg-[#FAF4E5] border border-[#E8D9B8] rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-bloodstone">
                Continue Learning Spotlight
              </span>
              <span className="text-[11px] text-charcoal/60">Semester {userSemester}</span>
            </div>
            <h3 className="font-semibold text-charcoal text-sm">
              Engineering Mathematics-I · Unit 1: Matrices
            </h3>
            <p className="text-xs text-charcoal/80 mt-1">
              Next recommended topic: <strong>Inverse of a Matrix via Gauss-Jordan</strong> (Repeated in AKTU 2023 & 2024).
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectNav('subjects', 'sub-math1')}
                className="px-3.5 py-1.5 bg-bloodstone text-warm-white text-xs font-semibold rounded-lg hover:bg-bloodstone-hover transition-colors shadow-xs"
              >
                Resume Chapter
              </button>
              <button
                type="button"
                onClick={() => onSelectNav('notes')}
                className="text-xs font-medium text-charcoal/80 hover:text-bloodstone"
              >
                Browse All Notes
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recently Added Notes & Exam Papers */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-serif font-bold text-charcoal flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-bloodstone" />
                <span>Recently Added by Faculty</span>
              </h2>
              <p className="text-[11px] text-charcoal/60">Central database repository shared across all students</p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF4E5] p-1 rounded-lg border border-[#E8D9B8] text-xs">
              <button
                type="button"
                onClick={() => setRecentFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  recentFilter === 'all'
                    ? 'bg-bloodstone text-warm-white shadow-xs'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                All Common ({resources.length})
              </button>
              <button
                type="button"
                onClick={() => setRecentFilter('semester')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  recentFilter === 'semester'
                    ? 'bg-bloodstone text-warm-white shadow-xs'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                Sem {userSemester} ({semResources.length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recentlyAdded.map(res => (
              <div
                key={res.id}
                onClick={() => onPreviewResource(res)}
                className="p-4 bg-warm-white hover:bg-vanilla/30 border border-[#E8D9B8] rounded-xl flex items-start justify-between gap-3 cursor-pointer transition-all shadow-xs group"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-charcoal/60 flex-wrap">
                    <span className="font-medium text-bloodstone uppercase">
                      {res.type.replace('_', ' ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="bg-[#FAF4E5] text-bloodstone px-1.5 py-0.5 rounded text-[10px] font-semibold border border-[#E8D9B8]">
                      Sem {res.semester}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Uploaded {res.uploadDate}</span>
                    {res.hasSolution && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-800 font-semibold">Verified Solution</span>
                      </>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-charcoal group-hover:text-bloodstone transition-colors line-clamp-1">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-charcoal/70 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                  <div className="text-[10px] text-charcoal/60 pt-1 flex items-center gap-2">
                    <span>By {res.uploadedBy.name}</span>
                    {res.fileSize && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{res.fileSize}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-vanilla/40 text-bloodstone group-hover:bg-bloodstone group-hover:text-warm-white transition-colors shrink-0 mt-1">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
