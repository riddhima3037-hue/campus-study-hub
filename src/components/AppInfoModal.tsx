import React, { useState } from 'react';
import {
  X,
  Code2,
  Server,
  Database,
  Smartphone,
  Monitor,
  Download,
  Terminal,
  Globe,
  Layers,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Palette,
  BookOpen,
  GraduationCap,
  GitBranch,
  Laptop,
  CheckCircle2,
  Share2,
  PlayCircle,
  FileText,
  Search,
  MessageSquare
} from 'lucide-react';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({
  isOpen,
  onClose,
  onInstallPwa,
  canInstallPwa = false,
}) => {
  const [activeSection, setActiveSection] = useState<'how_to_use' | 'teacher_demo' | 'vscode_github' | 'stack' | 'logo_mobile'>('how_to_use');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const LIVE_URL = 'https://ais-pre-lkn7szaodvqlqblak4xlsd-513785129020.asia-southeast1.run.app';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadOfficialLogo = () => {
    const link = document.createElement('a');
    link.href = '/logo.jpeg';
    link.download = 'campus-study-hub-logo.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-warm-white border border-[#E8D9B8] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Modal Bar */}
        <div className="px-6 py-4 border-b border-[#E8D9B8] bg-vanilla/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Campus Study Hub Emblem"
              className="w-10 h-10 rounded-xl shadow-xs border border-[#E8D9B8] object-contain bg-white"
            />
            <div>
              <h2 className="text-lg font-serif font-bold text-bloodstone leading-tight">
                Campus Study Hub — Complete Guide & Architecture
              </h2>
              <p className="text-xs text-charcoal/70">
                User Guide • Teacher Presentation • VS Code & GitHub • Deployment • Tech Stack
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal/60 hover:text-charcoal hover:bg-vanilla/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-[#E8D9B8] bg-vanilla/15 px-6 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveSection('how_to_use')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'how_to_use'
                ? 'border-bloodstone text-bloodstone bg-bloodstone/5'
                : 'border-transparent text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. How to Use App</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('teacher_demo')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'teacher_demo'
                ? 'border-bloodstone text-bloodstone bg-bloodstone/5'
                : 'border-transparent text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>2. Show to Teachers & Deploy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('vscode_github')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'vscode_github'
                ? 'border-bloodstone text-bloodstone bg-bloodstone/5'
                : 'border-transparent text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>3. VS Code & GitHub</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('stack')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'stack'
                ? 'border-bloodstone text-bloodstone bg-bloodstone/5'
                : 'border-transparent text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>4. Languages & Architecture</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('logo_mobile')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'logo_mobile'
                ? 'border-bloodstone text-bloodstone bg-bloodstone/5'
                : 'border-transparent text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>5. Logo & Mobile / Desktop</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-charcoal space-y-6">

          {/* ========================================================================= */}
          {/* SECTION 1: HOW TO USE THIS APP */}
          {/* ========================================================================= */}
          {activeSection === 'how_to_use' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-bloodstone/20 bg-bloodstone/5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-bloodstone text-white flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-bloodstone">Welcome to Campus Study Hub</h3>
                  <p className="text-xs text-charcoal/80 mt-1 leading-relaxed">
                    Campus Study Hub is a comprehensive digital learning portal tailored for UGI college students adhering to the official AKTU engineering syllabus. Below is a tour of every core feature and how to use it.
                  </p>
                </div>
              </div>

              {/* Step by step feature cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Feature 1 */}
                <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-2">
                  <div className="flex items-center gap-2 text-bloodstone font-bold text-sm">
                    <GraduationCap className="w-4 h-4" />
                    <span>1. Student & Teacher Authentication</span>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Log in quickly using the one-click demo profiles:
                  </p>
                  <ul className="text-xs text-charcoal/80 space-y-1 list-disc list-inside">
                    <li><strong>Student Mode:</strong> Browse notes, watch lectures, bookmark topics, take sessional tests, and query the AI tutor.</li>
                    <li><strong>Teacher Mode:</strong> Upload department lecture notes, verify student submissions, and manage exam archives.</li>
                  </ul>
                </div>

                {/* Feature 2 */}
                <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-2">
                  <div className="flex items-center gap-2 text-bloodstone font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>2. Teacher Notes & Syllabus</span>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Filter by Department (CSE, IT, ECE, ME) and Semester (1 to 8). Each subject is split into <strong>Units 1 through 5</strong> with verified faculty PDF notes.
                  </p>
                  <p className="text-[11px] text-charcoal/70">
                    💡 Click <strong>"Preview Note"</strong> to read PDFs directly in the built-in modal viewer without leaving the app!
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-2">
                  <div className="flex items-center gap-2 text-bloodstone font-bold text-sm">
                    <PlayCircle className="w-4 h-4" />
                    <span>3. Topic-Wise Video Lectures</span>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Access high-yield video lectures specifically curated for university examination preparation. Each lecture includes:
                  </p>
                  <ul className="text-xs text-charcoal/80 space-y-1 list-disc list-inside">
                    <li>Direct YouTube video player integration</li>
                    <li>Key concept takeaways & time markers</li>
                    <li>Mark as Completed to track your syllabus coverage</li>
                  </ul>
                </div>

                {/* Feature 4 */}
                <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-2">
                  <div className="flex items-center gap-2 text-bloodstone font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>4. Sessional Papers & AKTU PYQs</span>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Switch between <strong>Sessional Tests</strong> (CT-1, CT-2, Pre-University Tests) and <strong>AKTU University Papers</strong> (2020 to 2024).
                  </p>
                  <p className="text-[11px] text-charcoal/70">
                    ✨ Every paper has verified step-by-step solutions with marking scheme rubrics (2-mark & 10-mark questions).
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-2">
                  <div className="flex items-center gap-2 text-bloodstone font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>5. Gemini AI Doubt Solver</span>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Click the floating <strong>"AI Doubt Assistant"</strong> button on the bottom-right or header:
                  </p>
                  <ul className="text-xs text-charcoal/80 space-y-1 list-disc list-inside">
                    <li>Ask any question related to Data Structures, OS, DBMS, Mathematics, etc.</li>
                    <li>Generates code snippets in C++, Java, or Python with explanations.</li>
                    <li>Summarizes tough exam topics in bullet points for quick revision.</li>
                  </ul>
                </div>

                {/* Feature 6 */}
                <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-2">
                  <div className="flex items-center gap-2 text-bloodstone font-bold text-sm">
                    <Search className="w-4 h-4" />
                    <span>6. Universal Search & Bookmarks</span>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E8D9B8] font-mono text-[10px]">Ctrl + K</kbd> anywhere in the app to search across all notes, videos, and questions.
                  </p>
                  <p className="text-[11px] text-charcoal/70">
                    Bookmark your key units into the <strong>"Saved Resources"</strong> tab for rapid offline exam revision.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: SHOW TO TEACHERS & DEPLOY */}
          {/* ========================================================================= */}
          {activeSection === 'teacher_demo' && (
            <div className="space-y-6">
              
              {/* Live URL Card */}
              <div className="p-5 rounded-xl border-2 border-bloodstone/30 bg-bloodstone/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-bloodstone" />
                    <h3 className="font-serif font-bold text-bloodstone text-base">Your App is Live on Cloud Run!</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-semibold border border-green-200">
                    ● Live & Accessible
                  </span>
                </div>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  You do <strong>not</strong> need to set up servers or deploy anything extra right now to show your teachers. Your app is already running on Google Cloud Run and can be opened on any phone, laptop, or smartboard:
                </p>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-[#E8D9B8]">
                  <span className="font-mono text-xs text-charcoal truncate flex-1 select-all">
                    {LIVE_URL}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(LIVE_URL, 'live-link')}
                    className="px-3 py-1.5 bg-bloodstone text-white rounded text-xs font-semibold hover:bg-bloodstone/90 transition flex items-center gap-1 shrink-0"
                  >
                    {copiedIndex === 'live-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'live-link' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={LIVE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-charcoal/70 hover:text-charcoal rounded hover:bg-vanilla/60"
                    title="Open live app"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Important notice regarding 403 Access Error */}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-xs text-amber-950 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>Seeing "403. That's an error. You do not have access"?</span>
                  </div>
                  <p className="leading-relaxed">
                    AI Studio Cloud Run URLs are protected by Google Cloud security. If you or your teachers see a 403 error:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-900/90">
                    <li>
                      <strong>Check Your Google Account:</strong> The link only opens when signed in with the authorized Google account (<code>nayanpandey186@gmail.com</code>). It will show 403 if opened in Incognito or an unsigned browser.
                    </li>
                    <li>
                      <strong>Enable Sharing in AI Studio:</strong> Click the <strong>Share</strong> button in the top right corner of AI Studio and set permissions so others can view it.
                    </li>
                    <li>
                      <strong>Permanent 100% Public Link (Recommended for Teachers):</strong> For a link that any teacher or student can open with zero Google login hurdles, deploy to <strong>Vercel</strong> (see the 1-click guide below or in the VS Code & GitHub tab).
                    </li>
                  </ul>
                </div>
              </div>

              {/* 3-Minute Teacher Presentation Script */}
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-3">
                <h4 className="font-serif font-bold text-charcoal text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-bloodstone" />
                  3-Minute Teacher Demo Script (Step-by-Step)
                </h4>
                <div className="space-y-3 text-xs text-charcoal/80">
                  <div className="p-3 bg-white rounded-lg border border-[#E8D9B8]/60 space-y-1">
                    <span className="font-bold text-bloodstone">Minute 1: The Problem (Hook)</span>
                    <p>
                      <em>"Respected teachers, every semester students waste hours searching for authentic notes, verified PYQs, and topic-wise lectures across scattered WhatsApp groups and Drive links. Important class test solutions are often lost before semester exams."</em>
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E8D9B8]/60 space-y-1">
                    <span className="font-bold text-bloodstone">Minute 2: The Solution (Campus Study Hub)</span>
                    <p>
                      <em>"To solve this, I built <strong>Campus Study Hub</strong> — an all-in-one digital academic portal tailored specifically for our college and AKTU curriculum. It categorizes official faculty notes by branch and semester, offers past 5 years of AKTU PYQs with model solutions, and curates unit-by-unit YouTube lectures."</em>
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E8D9B8]/60 space-y-1">
                    <span className="font-bold text-bloodstone">Minute 3: Live Interactive Demo (Action)</span>
                    <p>
                      <em>"Let me demonstrate: Here I filter by CSE 3rd Year → Data Structures → Click Preview Note to view the unit PDF. Then I jump to Sessional Papers → View CT-1 paper with answers. And when students get stuck studying late at night, our built-in Gemini AI doubt tutor answers questions instantly."</em>
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Free Deployments */}
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-3">
                <h4 className="font-bold text-charcoal text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-bloodstone" />
                  Deploying to Free Cloud Platforms (Vercel, Render, Railway)
                </h4>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  If you want your own custom domain or permanent free tier deployment linked to your GitHub repository:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-[#E8D9B8] space-y-1">
                    <span className="font-bold text-charcoal flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      Option A: Render.com (Full-Stack Express)
                    </span>
                    <p className="text-charcoal/70">Supports the backend `server.ts` and PDF uploads.</p>
                    <code className="block p-1 bg-charcoal/5 rounded font-mono text-[11px]">
                      Build: npm run build<br />
                      Start: npm start
                    </code>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#E8D9B8] space-y-1">
                    <span className="font-bold text-charcoal flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-black" />
                      Option B: Vercel (Frontend & Serverless)
                    </span>
                    <p className="text-charcoal/70">Connect GitHub → Framework: Vite → One click deploy.</p>
                    <code className="block p-1 bg-charcoal/5 rounded font-mono text-[11px]">
                      Build Command: vite build<br />
                      Output Dir: dist
                    </code>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: CONNECT TO VS CODE & GITHUB */}
          {/* ========================================================================= */}
          {activeSection === 'vscode_github' && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-2">
                <h3 className="text-base font-serif font-bold text-bloodstone flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-bloodstone" />
                  Connect App to VS Code & GitHub (Step-by-Step)
                </h3>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  Follow these exact steps to push this complete project to your personal GitHub account and run it locally inside Visual Studio Code.
                </p>
              </div>

              {/* Step 1: Git Init */}
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-white space-y-2">
                <div className="flex items-center gap-2 text-charcoal font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-bloodstone text-white text-xs flex items-center justify-center">1</span>
                  <span>Initialize Git in Your Project Folder</span>
                </div>
                <p className="text-xs text-charcoal/70">
                  Open terminal in your project directory and initialize a clean git repository:
                </p>
                <div className="p-3 bg-charcoal text-warm-white rounded-lg font-mono text-xs relative">
                  <pre>{`git init
git add .
git commit -m "Initial commit of Campus Study Hub"`}</pre>
                  <button
                    onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "Initial commit of Campus Study Hub"`, 'git-init')}
                    className="absolute top-2 right-2 text-xs px-2 py-1 bg-charcoal/80 hover:bg-charcoal text-vanilla rounded flex items-center gap-1 border border-white/20"
                  >
                    {copiedIndex === 'git-init' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Create GitHub Repo */}
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-white space-y-2">
                <div className="flex items-center gap-2 text-charcoal font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-bloodstone text-white text-xs flex items-center justify-center">2</span>
                  <span>Create a New Repository on GitHub</span>
                </div>
                <ul className="text-xs text-charcoal/80 space-y-1 list-disc list-inside">
                  <li>Visit <strong>github.com/new</strong> in your browser.</li>
                  <li>Repository name: <code className="px-1 py-0.5 rounded bg-vanilla/60 font-mono text-bloodstone font-bold">campus-study-hub</code></li>
                  <li>Set to <strong>Public</strong> (or Private).</li>
                  <li><strong>Important:</strong> Do not check "Add a README file" (we already created a complete README.md for you!).</li>
                  <li>Click <strong>Create repository</strong>.</li>
                </ul>
              </div>

              {/* Step 3: Link & Push */}
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-white space-y-2">
                <div className="flex items-center gap-2 text-charcoal font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-bloodstone text-white text-xs flex items-center justify-center">3</span>
                  <span>Link Remote and Push to GitHub</span>
                </div>
                <p className="text-xs text-charcoal/70">
                  Replace <code className="text-bloodstone font-mono">YOUR_USERNAME</code> with your actual GitHub username:
                </p>
                <div className="p-3 bg-charcoal text-warm-white rounded-lg font-mono text-xs relative">
                  <pre>{`git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/campus-study-hub.git
git push -u origin main`}</pre>
                  <button
                    onClick={() => copyToClipboard(`git branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/campus-study-hub.git\ngit push -u origin main`, 'git-push')}
                    className="absolute top-2 right-2 text-xs px-2 py-1 bg-charcoal/80 hover:bg-charcoal text-vanilla rounded flex items-center gap-1 border border-white/20"
                  >
                    {copiedIndex === 'git-push' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Step 4: Running in VS Code */}
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-white space-y-2">
                <div className="flex items-center gap-2 text-charcoal font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-bloodstone text-white text-xs flex items-center justify-center">4</span>
                  <span>Open & Run in VS Code</span>
                </div>
                <p className="text-xs text-charcoal/70">
                  Launch Visual Studio Code and run the development server locally:
                </p>
                <div className="p-3 bg-charcoal text-warm-white rounded-lg font-mono text-xs relative">
                  <pre>{`# Open project in VS Code:
code .

# Install all dependencies:
npm install

# Setup environment file:
cp .env.example .env

# Start dev server:
npm run dev`}</pre>
                  <button
                    onClick={() => copyToClipboard(`code .\nnpm install\ncp .env.example .env\nnpm run dev`, 'vscode-run')}
                    className="absolute top-2 right-2 text-xs px-2 py-1 bg-charcoal/80 hover:bg-charcoal text-vanilla rounded flex items-center gap-1 border border-white/20"
                  >
                    {copiedIndex === 'vscode-run' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Recommended extensions */}
              <div className="p-3 rounded-lg border border-[#E8D9B8]/70 bg-vanilla/15 text-xs text-charcoal/80">
                <strong>Recommended VS Code Extensions:</strong> Tailwind CSS IntelliSense, ESLint, Prettier - Code formatter, GitLens.
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: LANGUAGES & ARCHITECTURE */}
          {/* ========================================================================= */}
          {activeSection === 'stack' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-bloodstone mb-1 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-bloodstone" />
                  Core Programming Languages Used
                </h3>
                <p className="text-xs text-charcoal/80">
                  Campus Study Hub is engineered with modern full-stack web standards:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-bloodstone text-xs">TypeScript (v5.8+)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-bloodstone/10 text-bloodstone font-mono">Frontend & Backend</span>
                  </div>
                  <p className="text-xs text-charcoal/80">
                    Provides type safety across all subjects, notes, user models, exam papers, and API requests to prevent runtime errors.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-bloodstone text-xs">JavaScript (ES2024 / Node.js)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 font-mono">Runtime Engine</span>
                  </div>
                  <p className="text-xs text-charcoal/80">
                    High-performance asynchronous execution runtime powering server-side routing, streaming AI responses, and file handling.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-bloodstone text-xs">React 19 & JSX</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-800 font-mono">UI Component Architecture</span>
                  </div>
                  <p className="text-xs text-charcoal/80">
                    Component hierarchy with interactive state hooks for search modals, PDF previewing, video playlists, and tab navigation.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-bloodstone text-xs">Tailwind CSS (v4)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-800 font-mono">Design & Styling</span>
                  </div>
                  <p className="text-xs text-charcoal/80">
                    Zero-runtime modern CSS engine delivering an academic collegiate theme (Deep Crimson `#7A1C1C`, Warm Vanilla, and Gold accents).
                  </p>
                </div>
              </div>

              {/* Backend & AI */}
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-white space-y-2">
                <h4 className="font-bold text-charcoal text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-bloodstone" />
                  Full-Stack Express & Gemini AI Integration
                </h4>
                <ul className="text-xs text-charcoal/80 space-y-1.5 list-disc list-inside">
                  <li><strong>Express Server (`server.ts`):</strong> Serves static files, manages API proxy routes, and handles PDF uploads via Multer.</li>
                  <li><strong>Google Gemini API (`@google/genai`):</strong> High-speed academic tutor for B.Tech doubts, step-by-step algorithms, and program debugging.</li>
                  <li><strong>JSON Persistence (`data/db.json`):</strong> Stores verified student notes, PYQ solutions, and teacher accounts.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: APP LOGO & MOBILE / DESKTOP */}
          {/* ========================================================================= */}
          {activeSection === 'logo_mobile' && (
            <div className="space-y-6">
              
              {/* Logo Card */}
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-3">
                <h4 className="font-serif font-bold text-charcoal text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4 text-bloodstone" />
                  Official Collegiate Emblem & App Logo
                </h4>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  The official Campus Study Hub emblem is configured across your app icon, browser favicon, and PWA mobile launcher.
                </p>

                <div className="p-4 rounded-xl bg-white border border-[#E8D9B8] flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src="/logo.jpeg"
                    alt="Campus Study Hub Emblem"
                    className="w-24 h-24 rounded-2xl border border-[#E8D9B8] shadow-md object-contain bg-white p-1"
                  />
                  <div className="space-y-2 text-center sm:text-left">
                    <h5 className="font-serif font-bold text-bloodstone text-sm">Campus Study Hub Official Crest</h5>
                    <p className="text-xs text-charcoal/70">
                      High-resolution format suitable for mobile app stores (Google Play, Apple App Store) and desktop shortcuts.
                    </p>
                    <button
                      type="button"
                      onClick={downloadOfficialLogo}
                      className="px-3.5 py-1.5 bg-bloodstone text-white rounded-lg text-xs font-semibold hover:bg-bloodstone/90 transition flex items-center gap-1.5 mx-auto sm:mx-0 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Logo (JPEG / Icon)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Install PWA */}
              <div className="p-4 rounded-xl border border-bloodstone/20 bg-bloodstone/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-bloodstone text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Install as Phone App (Android & iPhone PWA)
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-800 font-semibold border border-green-200">
                    Instant 1-Click Install
                  </span>
                </div>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  Your app includes a configured <strong>Web App Manifest</strong> (`/manifest.json`). Students and teachers can install it directly to their home screen without downloading from the App Store:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-[#E8D9B8] space-y-1">
                    <span className="font-bold text-charcoal">📱 On Android (Chrome / Brave):</span>
                    <p className="text-charcoal/70">
                      Tap the 3 dots menu (⋮) → Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. It launches fullscreen just like an APK!
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#E8D9B8] space-y-1">
                    <span className="font-bold text-charcoal">🍎 On iPhone / iPad (Safari):</span>
                    <p className="text-charcoal/70">
                      Tap the Share button (<Share2 className="w-3 h-3 inline mx-0.5 text-blue-600" />) → Scroll down and tap <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                {canInstallPwa && onInstallPwa && (
                  <button
                    type="button"
                    onClick={onInstallPwa}
                    className="w-full py-2.5 bg-bloodstone text-white rounded-lg text-xs font-semibold hover:bg-bloodstone/90 transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Campus Study Hub on This Device Now</span>
                  </button>
                )}
              </div>

              {/* Native APK with Capacitor & Desktop with Electron */}
              <div className="p-4 rounded-xl border border-[#E8D9B8] bg-vanilla/25 space-y-3">
                <h4 className="font-bold text-charcoal text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-bloodstone" />
                  Package as Native Android APK (Capacitor) or Windows .EXE (Electron)
                </h4>
                <div className="p-3 bg-charcoal text-warm-white rounded-lg font-mono text-xs relative">
                  <p className="text-amber-300 font-sans font-semibold text-[11px] mb-1">Android APK via Capacitor:</p>
                  <pre>{`npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Campus Study Hub" "com.ugi.campushub" --web-dir dist
npm run build
npx cap add android
npx cap open android # Builds APK in Android Studio`}</pre>

                  <p className="text-amber-300 font-sans font-semibold text-[11px] mt-3 mb-1">Windows Desktop .EXE via Electron:</p>
                  <pre>{`npm install --save-dev electron electron-builder
npx electron .`}</pre>
                  
                  <button
                    onClick={() => copyToClipboard(`npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "Campus Study Hub" "com.ugi.campushub" --web-dir dist\nnpm run build\nnpx cap add android\nnpx cap open android`, 'native-pkg')}
                    className="absolute top-2 right-2 text-xs px-2 py-1 bg-charcoal/80 hover:bg-charcoal text-vanilla rounded flex items-center gap-1 border border-white/20"
                  >
                    {copiedIndex === 'native-pkg' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E8D9B8] bg-vanilla/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-charcoal/70">
            <Shield className="w-4 h-4 text-bloodstone" />
            <span>Campus Study Hub • Official UGI Academic Portal</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-charcoal text-warm-white text-xs font-semibold rounded-lg hover:bg-charcoal/80 transition"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
