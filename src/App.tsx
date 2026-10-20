import React, { useState, useEffect } from 'react';
import { User, Resource, Branch, Semester, Subject, Unit, Chapter, Topic, NotificationItem, TopicProgress } from './types';
import { api, getStoredUser, clearStoredSession } from './services/api';

import { Sparkles } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { AcademicExplorer } from './components/AcademicExplorer';
import { TeacherNotesLibrary } from './components/TeacherNotesLibrary';
import { VideoLibrary } from './components/VideoLibrary';
import { ExamPapersModule } from './components/ExamPapersModule';
import { SavedResourcesView } from './components/SavedResourcesView';
import { AdminDashboard } from './components/AdminDashboard';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ReportModal } from './components/ReportModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationsModal } from './components/NotificationsModal';
import { UgiIntegrationModal } from './components/UgiIntegrationModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AppInfoModal } from './components/AppInfoModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Academic Repository Data
  const [branches, setBranches] = useState<Branch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  // User Interactive State
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());
  const [topicProgressList, setTopicProgressList] = useState<TopicProgress[]>([]);
  const [recentViews, setRecentViews] = useState<{ resource: Resource; viewedAt: string }[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals & Navigation Helpers
  const [previewingResource, setPreviewingResource] = useState<Resource | null>(null);
  const [reportingResource, setReportingResource] = useState<Resource | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [ugiModalOpen, setUgiModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [appInfoOpen, setAppInfoOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [initialSubjectId, setInitialSubjectId] = useState<string | undefined>(undefined);
  const [initialPapersMode, setInitialPapersMode] = useState<'sessional' | 'aktu'>('sessional');

  // Listen for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredInstallPrompt(null);
    }
  };

  // Fetch core academic data from centralized database
  const refreshCoreData = async () => {
    try {
      const [treeRes, resourcesRes, notifsRes] = await Promise.all([
        api.getAcademicTree(),
        api.getResources(),
        api.getNotifications(),
      ]);

      setBranches(treeRes.branches || []);
      setSemesters(treeRes.semesters || []);
      setSubjects(treeRes.subjects || []);
      setUnits(treeRes.units || []);
      setChapters(treeRes.chapters || []);
      setTopics(treeRes.topics || []);
      setResources(resourcesRes.resources || []);
      setNotifications(notifsRes.notifications || []);
    } catch (err) {
      console.error('Failed to load academic data from backend', err);
    }
  };

  // Fetch user personalized bookmarks, progress, and history
  const refreshUserData = async () => {
    if (!currentUser) return;
    try {
      const [bmRes, progRes, viewsRes] = await Promise.all([
        api.getBookmarks(),
        api.getProgress(),
        api.getRecentViews(),
      ]);

      setBookmarkedIds(new Set(bmRes.bookmarks.map(b => b.resourceId)));
      setTopicProgressList(progRes.progress || []);
      setCompletedTopicIds(new Set(progRes.progress.map(p => p.topicId)));
      setRecentViews(viewsRes.recentViews || []);
    } catch (err) {
      console.error('Failed to load student data', err);
    }
  };

  useEffect(() => {
    refreshCoreData();
    // Periodically sync with common centralized database so newly uploaded files appear for everyone
    const syncInterval = setInterval(() => {
      refreshCoreData();
    }, 8000);
    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshUserData();
    }
  }, [currentUser]);

  // Global keyboard shortcut for search (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !searchModalOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setSearchModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

  // Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'teacher') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleToggleBookmark = async (resourceId: string) => {
    if (!currentUser) return;
    try {
      const res = await api.toggleBookmark(resourceId);
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (res.isBookmarked) next.add(resourceId);
        else next.delete(resourceId);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  const handleToggleTopicProgress = async (topicId: string) => {
    if (!currentUser) return;
    try {
      const res = await api.toggleProgress(topicId);
      setCompletedTopicIds(prev => {
        const next = new Set(prev);
        if (res.isCompleted) next.add(topicId);
        else next.delete(topicId);
        return next;
      });
      // Refresh progress list
      const updated = await api.getProgress();
      setTopicProgressList(updated.progress);
    } catch (err) {
      console.error('Failed to toggle progress', err);
    }
  };

  const handlePreviewResource = async (resource: Resource) => {
    setPreviewingResource(resource);
    if (currentUser) {
      try {
        await api.recordView(resource.id);
        const viewsRes = await api.getRecentViews();
        setRecentViews(viewsRes.recentViews || []);
      } catch (err) {
        console.error('Failed to record view', err);
      }
    }
  };

  const handleSelectNav = (nav: string, extraId?: string) => {
    if (nav === 'subjects') {
      setInitialSubjectId(extraId);
      setActiveTab('subjects');
    } else if (nav === 'papers') {
      setInitialPapersMode(extraId === 'aktu' ? 'aktu' : 'sessional');
      setActiveTab('papers');
    } else {
      setActiveTab(nav);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not logged in, show the mandatory Student Login First Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF4E5] text-charcoal">
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onOpenUgiIntegrationInfo={() => setUgiModalOpen(true)}
        />

        {ugiModalOpen && (
          <UgiIntegrationModal onClose={() => setUgiModalOpen(false)} />
        )}
      </div>
    );
  }

  const savedResourcesList = resources.filter(r => bookmarkedIds.has(r.id));

  return (
    <div className="min-h-screen bg-warm-white text-charcoal flex flex-col justify-between selection:bg-vanilla selection:text-bloodstone">
      {/* Top Bar Header adhering strictly to Top Bar Contract */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setSearchModalOpen(true)}
        onLogout={handleLogout}
        onOpenUgiModal={() => setUgiModalOpen(true)}
        notificationCount={notifications.length}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        onOpenChat={() => setChatbotOpen(true)}
        onOpenAppInfo={() => setAppInfoOpen(true)}
        onInstallPwa={handleInstallPwa}
        canInstallPwa={!!deferredInstallPrompt}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 pb-20 md:pb-10">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={currentUser}
            subjects={subjects}
            resources={resources}
            recentViews={recentViews}
            progress={topicProgressList}
            onSelectNav={handleSelectNav}
            onOpenSearch={() => setSearchModalOpen(true)}
            onPreviewResource={handlePreviewResource}
          />
        )}

        {activeTab === 'subjects' && (
          <AcademicExplorer
            branches={branches}
            semesters={semesters}
            subjects={subjects}
            units={units}
            chapters={chapters}
            topics={topics}
            resources={resources}
            completedTopicIds={completedTopicIds}
            onToggleTopicProgress={handleToggleTopicProgress}
            onPreviewResource={handlePreviewResource}
            initialSubjectId={initialSubjectId}
          />
        )}

        {activeTab === 'notes' && (
          <TeacherNotesLibrary
            resources={resources}
            subjects={subjects}
            units={units}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onPreviewResource={handlePreviewResource}
            onOpenReport={res => setReportingResource(res)}
          />
        )}

        {activeTab === 'videos' && (
          <VideoLibrary
            resources={resources}
            subjects={subjects}
            units={units}
            topics={topics}
            onPreviewResource={handlePreviewResource}
            onOpenReport={res => setReportingResource(res)}
          />
        )}

        {activeTab === 'papers' && (
          <ExamPapersModule
            resources={resources}
            subjects={subjects}
            branches={branches}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onPreviewResource={handlePreviewResource}
            initialMode={initialPapersMode}
          />
        )}

        {activeTab === 'saved' && (
          <SavedResourcesView
            savedResources={savedResourcesList}
            recentViews={recentViews}
            progress={topicProgressList}
            subjects={subjects}
            topics={topics}
            onRemoveBookmark={handleToggleBookmark}
            onPreviewResource={handlePreviewResource}
            onToggleTopicProgress={handleToggleTopicProgress}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            user={currentUser}
            subjects={subjects}
            units={units}
            chapters={chapters}
            topics={topics}
            resources={resources}
            onRefreshData={refreshCoreData}
            onCloseAdmin={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={currentUser}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Modals & Overlays */}
      {previewingResource && (
        <PdfViewerModal
          resource={previewingResource}
          isBookmarked={bookmarkedIds.has(previewingResource.id)}
          onToggleBookmark={() => handleToggleBookmark(previewingResource.id)}
          onClose={() => setPreviewingResource(null)}
          onOpenReport={() => {
            const target = previewingResource;
            setPreviewingResource(null);
            setReportingResource(target);
          }}
        />
      )}

      {reportingResource && (
        <ReportModal
          resource={reportingResource}
          onClose={() => setReportingResource(null)}
        />
      )}

      {searchModalOpen && (
        <GlobalSearchModal
          resources={resources}
          subjects={subjects}
          topics={topics}
          onClose={() => setSearchModalOpen(false)}
          onSelectResource={res => {
            setSearchModalOpen(false);
            handlePreviewResource(res);
          }}
          onSelectSubject={subId => {
            setSearchModalOpen(false);
            handleSelectNav('subjects', subId);
          }}
        />
      )}

      {notificationsModalOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setNotificationsModalOpen(false)}
          onNavigate={tab => {
            setNotificationsModalOpen(false);
            setActiveTab(tab);
          }}
        />
      )}

      {ugiModalOpen && (
        <UgiIntegrationModal onClose={() => setUgiModalOpen(false)} />
      )}

      {profileModalOpen && (
        <StudentProfileModal
          user={currentUser}
          onClose={() => setProfileModalOpen(false)}
          onLogout={handleLogout}
          onOpenUgiModal={() => {
            setProfileModalOpen(false);
            setUgiModalOpen(true);
          }}
        />
      )}

      {/* Floating Gemini AI Study Companion Button */}
      <button
        type="button"
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-5 z-40 px-3.5 py-2.5 bg-bloodstone text-warm-white rounded-full shadow-2xl hover:bg-bloodstone-hover hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-semibold text-xs border border-vanilla/60 group"
        title="Ask Campus Study AI (Gemini 3.8/4)"
      >
        <div className="w-5 h-5 rounded-full bg-vanilla text-bloodstone flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-bloodstone" />
        </div>
        <span className="hidden sm:inline">Ask Campus AI</span>
      </button>

      {/* Multi-turn Gemini AI Chatbot Modal */}
      <GeminiChatbot
        user={currentUser}
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />

      {/* App Architecture, Deployment, Logo & Native App Guide Modal */}
      <AppInfoModal
        isOpen={appInfoOpen}
        onClose={() => setAppInfoOpen(false)}
        onInstallPwa={handleInstallPwa}
        canInstallPwa={!!deferredInstallPrompt}
      />
    </div>
  );
}
