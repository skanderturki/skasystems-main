# PMP Learning Platform - Project Documentation

## Overview

A SaaS platform for university students (Prince Sultan University) to learn Software Project Management. Students read topic summaries, take practice tests with feedback, then take formal certification exams. Passing with 80%+ generates a PDF certificate with a QR code anyone can scan to verify authenticity.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite | React 19, Vite 8 |
| Styling | Tailwind CSS v4 + @tailwindcss/typography | via @tailwindcss/vite plugin |
| Backend | Node.js + Express | Express 4.18 |
| Database | MongoDB Atlas + Mongoose 8 | Cloud-hosted |
| Auth | JWT in HTTP-only cookies (bcryptjs) | 7-day expiry |
| PDF Certs | PDFKit + qrcode | Server-side generation |
| Email | Nodemailer (Gmail SMTP) | For verification codes |

## Project Structure

```
/
├── package.json              # Root: concurrently runs client + server
├── .env.example              # Template for environment variables
├── CLAUDE.md                 # This file
│
├── server/
│   ├── .env                  # Server env vars (MONGODB_URI, JWT_SECRET, SMTP_*)
│   ├── package.json
│   └── src/
│       ├── server.js          # Entry point: connects DB then starts Express
│       ├── app.js             # Express app: middleware + route registration
│       ├── config/
│       │   ├── db.js          # Mongoose connection
│       │   └── env.js         # Env var validation (fails fast on missing vars)
│       ├── models/
│       │   ├── User.js        # firstName, lastName, email(@psu.edu.sa only), passwordHash, role, isVerified, progress
│       │   ├── Chapter.js     # chapterCode, title, description, order, topics[]
│       │   ├── Topic.js       # chapter ref, title, slug, order, content{sections[], learningObjectives[], keyTerms[]}
│       │   ├── Question.js    # chapter ref, questionText, options[{label,text,isCorrect}], explanation, difficulty, usedIn(practice|exam|both)
│       │   ├── Exam.js        # Template: title, examType(practice|formal), chapters[], questionCount, timeLimit, passingScore, maxAttempts
│       │   ├── PracticeAttempt.js  # Records full question data + selected answers + feedback
│       │   ├── ExamAttempt.js      # Records question refs + selected answers + pass/fail
│       │   └── Certificate.js      # certificateNumber(PMP-YYYY-NNNN), verificationToken(UUID), recipientName snapshot
│       ├── controllers/       # One per route file, business logic
│       │   ├── auth.controller.js       # register (domain check + verification code), login, verify-email, resend, logout, profile, password
│       │   ├── chapter.controller.js    # List chapters with progress, get chapter with topics
│       │   ├── topic.controller.js      # Get topic content, mark complete
│       │   ├── practice.controller.js   # Start (strips answers), submit (grades + feedback), history
│       │   ├── exam.controller.js       # Start (strips answers), submit (grades, NO feedback, generates cert if pass), history
│       │   ├── certificate.controller.js # List certs, download PDF
│       │   ├── verify.controller.js     # Public: verify cert by token
│       │   └── progress.controller.js   # Dashboard stats
│       ├── routes/            # Express routers, validation, middleware chains
│       ├── middleware/
│       │   ├── auth.middleware.js       # protect (JWT from cookie), requireVerified, adminOnly
│       │   ├── errorHandler.middleware.js # Catches Mongoose errors, formats responses
│       │   └── rateLimiter.middleware.js  # authLimiter (10/15min), verifyLimiter (30/15min)
│       ├── services/
│       │   ├── certificate.service.js  # PDFKit + QR code generation, landscape A4 layout
│       │   └── email.service.js        # Nodemailer, 6-digit code, HTML email template
│       └── seed/
│           ├── seedAll.js     # Clears DB then inserts chapters, topics, questions, exams
│           └── data/
│               ├── chapters.json              # 11 chapters
│               ├── topics/                    # 11 JSON files, 38 topics total
│               │   ├── ch01-1-topics.json     # Introduction to PM (4 topics)
│               │   ├── ch01-2-topics.json     # Performance Domains (4 topics)
│               │   ├── ch01-3-topics.json     # Tailoring, Models, Methods (3 topics)
│               │   ├── ch02-topics.json       # PM in the Organization (3 topics)
│               │   ├── ch03-topics.json       # Team Management (4 topics)
│               │   ├── ch05-topics.json       # Risk Management (4 topics)
│               │   ├── ch06-1-topics.json     # Estimation (3 topics)
│               │   ├── ch06-2-topics.json     # Scheduling and Tracking (4 topics)
│               │   ├── ch07-topics.json       # Quality Management (3 topics)
│               │   ├── ch08-topics.json       # Stakeholder Management (3 topics)
│               │   └── ch09-topics.json       # Change Management (3 topics)
│               └── questions/
│                   ├── questions-batch1.json   # 75 questions: CH01-1 to CH03 (15 each)
│                   └── questions-batch2.json   # 90 questions: CH05 to CH09 (15 each)
│
├── client/
│   ├── package.json
│   ├── vite.config.js         # Tailwind plugin + proxy /api -> localhost:5000
│   ├── index.html
│   └── src/
│       ├── main.jsx           # Entry: renders App with Tailwind CSS import
│       ├── App.jsx            # BrowserRouter + all routes
│       ├── styles/index.css   # Tailwind v4 directives (@import "tailwindcss")
│       ├── api/
│       │   ├── axiosInstance.js  # Base axios with /api prefix, withCredentials, 401 interceptor
│       │   └── authApi.js       # Auth endpoints including verifyEmail, resendVerification
│       ├── context/
│       │   └── AuthContext.jsx  # Provides user, login, register, logout, setUser
│       ├── components/layout/
│       │   ├── AppLayout.jsx    # Sidebar + Navbar + <Outlet>
│       │   ├── Sidebar.jsx      # Left nav with links + user section + logout
│       │   ├── Navbar.jsx       # Top bar (minimal)
│       │   └── ProtectedRoute.jsx # Redirects to /login if no user, /verify-email if unverified
│       └── pages/
│           ├── Landing.jsx        # Public homepage with features
│           ├── Login.jsx          # Redirects unverified users to /verify-email
│           ├── Register.jsx       # Validates @psu.edu.sa client-side, redirects to /verify-email
│           ├── VerifyEmail.jsx    # 6-digit code input, resend button
│           ├── Dashboard.jsx      # Stats cards, progress bar, quick actions
│           ├── ChapterList.jsx    # All chapters with topic lists and progress bars
│           ├── TopicView.jsx      # Topic content with Markdown rendering, breadcrumbs, prev/next nav
│           ├── PracticeList.jsx   # Available practice tests + history table
│           ├── PracticeTest.jsx   # Quiz UI: question navigator, answer selection, submit
│           ├── PracticeResult.jsx # Score + per-question review with correct/incorrect + explanations
│           ├── ExamList.jsx       # Available exams + history + 80% pass notice
│           ├── ExamTake.jsx       # Quiz UI with countdown timer, purple theme
│           ├── ExamResult.jsx     # Pass/fail display, certificate download if passed
│           ├── Certificates.jsx   # Certificate list with download + verify links
│           ├── VerifyCertificate.jsx # Public: shows valid/invalid badge from QR scan
│           └── Profile.jsx        # Update name, change password
│
├── course material/           # Source PDFs (slide-based, not auto-extractable)
│   ├── Ch01-1-Introduction.pdf
│   ├── Ch01-2-Project Performance Domains.pdf
│   ├── Ch01-3-Tailoring, Models, Methods, and Artifacts.pdf
│   ├── Ch02 - PM in the organization.pdf
│   ├── Ch03-Team.pdf
│   ├── Ch05-Risk Management.pdf
│   ├── Ch06-1-Estimation.pdf
│   ├── Ch06-2-Scheduling and Tracking.pdf
│   ├── Ch07-Quality.pdf
│   ├── Ch08-Stakeholders.pdf
│   └── Ch09-Change Management.pdf
│
└── sample questions/          # Reference exam PDFs (image-based)
    ├── PM exam 1.pdf
    └── PM exam 1 final.pdf
```

## API Routes

### Public (no auth)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register (restricted to @psu.edu.sa emails) |
| POST | `/api/auth/login` | Login, sets JWT cookie |
| GET | `/api/verify/:token` | Verify certificate by QR token (rate-limited) |

### Authenticated (requires JWT cookie)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/verify-email` | Submit 6-digit verification code |
| POST | `/api/auth/resend-verification` | Resend code (rate-limited) |
| PUT | `/api/auth/profile` | Update firstName/lastName |
| PUT | `/api/auth/change-password` | Change password |

### Authenticated + Verified Email (requires both)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/chapters` | List chapters with user's progress |
| GET | `/api/chapters/:id` | Chapter with topic list |
| GET | `/api/topics/:slug` | Full topic content |
| POST | `/api/topics/:id/complete` | Mark topic as completed |
| GET | `/api/practice/available` | List practice tests |
| POST | `/api/practice/start` | Start test (questions without answers) |
| POST | `/api/practice/submit` | Submit + receive feedback |
| GET | `/api/practice/history` | Past practice attempts |
| GET | `/api/practice/:attemptId` | Specific attempt with full review |
| GET | `/api/exams/available` | List formal exams |
| POST | `/api/exams/start` | Start exam (questions without answers) |
| POST | `/api/exams/submit` | Submit (score + pass/fail, NO feedback) |
| GET | `/api/exams/history` | Past exam attempts |
| GET | `/api/exams/:attemptId` | Specific attempt summary |
| GET | `/api/certificates` | User's certificates |
| GET | `/api/certificates/:id/download` | Download PDF |
| GET | `/api/progress/dashboard` | Dashboard stats |

## Database (MongoDB Atlas)

**Connection**: Via `MONGODB_URI` in `server/.env`. Database name: `pmp-learning`.

**Collections**: users, chapters, topics, questions, exams, practiceattempts, examattempts, certificates.

**Key relationships**:
- Chapter has many Topics (ObjectId array)
- Questions belong to a Chapter
- Exam template references Chapters (defines which question pool to draw from)
- PracticeAttempt/ExamAttempt belong to User and reference Exam
- Certificate belongs to User and references ExamAttempt

**Content in DB**: 11 chapters, 38 topics, 165 questions, 13 exam definitions (11 per-chapter practice + 1 comprehensive practice + 1 formal certification exam).

## Key Security Design Decisions

1. **Answer stripping**: The `start` endpoints NEVER send `isCorrect` or `explanation` to the client. Grading is server-side only.
2. **Formal exams**: No per-question feedback is ever returned, even after submission. Only score + pass/fail.
3. **JWT in HTTP-only cookies**: XSS cannot steal tokens. SameSite=Strict mitigates CSRF.
4. **Email domain restriction**: Only `@psu.edu.sa` can register. Enforced server-side in `auth.controller.js`.
5. **Email verification**: 6-digit code via SMTP, 10-minute expiry. Unverified users are blocked from all content routes by `requireVerified` middleware.
6. **Certificate verification**: UUID v4 tokens (122 bits entropy) make brute-force infeasible. Public endpoint is rate-limited.
7. **Exam integrity**: Questions shuffled server-side, options shuffled, random subset per student, timer validated server-side.

## Environment Variables (server/.env)

```
MONGODB_URI=mongodb+srv://...          # MongoDB Atlas connection string
JWT_SECRET=...                          # JWT signing secret
NODE_ENV=development                    # development or production
PORT=5000                               # Express server port
CLIENT_URL=http://localhost:5173        # Frontend URL (for CORS + QR code URLs)
SMTP_HOST=smtp.gmail.com               # Email server
SMTP_PORT=587                           # Email port
SMTP_USER=...@gmail.com                # Gmail address
SMTP_PASS=...                           # Google App Password (requires 2FA)
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install root + server + client dependencies |
| `npm run seed` | Clear and reseed the database with all content |
| `npm run dev` | Start both server (port 5000) and client (port 5173) |
| `npm run build` | Build client for production |
| `npm run server` | Start server only |
| `npm run client` | Start client only |

## Patterns and Conventions

- **Backend**: CommonJS (`require`/`module.exports`). Controller functions are `async` with `try/catch/next(error)`.
- **Frontend**: ES Modules. Functional components with hooks. No Redux — Context API for auth only.
- **Routing**: Express Router per domain. React Router v7 with nested routes under `AppLayout`.
- **Styling**: Tailwind CSS v4 utility classes. No component library. Indigo as primary color, purple for exams, green for practice.
- **Error handling**: Global `errorHandler` middleware catches Mongoose errors (CastError, ValidationError, duplicate key) and formats them.
- **Validation**: `express-validator` on routes. Client-side validation is UX only — server is the authority.
- **Seed data**: JSON files in `server/src/seed/data/`. Topic content uses Markdown in the `body` field, rendered with `react-markdown` on the client.

## Content Source

Topic summaries and questions were generated from 11 PDF course materials for the SE423 Software Project Management course. The PDFs are slide-based (images) so content was written based on the slide outlines and PMBOK knowledge. The `course material/` and `sample questions/` folders contain the original source PDFs for reference.

## What Is NOT Yet Built

- Admin CRUD panel for managing content/questions/exams through the UI
- Dashboard charts (Chart.js is installed but not yet integrated)
- Responsive mobile layout (sidebar doesn't collapse on small screens)
- Password reset / forgot password flow
- Exam resume (if browser closes mid-exam, the attempt cannot be resumed)
- Chapter 4 content (no Ch04 PDF was provided in the source materials)
