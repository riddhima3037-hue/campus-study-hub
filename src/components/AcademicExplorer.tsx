import React, { useState } from 'react';
import {
  Branch,
  Semester,
  Subject,
  Unit,
  Chapter,
  Topic,
  Resource,
} from '../types';
import {
  BookOpen,
  ChevronRight,
  FileText,
  Video,
  FileCheck2,
  CheckCircle,
  Circle,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowLeft,
  ExternalLink,
  Download,
} from 'lucide-react';

interface AcademicExplorerProps {
  branches: Branch[];
  semesters: Semester[];
  subjects: Subject[];
  units: Unit[];
  chapters: Chapter[];
  topics: Topic[];
  resources: Resource[];
  completedTopicIds: Set<string>;
  onToggleTopicProgress: (topicId: string) => void;
  onPreviewResource: (resource: Resource) => void;
  initialSubjectId?: string;
}

export const AcademicExplorer: React.FC<AcademicExplorerProps> = ({
  branches,
  semesters,
  subjects,
  units,
  chapters,
  topics,
  resources,
  completedTopicIds,
  onToggleTopicProgress,
  onPreviewResource,
  initialSubjectId,
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('cse');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(initialSubjectId || null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Filter subjects for active branch and semester
  const filteredSubjects = subjects.filter(
    s => s.branchId === selectedBranchId && s.semester === selectedSemester
  );

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);
  const activeUnits = units.filter(u => u.subjectId === selectedSubjectId);
  const activeUnit = units.find(u => u.id === selectedUnitId) || activeUnits[0];

  const activeChapters = chapters.filter(c => c.unitId === (activeUnit?.id || ''));
  const activeTopics = topics.filter(t => t.unitId === (activeUnit?.id || ''));
  const activeTopic = topics.find(t => t.id === selectedTopicId) || activeTopics[0];

  // Resources linked to the active topic or active unit
  const topicResources = resources.filter(
    r =>
      (selectedTopicId && r.topicId === selectedTopicId) ||
      (selectedUnitId && r.unitId === selectedUnitId && !r.topicId) ||
      (selectedSubjectId && r.subjectId === selectedSubjectId && !r.unitId)
  );

  const topicNotes = topicResources.filter(r => r.type === 'notes');
  const topicVideos = topicResources.filter(r => r.type === 'video');
  const topicPapers = topicResources.filter(r => r.type === 'sessional' || r.type === 'aktu_pyq');

  const activeBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Academic Breadcrumb & Filter Bar */}
      <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Breadcrumb Hierarchy */}
          <div className="flex items-center gap-1.5 text-xs text-charcoal/70 flex-wrap">
            <span className="font-semibold text-bloodstone">UGI College</span>
            <ChevronRight className="w-3.5 h-3.5 text-charcoal/40" />
            <span className="font-medium">{activeBranch?.name || 'CSE'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-charcoal/40" />
            <span className="font-medium">Semester {selectedSemester}</span>
            {activeSubject && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-charcoal/40" />
                <span className="font-semibold text-charcoal">{activeSubject.code}</span>
              </>
            )}
            {activeTopic && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-charcoal/40" />
                <span className="text-bloodstone font-medium truncate max-w-[180px]">
                  {activeTopic.title}
                </span>
              </>
            )}
          </div>

          {/* Branch & Semester Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={selectedBranchId}
              onChange={e => {
                setSelectedBranchId(e.target.value);
                setSelectedSubjectId(null);
                setSelectedTopicId(null);
              }}
              className="bg-[#FAF4E5] border border-[#E8D9B8] text-xs font-semibold rounded-lg px-2.5 py-1.5 text-charcoal focus:ring-1 focus:ring-bloodstone"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.code} ({b.name})
                </option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={e => {
                setSelectedSemester(Number(e.target.value));
                setSelectedSubjectId(null);
                setSelectedTopicId(null);
              }}
              className="bg-[#FAF4E5] border border-[#E8D9B8] text-xs font-semibold rounded-lg px-2.5 py-1.5 text-charcoal focus:ring-1 focus:ring-bloodstone"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main View: If No Subject Selected -> Show Subject Grid */}
      {!selectedSubjectId ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-charcoal">
              Semester {selectedSemester} Subjects
            </h2>
            <span className="text-xs text-charcoal/60">
              {filteredSubjects.length} Courses in curriculum
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubjects.map(sub => {
              const subUnits = units.filter(u => u.subjectId === sub.id);
              const subResources = resources.filter(r => r.subjectId === sub.id);
              const subTopics = topics.filter(t => t.subjectId === sub.id);
              const completedInSub = subTopics.filter(t => completedTopicIds.has(t.id)).length;
              const progressPct =
                subTopics.length > 0 ? Math.round((completedInSub / subTopics.length) * 100) : 0;

              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    const firstUnit = units.find(u => u.subjectId === sub.id);
                    if (firstUnit) setSelectedUnitId(firstUnit.id);
                  }}
                  className="bg-warm-white hover:bg-vanilla-light/40 border border-[#E8D9B8] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-vanilla text-bloodstone border border-vanilla-dark">
                        {sub.code}
                      </span>
                      <span className="text-xs text-charcoal/60">{sub.creditHours || 4} Credits</span>
                    </div>

                    <h3 className="text-base font-semibold text-charcoal group-hover:text-bloodstone transition-colors leading-snug">
                      {sub.name}
                    </h3>

                    <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                      {sub.description || 'Comprehensive curriculum units, notes, and lectures.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E8D9B8]/60 space-y-2">
                    <div className="flex items-center justify-between text-xs text-charcoal/70">
                      <span>{subUnits.length || 5} Units</span>
                      <span>{subResources.length} Resources</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E8D9B8]/40 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-bloodstone h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Detailed Subject View: Unit Navigation & Topic Study Hub */
        <div className="space-y-6">
          {/* Back Button & Subject Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setSelectedSubjectId(null);
                setSelectedTopicId(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-bloodstone hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Subjects</span>
            </button>
            <span className="font-mono text-xs font-bold text-bloodstone px-2.5 py-1 bg-vanilla rounded-lg border border-vanilla-dark">
              {activeSubject?.code}
            </span>
          </div>

          <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xs">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal">
              {activeSubject?.name}
            </h1>
            <p className="text-xs text-charcoal/70 mt-1 max-w-2xl">{activeSubject?.description}</p>
          </div>

          {/* Unit Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {activeUnits.map(unit => {
              const isSelected = (activeUnit?.id === unit.id);
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => {
                    setSelectedUnitId(unit.id);
                    const firstTopicInUnit = topics.find(t => t.unitId === unit.id);
                    if (firstTopicInUnit) setSelectedTopicId(firstTopicInUnit.id);
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-bloodstone text-warm-white border-bloodstone shadow-xs'
                      : 'bg-warm-white text-charcoal/80 border-[#E8D9B8] hover:bg-vanilla/40'
                  }`}
                >
                  Unit {unit.unitNumber}: {unit.title.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Layout: Sidebar with Chapters & Topics + Right Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Topics List */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-4 shadow-xs">
                <div className="border-b border-[#E8D9B8]/70 pb-3 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-bloodstone">
                    Unit {activeUnit?.unitNumber} Curriculum
                  </span>
                  <h3 className="text-sm font-bold text-charcoal mt-0.5">{activeUnit?.title}</h3>
                  <p className="text-[11px] text-charcoal/60 mt-0.5">{activeUnit?.description}</p>
                </div>

                <div className="space-y-1.5">
                  {activeTopics.length > 0 ? (
                    activeTopics.map((top, idx) => {
                      const isCompleted = completedTopicIds.has(top.id);
                      const isSelected =
                        activeTopic?.id === top.id || (!selectedTopicId && idx === 0);

                      return (
                        <div
                          key={top.id}
                          onClick={() => setSelectedTopicId(top.id)}
                          className={`p-2.5 rounded-xl text-left cursor-pointer transition-all flex items-start justify-between gap-2 border ${
                            isSelected
                              ? 'bg-vanilla/50 border-bloodstone/30 font-semibold text-charcoal'
                              : 'hover:bg-vanilla/20 border-transparent text-charcoal/80'
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                onToggleTopicProgress(top.id);
                              }}
                              className="mt-0.5 text-bloodstone hover:scale-110 transition-transform"
                              title={isCompleted ? 'Completed' : 'Mark Completed'}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-emerald-700" />
                              ) : (
                                <Circle className="w-4 h-4 text-charcoal/30" />
                              )}
                            </button>
                            <div className="min-w-0">
                              <p className="text-xs leading-snug truncate">{top.title}</p>
                              {top.isImportantForExam && (
                                <span className="text-[9px] uppercase tracking-wider font-bold text-bloodstone block mt-0.5">
                                  ★ High Exam Weightage
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-charcoal/40 shrink-0 mt-0.5" />
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-charcoal/60">
                      No topics added for this unit yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Topic Details & Resources */}
            <div className="lg:col-span-8 space-y-6">
              {activeTopic ? (
                <div className="space-y-6">
                  {/* Topic Header Card */}
                  <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-bloodstone uppercase">
                          Topic Study Hub
                        </span>
                        {activeTopic.isImportantForExam && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bloodstone/10 text-bloodstone border border-bloodstone/20">
                            AKTU Repeat Topic
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleTopicProgress(activeTopic.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          completedTopicIds.has(activeTopic.id)
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-vanilla text-bloodstone hover:bg-vanilla-dark'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>
                          {completedTopicIds.has(activeTopic.id)
                            ? 'Topic Completed'
                            : 'Mark as Completed'}
                        </span>
                      </button>
                    </div>

                    <h2 className="text-lg sm:text-xl font-serif font-bold text-charcoal">
                      {activeTopic.title}
                    </h2>
                    <p className="text-xs text-charcoal/70 mt-1 leading-relaxed">
                      {activeTopic.description}
                    </p>
                  </div>

                  {/* 1. Relevant Teacher Notes & PDFs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-serif font-bold text-charcoal flex items-center gap-2">
                        <FileText className="w-4 h-4 text-bloodstone" />
                        <span>Teacher Notes & Handwritten Scans</span>
                      </h3>
                      <span className="text-xs text-charcoal/60">{topicNotes.length} Document(s)</span>
                    </div>

                    {topicNotes.length > 0 ? (
                      <div className="space-y-2.5">
                        {topicNotes.map(note => (
                          <div
                            key={note.id}
                            className="bg-warm-white border border-[#E8D9B8] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-bloodstone/40 transition-colors shadow-xs"
                          >
                            <div className="min-w-0 space-y-1">
                              <h4 className="text-xs sm:text-sm font-semibold text-charcoal">
                                {note.title}
                              </h4>
                              <p className="text-[11px] text-charcoal/70 line-clamp-2">
                                {note.description}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-charcoal/60">
                                <span>Uploaded by {note.uploadedBy.name}</span>
                                <span aria-hidden="true">·</span>
                                <span>{note.uploadDate}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono">{note.fileSize || '1.8 MB'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => onPreviewResource(note)}
                                className="px-3.5 py-1.5 bg-bloodstone text-warm-white text-xs font-semibold rounded-lg hover:bg-bloodstone-hover transition-colors shadow-xs"
                              >
                                Preview PDF
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-warm-white border border-[#E8D9B8] rounded-xl text-xs text-charcoal/70 text-center">
                        No separate notes uploaded for this specific topic yet. General unit notes
                        apply.
                      </div>
                    )}
                  </div>

                  {/* 2. Topic YouTube Lectures */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-serif font-bold text-charcoal flex items-center gap-2">
                        <Video className="w-4 h-4 text-bloodstone" />
                        <span>Topic YouTube Video Lectures</span>
                      </h3>
                      <span className="text-xs text-charcoal/60">{topicVideos.length} Video(s)</span>
                    </div>

                    {topicVideos.length > 0 ? (
                      <div className="space-y-3">
                        {topicVideos.map(vid => (
                          <div
                            key={vid.id}
                            className="bg-warm-white border border-[#E8D9B8] rounded-xl p-4 space-y-3 shadow-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-charcoal">
                                  {vid.title}
                                </h4>
                                <p className="text-[11px] text-charcoal/60">
                                  Channel: {vid.channelName} · Duration: {vid.duration || '20 mins'}
                                </p>
                              </div>
                              <a
                                href={vid.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-bloodstone font-semibold hover:underline"
                              >
                                Open in YouTube <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* YouTube Embed Player */}
                            {vid.youtubeId && (
                              <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/90">
                                <iframe
                                  src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                                  title={vid.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full border-0"
                                />
                              </div>
                            )}

                            <p className="text-xs text-charcoal/80 leading-relaxed">
                              {vid.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-warm-white border border-[#E8D9B8] rounded-xl text-xs text-charcoal/70 text-center">
                        No video lectures mapped to this sub-topic yet.
                      </div>
                    )}
                  </div>

                  {/* 3. Related Examination Questions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-serif font-bold text-charcoal flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-bloodstone" />
                        <span>Related Sessional & AKTU PYQ Papers</span>
                      </h3>
                      <span className="text-xs text-charcoal/60">{topicPapers.length} Paper(s)</span>
                    </div>

                    {topicPapers.length > 0 ? (
                      <div className="space-y-2.5">
                        {topicPapers.map(paper => (
                          <div
                            key={paper.id}
                            className="bg-warm-white border border-[#E8D9B8] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 text-[10px] text-charcoal/60">
                                <span className="font-bold text-bloodstone uppercase">
                                  {paper.type === 'sessional' ? paper.examType : 'AKTU PYQ'}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{paper.academicYear}</span>
                                {paper.hasSolution && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="text-emerald-800 font-semibold">
                                      Solution Key Attached
                                    </span>
                                  </>
                                )}
                              </div>
                              <h4 className="text-xs sm:text-sm font-semibold text-charcoal">
                                {paper.title}
                              </h4>
                            </div>

                            <button
                              type="button"
                              onClick={() => onPreviewResource(paper)}
                              className="px-3 py-1.5 bg-vanilla text-bloodstone hover:bg-vanilla-dark text-xs font-semibold rounded-lg transition-colors shrink-0"
                            >
                              Preview Exam Paper
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-warm-white border border-[#E8D9B8] rounded-xl text-xs text-charcoal/70 text-center">
                        All question papers for this subject can be viewed in the Exam Papers tab.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-warm-white border border-[#E8D9B8] rounded-2xl text-center text-xs text-charcoal/70">
                  Select a topic from the curriculum sidebar to view notes and video masterclasses.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
