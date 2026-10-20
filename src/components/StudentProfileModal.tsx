import React from 'react';
import { User } from '../types';
import { X, GraduationCap, ShieldCheck, LogOut, BookOpen, CheckCircle } from 'lucide-react';

interface StudentProfileModalProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
  onOpenUgiModal: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  user,
  onClose,
  onLogout,
  onOpenUgiModal,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-xs p-4">
      <div className="bg-warm-white max-w-sm w-full rounded-2xl border border-[#E8D9B8] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-vanilla to-[#FAF4E5] p-5 text-center border-b border-[#E8D9B8] relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 p-1 rounded-lg text-charcoal/60 hover:text-bloodstone"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-bloodstone text-warm-white font-bold text-xl flex items-center justify-center mx-auto mb-2 shadow-xs">
            {user.name.charAt(0)}
          </div>
          <h3 className="font-serif font-bold text-base text-charcoal">{user.name}</h3>
          <p className="text-xs text-charcoal/70">{user.email}</p>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3 text-xs">
          {user.collegeId && (
            <div className="flex items-center justify-between p-2.5 bg-[#FAF4E5] rounded-xl border border-[#E8D9B8]">
              <span className="text-charcoal/70">College Roll No:</span>
              <span className="font-mono font-bold text-bloodstone">{user.collegeId}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-2.5 bg-[#FAF4E5] rounded-xl border border-[#E8D9B8]">
            <span className="text-charcoal/70">Department:</span>
            <span className="font-medium text-charcoal">{user.department || 'Computer Science'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#FAF4E5] rounded-xl border border-[#E8D9B8]">
            <span className="text-charcoal/70">Current Semester:</span>
            <span className="font-bold font-mono text-bloodstone">Semester {user.semester || 1}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenUgiModal();
            }}
            className="w-full text-left p-3 rounded-xl border border-[#E8D9B8] hover:bg-vanilla/30 text-charcoal flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-bloodstone" />
              <span className="font-semibold">UGI Integration Adapter</span>
            </div>
            <span className="text-[10px] text-bloodstone font-semibold uppercase">Pending IT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full mt-4 py-2.5 bg-bloodstone hover:bg-bloodstone-hover text-warm-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
