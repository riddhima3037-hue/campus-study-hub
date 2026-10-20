import React from 'react';
import { X, Bell, Calendar, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onNavigate,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-xs p-4">
      <div className="bg-warm-white max-w-lg w-full rounded-2xl border border-[#E8D9B8] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-[#FAF4E5] border-b border-[#E8D9B8] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bloodstone text-warm-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-bloodstone">
                Campus Academic Notifications
              </h3>
              <p className="text-[11px] text-charcoal/60">UGI College Bulletins & Upload Alerts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal/60 hover:text-bloodstone"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 divide-y divide-[#E8D9B8]/50">
          {notifications.length > 0 ? (
            notifications.map(notif => (
              <div key={notif.id} className="pt-3 first:pt-0 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-charcoal/60">
                  <span className="font-semibold text-bloodstone uppercase">
                    {notif.type.replace('_', ' ')}
                  </span>
                  <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-charcoal">{notif.title}</h4>
                <p className="text-xs text-charcoal/75 leading-relaxed">{notif.message}</p>
                {notif.linkUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (notif.linkUrl?.includes('paper')) onNavigate('papers');
                      else if (notif.linkUrl?.includes('note')) onNavigate('notes');
                    }}
                    className="text-[11px] font-semibold text-bloodstone hover:underline flex items-center gap-1 pt-0.5"
                  >
                    <span>View resource</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-charcoal/60">No new notifications.</div>
          )}
        </div>
      </div>
    </div>
  );
};
