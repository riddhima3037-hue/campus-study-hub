# 🎓 Campus Study Hub (UGI College Academic Portal)

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini_AI-2.4-8E75C2?logo=google&logoColor=white)](https://ai.google.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**Campus Study Hub** is a full-stack academic learning platform engineered specifically for engineering and college students (UGI / AKTU syllabus). It provides verified teacher notes, unit-wise video lectures, sessional test papers (CT-1, CT-2, PUT), AKTU previous year question papers (PYQs) with step-by-step solutions, an intelligent Gemini AI academic doubt tutor, and peer-reviewed note uploads.

---

## 🌟 Key Features

1. **📚 Teacher Notes & Unit-Wise Syllabus:**
   - Filter by Department (Computer Science, IT, Electronics, Mechanical), Semester (1 to 8), and Subject.
   - Built-in PDF reader modal with page zoom, unit bookmarks, download option, and faculty verification badges.

2. **🎥 Curated Video Lectures:**
   - Topic-by-topic playlist mapped directly to the AKTU university syllabus.
   - Embedded interactive player, topic key takeaways, and duration estimates.

3. **📝 Sessional & AKTU Exam Papers (PYQs):**
   - Class Test 1 (CT-1), Class Test 2 (CT-2), and Pre-University Test (PUT) archives.
   - AKTU End-Semester examination papers sorted by year with step-by-step model solutions and marking schemes.

4. **🤖 Gemini AI Academic Doubt Solver:**
   - Context-aware engineering tutor powered by `@google/genai`.
   - Ask complex theoretical doubts, debug C++/Java/Python programs, or solve engineering mathematics problems.

5. **📤 Community Notes Upload & Peer Review:**
   - Students can contribute class notes with title, subject, unit number, and PDF/image attachments.
   - Teacher & peer verification flags to maintain high academic quality.

6. **📱 Progressive Web App (PWA) & Mobile-Ready:**
   - Installable on Android, iPhone, Windows, and Mac as a standalone app with custom collegiate branding.

---

## 🚀 Quick Start (Running Locally in VS Code)

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.x or 20.x recommended)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

### 1. Clone or Download the Repository
```bash
git clone https://github.com/YOUR_USERNAME/campus-study-hub.git
cd campus-study-hub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Inside `.env`, configure:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: A Gemini API key can be generated free of charge at [Google AI Studio](https://aistudio.google.com/)).*

### 4. Start the Full-Stack Dev Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 💻 How to Push This App to GitHub & VS Code

If you downloaded or exported this project and want to connect it to GitHub:

### Step 1: Initialize Git in your project folder
Open the terminal in VS Code (`Ctrl + ~` or `Cmd + ~`) and run:
```bash
git init
git add .
git commit -m "Initial commit of Campus Study Hub"
```

### Step 2: Create a New Repository on GitHub
1. Go to [GitHub.com/new](https://github.com/new).
2. Name your repository (e.g., `campus-study-hub`).
3. Leave it public or private, and **do not** check "Initialize with README" (since you already have one).
4. Click **Create repository**.

### Step 3: Link & Push
Copy the commands shown by GitHub, or run:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/campus-study-hub.git
git push -u origin main
```

Now your entire project and commit history will be backed up on GitHub!

---

## 🧑‍🏫 How to Present & Show This App to Teachers

### 1. Show the Live Hosted URL (No Setup Needed!)
Your project is deployed live on Google Cloud Run:
- **Live Share URL:** `https://ais-pre-lkn7szaodvqlqblak4xlsd-513785129020.asia-southeast1.run.app`
- Teachers can open this link directly on their smartphone, tablet, laptop, or classroom smartboard.

### 2. Suggested 3-Minute Presentation Script

- **Slide / Minute 1: The Problem**
  > *"Every semester, students struggle to locate reliable handwritten notes, exam solutions, and syllabus-oriented lecture videos. They get scattered across random WhatsApp groups and drive links."*

- **Slide / Minute 2: The Solution (Campus Study Hub)**
  > *"Campus Study Hub solves this by uniting official department notes, AKTU previous year question papers (with solved answers), sessional test papers, and syllabus-mapped YouTube video lectures in one fast, centralized portal."*

- **Slide / Minute 3: Interactive Demo**
  - **Show Notes:** Select B.Tech CSE -> 3rd Year -> Data Structures -> Preview PDF unit notes.
  - **Show Exam Papers:** Filter Sessional CT-1 vs. AKTU PYQ -> Reveal step-by-step solution.
  - **Show AI Doubt Assistant:** Ask a question like *"Explain Dijkstra's Algorithm with time complexity"* in the built-in Gemini AI bot.
  - **Show Installability:** Click "Install App" to demonstrate that it runs just like a native Android/iOS mobile application!

---

## 🌐 Alternative Free Production Hosting Options

If you want to host your GitHub repo on custom domains:

| Platform | Deployment Type | Command / Config |
| :--- | :--- | :--- |
| **Vercel** | Frontend + Serverless | Connect GitHub repo -> Framework: Vite -> Deploy |
| **Render** | Full-Stack Express Server | Build: `npm install && npm run build` \| Start: `npm start` |
| **Railway** | Full-Stack Node.js | One-click GitHub connect, automatically detects Node & Port |
| **Google Cloud Run** | Docker / Container | Live native AI Studio hosting |

---

## 📂 Project Architecture

```
├── public/                 # Static assets (logo.jpeg, manifest.json, icons)
├── data/                   # Persistent local database & upload storage
│   ├── db.json             # Students, notes, and papers JSON store
│   └── uploads/            # Uploaded PDF and document attachments
├── src/
│   ├── components/         # Modular React components
│   │   ├── AcademicExplorer.tsx    # Subject syllabus & notes browser
│   │   ├── ExamPapersModule.tsx    # CT-1, CT-2, PUT & AKTU PYQs
│   │   ├── GeminiChatbot.tsx       # AI Study Doubts assistant
│   │   ├── TeacherNotesLibrary.tsx # Faculty notes repository
│   │   ├── VideoLibrary.tsx        # Topic-wise video lectures
│   │   ├── AppInfoModal.tsx        # Architecture, VS Code & Teacher Guide
│   │   ├── Header.tsx              # Top bar & navigation
│   │   └── LoginScreen.tsx         # Student / Faculty authentication
│   ├── App.tsx             # Main routing & state coordinator
│   └── main.tsx            # React DOM mounting
├── server.ts               # Express.js backend with Gemini AI & Multer uploads
├── package.json            # Scripts and dependencies
└── vite.config.ts          # Vite configuration
```

---

## 📜 License & Credits

Built with ❤️ for UGI College Students and Faculty.
All trademarks, college syllabi, and logos belong to their respective institutions.
