import React, { useState } from 'react';
import { User } from '../types';
import { Search, LogOut, ShieldCheck, User as UserIcon, Bell, Sparkles, HelpCircle, Smartphone } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  onOpenUgiModal: () => void;
  notificationCount?: number;
  onOpenNotifications: () => void;
  onOpenChat: () => void;
  onOpenAppInfo: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onSelectTab,
  onOpenSearch,
  onLogout,
  onOpenUgiModal,
  notificationCount = 0,
  onOpenNotifications,
  onOpenChat,
  onOpenAppInfo,
  onInstallPwa,
  canInstallPwa = false,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-warm-white/95 backdrop-blur-md border-b border-[#E8D9B8] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single element text wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <img
              src="/logo.jpeg"
              alt="Campus Study Hub Logo"
              className="w-10 h-10 rounded-xl shadow-xs border border-[#E8D9B8] group-hover:scale-105 transition-transform object-contain"
            />
            <div>
              <span className="text-lg font-serif font-bold tracking-tight text-bloodstone whitespace-nowrap block leading-tight">
                Campus Study Hub
              </span>
              <span className="text-[10px] uppercase tracking-wider text-charcoal/60 font-medium block">
                UGI Academic Portal
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4–5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-charcoal/80">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'dashboard'
                ? 'text-bloodstone font-semibold border-b-2 border-bloodstone'
                : 'hover:text-bloodstone'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('subjects')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'subjects'
                ? 'text-bloodstone font-semibold border-b-2 border-bloodstone'
                : 'hover:text-bloodstone'
            }`}
          >
            Subjects
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('notes')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'notes'
                ? 'text-bloodstone font-semibold border-b-2 border-bloodstone'
                : 'hover:text-bloodstone'
            }`}
          >
            Teacher Notes
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('videos')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'videos'
                ? 'text-bloodstone font-semibold border-b-2 border-bloodstone'
                : 'hover:text-bloodstone'
            }`}
          >
            Video Lectures
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('papers')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'papers'
                ? 'text-bloodstone font-semibold border-b-2 border-bloodstone'
                : 'hover:text-bloodstone'
            }`}
          >
            Exam Papers & PYQs
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('saved')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'saved'
                ? 'text-bloodstone font-semibold border-b-2 border-bloodstone'
                : 'hover:text-bloodstone'
            }`}
          >
            Saved Resources
          </button>
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button
              type="button"
              onClick={() => onSelectTab('admin')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1 ${
                activeTab === 'admin'
                  ? 'text-bloodstone font-semibold border-b-2 border-bloodstone'
                  : 'text-bloodstone/90 hover:text-bloodstone font-medium'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Faculty Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action Area */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* App Guide & Architecture Info */}
          <button
            type="button"
            onClick={onOpenAppInfo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-vanilla/40 hover:bg-vanilla/70 border border-[#E8D9B8] rounded-lg text-xs font-semibold text-charcoal/80 transition-colors"
            title="App Languages, Architecture, Logo & Deployment Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-bloodstone" />
            <span className="hidden sm:inline">App Guide</span>
          </button>

          {/* In-App PWA Install Prompt */}
          {canInstallPwa && onInstallPwa && (
            <button
              type="button"
              onClick={onInstallPwa}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-bloodstone text-warm-white rounded-lg text-xs font-semibold hover:bg-bloodstone-hover transition-colors shadow-xs"
              title="Install Campus Study Hub on Desktop or Phone"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* AI Study Bot Trigger */}
          <button
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bloodstone/10 hover:bg-bloodstone/20 text-bloodstone border border-bloodstone/20 rounded-lg text-xs font-semibold transition-colors"
            title="Ask Campus Study AI (Gemini 3.8/4)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-vanilla/40 hover:bg-vanilla/70 border border-[#E8D9B8] rounded-lg text-xs text-charcoal/70 transition-colors"
            title="Global Academic Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-bloodstone" />
            <span className="hidden sm:inline">Search notes, lectures...</span>
            <kbd className="hidden sm:inline-block px-1 bg-warm-white border border-[#E8D9B8] rounded text-[10px] font-mono">
              /
            </kbd>
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 text-charcoal/70 hover:text-bloodstone hover:bg-vanilla/40 rounded-lg transition-colors"
            title="Academic Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-bloodstone"></span>
            )}
          </button>

          {/* User Profile / Account */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E8D9B8] hover:bg-vanilla/30 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-bloodstone/10 text-bloodstone flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="text-xs font-semibold text-charcoal block leading-none truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-bloodstone font-medium uppercase tracking-wider block mt-0.5">
                    {user.role}
                  </span>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-warm-white border border-[#E8D9B8] rounded-xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[#E8D9B8]/60">
                    <p className="font-semibold text-charcoal">{user.name}</p>
                    <p className="text-charcoal/60 text-[11px] truncate">{user.email}</p>
                    {user.collegeId && (
                      <p className="font-mono text-[11px] text-bloodstone mt-1">ID: {user.collegeId}</p>
                    )}
                    {user.department && (
                      <p className="text-[11px] text-charcoal/70 mt-0.5">{user.department}</p>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenAppInfo();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-vanilla/40 text-charcoal flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4 text-bloodstone" />
                      <span>App Info & Architecture Guide</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenUgiModal();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-vanilla/40 text-charcoal flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-bloodstone" />
                      <span>UGI Integration Status</span>
                    </button>
                    {(user.role === 'admin' || user.role === 'teacher') && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onSelectTab('admin');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-vanilla/40 text-charcoal flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-bloodstone" />
                        <span>Admin Console</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#E8D9B8]/60 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-bloodstone/10 text-bloodstone flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelectTab('login')}
              className="px-4 py-2 text-xs font-semibold text-warm-white bg-bloodstone hover:bg-bloodstone-hover rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Student Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
