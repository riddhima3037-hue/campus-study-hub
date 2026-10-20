import React from 'react';
import { Home, BookOpen, FileCheck2, Bookmark, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  user: User | null;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  user,
  onOpenProfile,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-warm-white/95 backdrop-blur-md border-t border-[#E8D9B8] px-2 py-1.5 flex items-center justify-around shadow-lg">
      <button
        type="button"
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'dashboard' ? 'text-bloodstone font-bold' : 'text-charcoal/60'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('subjects')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'subjects' ? 'text-bloodstone font-bold' : 'text-charcoal/60'
        }`}
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        <span>Subjects</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('papers')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'papers' ? 'text-bloodstone font-bold' : 'text-charcoal/60'
        }`}
      >
        <FileCheck2 className="w-5 h-5 mb-0.5" />
        <span>Papers</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('saved')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'saved' ? 'text-bloodstone font-bold' : 'text-charcoal/60'
        }`}
      >
        <Bookmark className="w-5 h-5 mb-0.5" />
        <span>Saved</span>
      </button>

      <button
        type="button"
        onClick={onOpenProfile}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'profile' ? 'text-bloodstone font-bold' : 'text-charcoal/60'
        }`}
      >
        <UserIcon className="w-5 h-5 mb-0.5" />
        <span>Profile</span>
      </button>
    </div>
  );
};
