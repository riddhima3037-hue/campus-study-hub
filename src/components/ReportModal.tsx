import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Resource } from '../types';
import { api } from '../services/api';

interface ReportModalProps {
  resource: Resource;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ resource, onClose }) => {
  const [reason, setReason] = useState<string>('broken_file');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.reportResource({
        resourceId: resource.id,
        reason,
        comment,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-xs p-4">
      <div className="bg-warm-white max-w-md w-full rounded-2xl border border-[#E8D9B8] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#FAF4E5] border-b border-[#E8D9B8] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bloodstone/10 text-bloodstone flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-bloodstone">Report Academic Resource</h3>
              <p className="text-[11px] text-charcoal/60">Faculty Quality Review</p>
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

        {/* Content */}
        <div className="p-5">
          {isSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-700 mx-auto" />
              <h4 className="font-semibold text-charcoal text-sm">Report Submitted Successfully</h4>
              <p className="text-xs text-charcoal/70">
                The academic coordinator and uploader have been notified to review and update this file.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <p className="text-charcoal/70 font-medium">Reporting Resource:</p>
                <p className="font-semibold text-charcoal mt-0.5 truncate">{resource.title}</p>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-bloodstone/10 text-bloodstone rounded-lg border border-bloodstone/20">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-charcoal mb-1">Issue Category</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl text-xs text-charcoal focus:ring-1 focus:ring-bloodstone"
                >
                  <option value="broken_file">Broken file / PDF cannot be opened</option>
                  <option value="incorrect_subject">Wrong subject or chapter classification</option>
                  <option value="poor_quality">Blurry scan or illegible handwritten notes</option>
                  <option value="invalid_video">YouTube video link unavailable or deleted</option>
                  <option value="other">Incorrect formula / solution inaccuracy</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Specific Details / Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Page 2 formula has a typo, or video audio is silent..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl text-xs text-charcoal focus:ring-1 focus:ring-bloodstone"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#E8D9B8] text-charcoal/80 rounded-xl hover:bg-vanilla/40 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-bloodstone text-warm-white font-semibold rounded-xl hover:bg-bloodstone-hover transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Report</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
