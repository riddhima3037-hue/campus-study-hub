import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Shield, AlertCircle, FileCode, Mail } from 'lucide-react';
import { UgiIntegrationStatus } from '../types';
import { api } from '../services/api';

interface UgiIntegrationModalProps {
  onClose: () => void;
}

export const UgiIntegrationModal: React.FC<UgiIntegrationModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState<UgiIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getUgiStatus();
        setStatus(data);
      } catch (err) {
        console.error('Failed to load UGI status', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-warm-white max-w-2xl w-full rounded-2xl border border-[#E8D9B8] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#FAF4E5] border-b border-[#E8D9B8] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#E8D9B8] p-0.5 shadow-xs overflow-hidden flex items-center justify-center">
              <img src="/logo.jpeg" alt="UGI Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-bloodstone">
                UGI Official Integration Adapter
              </h2>
              <p className="text-xs text-charcoal/70 font-medium">
                Institutional Security & Single Sign-On Specification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-charcoal/60 hover:text-bloodstone rounded-lg hover:bg-vanilla/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-charcoal leading-relaxed max-h-[75vh] overflow-y-auto">
          {/* Status Box */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                Status: Adapter Ready — Pending Institutional IT Authorization
              </p>
              <p className="text-amber-800/90 mt-1">
                The application authentication adapter is configured with zero password harvesting.
                Currently operating in <strong>College Directory Verification & Prototype Demo Mode</strong>.
                No student passwords will ever be solicited or saved.
              </p>
            </div>
          </div>

          {/* Institutional IT Checklist */}
          <div>
            <h3 className="font-bold text-sm text-charcoal mb-3 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-bloodstone" />
              <span>Required Specifications from UGI IT Department</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    Institutional SAML 2.0 or OAuth 2.0 / OpenID Connect (OIDC) Endpoint
                  </p>
                  <p className="text-charcoal/70 mt-0.5">
                    Redirect-based identity provider URL so students authenticate directly on UGI’s
                    official login page with tokens exchanged via cryptographic signature.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    Student Information System (SIS) Roll Directory API
                  </p>
                  <p className="text-charcoal/70 mt-0.5">
                    Read-only endpoint to validate student roll number, verified name, department,
                    and semester without exposing private student records or marks.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF4E5]/50 border border-[#E8D9B8] rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    Security Compliance & Domain Whitelist Approval
                  </p>
                  <p className="text-charcoal/70 mt-0.5">
                    Institutional authorization permitting Campus Study Hub as an approved academic
                    study aid for undergraduate engineering students.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Constitution */}
          <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-4">
            <h4 className="font-bold text-bloodstone mb-2">Our Security & Privacy Guarantees:</h4>
            <ul className="space-y-1.5 list-disc pl-4 text-charcoal/80">
              <li>Zero student password entry: Students never enter their UGI ERP passwords here.</li>
              <li>Minimal data footprint: Only public college roll numbers and branch identifiers are stored.</li>
              <li>Role separation: Administrative and faculty rights require multi-factor staff verification.</li>
              <li>Auditable logs: Every administrative change and paper publication is logged.</li>
            </ul>
          </div>

          {/* IT Cell Contact */}
          <div className="p-4 bg-[#FAF4E5] rounded-xl border border-[#E8D9B8] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-bloodstone" />
              <div>
                <p className="font-semibold text-charcoal">UGI Academic Cell Inquiries</p>
                <p className="text-charcoal/60 text-[11px]">Direct integration requests to: it.support@ugi.ac.in</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-bloodstone text-warm-white font-medium rounded-lg hover:bg-bloodstone-hover transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
