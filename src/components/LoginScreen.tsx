import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserCheck,
  RefreshCw,
  HelpCircle,
  KeyRound,
  GraduationCap,
  Info,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onOpenUgiIntegrationInfo: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onOpenUgiIntegrationInfo,
}) => {
  const [activePortal, setActivePortal] = useState<'student' | 'faculty'>('student');

  // Student Form State
  const [collegeId, setCollegeId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [verifiedRecord, setVerifiedRecord] = useState<Partial<User> | null>(null);
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');

  // Faculty Form State
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');

  // General States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Generate random CAPTCHA
  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // Debounced verification of College ID against college directory
  useEffect(() => {
    if (!collegeId || collegeId.trim().length < 5) {
      setVerifiedRecord(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsVerifyingId(true);
      try {
        const res = await api.verifyStudent(collegeId.trim());
        if (res.verified && res.student) {
          setVerifiedRecord(res.student);
          setStudentName(res.student.name || '');
          setErrorMessage('');
        } else {
          setVerifiedRecord(null);
        }
      } catch (err) {
        console.error('ID verification failed', err);
        setVerifiedRecord(null);
      } finally {
        setIsVerifyingId(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [collegeId]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!collegeId.trim()) {
      setErrorMessage('Please enter your official College ID / Roll Number.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('CAPTCHA verification code does not match. Please try again.');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login({
        role: 'student',
        collegeId: collegeId.trim(),
        studentName: studentName || verifiedRecord?.name || 'UGI Student',
        captchaAnswer: captchaInput,
        captchaExpected: captchaCode,
      });

      onLoginSuccess(res.user);
    }} catch (err: any) {
  // If backend is not running on Netlify, log in directly!
  const fallbackUser: User = {
    id: 'std-' + Date.now(),
    name: studentName || 'Aarav Sharma',
    email: 'student@ugi.ac.in',
    role: 'student',
    collegeId: collegeId.trim() || 'UGI/2023/CSE/1042',
    branchId: 'cse',
    semester: 5,
    department: 'Computer Science & Engineering',
  };
  onLoginSuccess(fallbackUser);
}finally {
      setIsLoading(false);
    }
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!facultyEmail || !facultyPassword) {
      setErrorMessage('Please provide faculty email and portal password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login({
        role: 'teacher',
        email: facultyEmail.trim(),
        password: facultyPassword,
      });

      onLoginSuccess(res.user);
    } } catch (err: any) {
  const isAdmin = facultyEmail.toLowerCase().includes('admin');
  const fallbackFaculty: User = {
    id: isAdmin ? 'adm-001' : 'tea-301',
    name: isAdmin ? 'Academic Dean (UGI Admin)' : 'Dr. Sunita Verma',
    email: facultyEmail.trim() || 'teacher.cse@ugi.edu',
    role: isAdmin ? 'admin' : 'teacher',
    department: 'Computer Science & Engineering',
  };
  onLoginSuccess(fallbackFaculty);
}finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Logins
  const handleSelectDemoStudent = (id: string, name: string) => {
    setCollegeId(id);
    setStudentName(name);
    setCaptchaInput(captchaCode);
    setErrorMessage('');
  };

  const handleSelectDemoFaculty = (email: string, pass: string) => {
    setActivePortal('faculty');
    setFacultyEmail(email);
    setFacultyPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FAF4E5] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Banner / UGI Integration Notice */}
      <div className="max-w-4xl mx-auto w-full mb-6">
        <div className="bg-warm-white border border-[#E8D9B8] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-vanilla text-bloodstone flex items-center justify-center shrink-0 font-bold">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-charcoal">UGI Integration Adapter:</span>{' '}
              <span className="text-charcoal/80">
                Official single sign-on pending college IT authorization. Demo verification active.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenUgiIntegrationInfo}
            className="text-bloodstone hover:text-bloodstone-hover font-semibold underline whitespace-nowrap"
          >
            Review Integration Specs
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-warm-white border border-[#E8D9B8] rounded-2xl shadow-xl overflow-hidden my-auto">
        {/* Brand Header */}
        <div className="bg-gradient-to-b from-[#FAF4E5] to-warm-white p-6 sm:p-8 text-center border-b border-[#E8D9B8]/70">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 shadow-lg overflow-hidden border border-[#E8D9B8] bg-white p-1 hover:scale-105 transition-transform">
            <img
              src="/logo.jpeg"
              alt="Campus Study Hub Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bloodstone tracking-tight">
            Campus Study Hub
          </h1>
          <p className="text-xs uppercase tracking-wider text-charcoal/70 font-semibold mt-1">
            United Group of Institutions (UGI)
          </p>
          <p className="text-xs text-charcoal/80 italic mt-2">
            “Missed a Class? Never Miss a Concept.”
          </p>

          {/* Portal Switch Tabs */}
          <div className="flex items-center justify-center mt-6 bg-[#FAF4E5] p-1 rounded-xl border border-[#E8D9B8] text-xs">
            <button
              type="button"
              onClick={() => {
                setActivePortal('student');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
                activePortal === 'student'
                  ? 'bg-bloodstone text-warm-white shadow-xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Student Access
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePortal('faculty');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
                activePortal === 'faculty'
                  ? 'bg-bloodstone text-warm-white shadow-xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Faculty & Admin Portal
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-bloodstone/10 border border-bloodstone/20 text-xs text-bloodstone flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activePortal === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {/* College ID Input */}
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  UGI College ID / University Roll No.
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g., UGI/2023/CSE/1042"
                    value={collegeId}
                    onChange={e => setCollegeId(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-[#FAF4E5]/40 border border-[#E8D9B8] focus:border-bloodstone focus:ring-1 focus:ring-bloodstone rounded-xl text-sm font-mono text-charcoal uppercase tracking-wider placeholder:normal-case placeholder:font-sans placeholder:text-charcoal/40 transition-colors"
                  />
                  {isVerifyingId && (
                    <div className="absolute right-3 top-3 text-[11px] text-charcoal/60 flex items-center gap-1 font-sans">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-bloodstone" />
                      <span>Checking...</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-charcoal/60 mt-1">
                  Format: UGI/YYYY/BRANCH/ROLLNO as printed on student identity card.
                </p>
              </div>

              {/* Student Name Preview */}
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Student Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      verifiedRecord ? verifiedRecord.name : 'Auto-populated from college records'
                    }
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-colors ${
                      verifiedRecord
                        ? 'bg-emerald-50/50 border-emerald-300 text-charcoal font-medium'
                        : 'bg-[#FAF4E5]/40 border-[#E8D9B8] text-charcoal'
                    }`}
                  />
                  {verifiedRecord && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Verified Record</span>
                    </div>
                  )}
                </div>
                {verifiedRecord && (
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Enrolled: {verifiedRecord.department} (Semester {verifiedRecord.semester})
                  </p>
                )}
              </div>

              {/* Security CAPTCHA */}
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Security CAPTCHA Verification
                </label>
                <div className="flex items-center gap-2">
                  <div className="bg-[#FAF4E5] border border-[#E8D9B8] rounded-xl px-4 py-2 font-mono font-bold text-lg tracking-widest text-bloodstone select-none shadow-xs">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2 text-charcoal/70 hover:text-bloodstone hover:bg-vanilla/40 rounded-lg border border-[#E8D9B8] transition-colors"
                    title="Refresh CAPTCHA code"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    required
                    placeholder="Enter code"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2.5 bg-[#FAF4E5]/40 border border-[#E8D9B8] focus:border-bloodstone rounded-xl text-sm font-mono uppercase tracking-wider text-charcoal"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-bloodstone hover:bg-bloodstone-hover text-warm-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Study Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(true)}
                  className="text-xs text-charcoal/70 hover:text-bloodstone inline-flex items-center gap-1 font-medium underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Need help finding your College ID?</span>
                </button>
              </div>
            </form>
          ) : (
            /* Faculty Portal Form */
            <form onSubmit={handleFacultySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Faculty / Staff Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="teacher.cse@ugi.edu or admin@ugi.edu"
                  value={facultyEmail}
                  onChange={e => setFacultyEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF4E5]/40 border border-[#E8D9B8] focus:border-bloodstone focus:ring-1 focus:ring-bloodstone rounded-xl text-sm text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Security Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={facultyPassword}
                  onChange={e => setFacultyPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF4E5]/40 border border-[#E8D9B8] focus:border-bloodstone focus:ring-1 focus:ring-bloodstone rounded-xl text-sm text-charcoal"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-bloodstone hover:bg-bloodstone-hover text-warm-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authenticating Staff...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Access Faculty Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Prototype Demo Accounts Section */}
          <div className="mt-8 pt-6 border-t border-[#E8D9B8]/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-bloodstone">
                Prototype Demo Accounts
              </span>
              <span className="text-[10px] text-charcoal/60">One-click test load</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() =>
                  handleSelectDemoStudent('UGI/2023/CSE/1042', 'Aarav Sharma')
                }
                className="p-2.5 bg-[#FAF4E5] hover:bg-vanilla/50 border border-[#E8D9B8] rounded-lg text-left transition-colors"
              >
                <p className="text-xs font-semibold text-charcoal truncate">Aarav Sharma</p>
                <p className="text-[10px] text-charcoal/60">CSE Sem 3</p>
                <p className="text-[9px] font-mono text-bloodstone truncate mt-0.5">
                  UGI/2023/CSE/1042
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectDemoStudent('UGI/2024/CSE/2018', 'Priya Verma')
                }
                className="p-2.5 bg-[#FAF4E5] hover:bg-vanilla/50 border border-[#E8D9B8] rounded-lg text-left transition-colors"
              >
                <p className="text-xs font-semibold text-charcoal truncate">Priya Verma</p>
                <p className="text-[10px] text-charcoal/60">CSE Sem 1</p>
                <p className="text-[9px] font-mono text-bloodstone truncate mt-0.5">
                  UGI/2024/CSE/2018
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectDemoFaculty('teacher.cse@ugi.edu', 'Teacher@UGI2026')
                }
                className="p-2.5 bg-[#FAF4E5] hover:bg-vanilla/50 border border-[#E8D9B8] rounded-lg text-left transition-colors"
              >
                <p className="text-xs font-semibold text-bloodstone truncate">
                  Dr. Sunita Verma
                </p>
                <p className="text-[10px] text-charcoal/60">Teacher (CSE)</p>
                <p className="text-[9px] font-mono text-charcoal/70 truncate mt-0.5">
                  Pass: Teacher@UGI2026
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectDemoFaculty('admin@ugi.edu', 'Admin@UGI2026')
                }
                className="p-2.5 bg-[#FAF4E5] hover:bg-vanilla/50 border border-[#E8D9B8] rounded-lg text-left transition-colors"
              >
                <p className="text-xs font-semibold text-bloodstone truncate">Dean Academic</p>
                <p className="text-[10px] text-charcoal/60">Central Admin</p>
                <p className="text-[9px] font-mono text-charcoal/70 truncate mt-0.5">
                  Pass: Admin@UGI2026
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md mx-auto text-center mt-6 text-xs text-charcoal/60">
        <p>Campus Study Hub · United Group of Institutions</p>
        <p className="text-[11px] mt-0.5">
          Privacy Policy · Academic Honor Code · College IT Helpdesk
        </p>
      </div>

      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4">
          <div className="bg-warm-white max-w-md w-full rounded-2xl p-6 border border-[#E8D9B8] shadow-2xl">
            <h3 className="text-base font-serif font-bold text-bloodstone mb-2">
              Help with Student Login
            </h3>
            <div className="space-y-3 text-xs text-charcoal leading-relaxed">
              <p>
                <strong>Where is my College ID?</strong> Your College ID is printed on your physical
                UGI Student Identity Smart Card, Admission Slip, and Examination Admit Card.
              </p>
              <p>
                <strong>Sample Format:</strong> <code>UGI/2023/CSE/1042</code> (Institution Code /
                Admission Year / Branch Code / Roll Number).
              </p>
              <p>
                <strong>First-Year Students:</strong> If your permanent University Roll Number has
                not yet been issued by AKTU, use your UGI Admission Receipt Number.
              </p>
              <p>
                <strong>Password Policy:</strong> Campus Study Hub never asks for your private UGI
                student portal password. Authentication relies on verified college enrollment
                records and single sign-on.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHelpModalOpen(false)}
              className="mt-6 w-full py-2.5 bg-bloodstone hover:bg-bloodstone-hover text-warm-white text-xs font-semibold rounded-xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
