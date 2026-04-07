# MINDORA — Digital Distraction Analysis System (DDAS)
## Full Project Specification — Give this entire file to OpenCode

---

## 1. WHAT IS MINDORA?

A full-stack web app that tracks **verified focus time** vs total desk time for students.

**Core idea:**
- Student opens MINDORA in one browser tab → picks a subject → starts session
- Two clocks run simultaneously:
  - **Wall Clock** — counts total time from start (NEVER stops regardless of anything)
  - **Verified Focus Timer** — behaviour depends on session type (see below)
- Every N minutes → popup: "Still there? 👀" — must click to confirm presence
- Session ends → Truth Report Card shows exactly how focused the student was
- All sessions saved to MongoDB for history, forest, leaderboard

**TWO SESSION TYPES — this is the most important design decision:**

### 🧠 Open Study Mode
Student studies without a specific resource URL.
- MINDORA tab active → Focus Timer ticks ✅
- Student switches to ANY other tab → Focus Timer PAUSES ⏸, interruption counted ❌
- Switching away = distraction, no exceptions

### 📖 Tutorial Mode
Student pre-verifies an educational URL (e.g. a YouTube SQL tutorial, a GFG article) before starting.
- Because browsers CANNOT read what URLs are open in other tabs (browser security rule — no exceptions), MINDORA cannot spy on where the student goes.
- INSTEAD: the student made a commitment upfront by verifying their tutorial URL.
- **Tab switch in Tutorial Mode → Focus Timer KEEPS TICKING ✅ — student is trusted to be on their verified resource.**
- No interruption is counted for tab switches in Tutorial Mode.
- The presence check ("Still there? 👀") is the verification mechanism — if they fail it, that time is lost from verified focus.
- This is fair: if a student verifies an SQL tutorial then goes to Instagram, that's their dishonesty. The system trusts the commitment they made.

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 + CSS custom properties (CSS variables) |
| State | Zustand |
| Charts | Recharts |
| HTTP | Axios (withCredentials: true for cookies) |
| Routing | React Router v6 |
| Backend | Node.js + Express + TypeScript |
| Database | **MongoDB + Mongoose** (NOT PostgreSQL) |
| Auth | JWT in httpOnly cookie + bcrypt (NO Google OAuth) |
| AI | Google Gemini API `gemini-1.5-flash` (free tier) |
| HTML parsing | `node-html-parser` (server-side) |
| Fonts | Google Fonts: DM Serif Display, Syne, JetBrains Mono |

---

## 3. ENVIRONMENT VARIABLES

### `server/.env`
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mindora
JWT_SECRET=make_this_very_long_and_random_string_here
GEMINI_API_KEY=your_gemini_api_key_from_aistudio
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=your@email.com
```

### `client/.env`
```
VITE_API_BASE_URL=http://localhost:3001
```

---

## 4. PROJECT STRUCTURE

```
FIELD PROJECT/
├── client/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── types/index.ts
│       ├── lib/
│       │   ├── api.ts
│       │   └── utils.ts
│       ├── store/
│       │   ├── authStore.ts
│       │   ├── sessionStore.ts
│       │   └── themeStore.ts
│       ├── hooks/
│       │   └── useSession.ts
│       ├── components/
│       │   ├── SplashScreen.tsx
│       │   ├── Navbar.tsx
│       │   ├── ThemeToggle.tsx
│       │   ├── TreeSVG.tsx
│       │   ├── AvatarSVG.tsx
│       │   ├── PresenceModal.tsx
│       │   └── SubjectCard.tsx
│       └── pages/
│           ├── LoginPage.tsx
│           ├── OnboardingPage.tsx
│           ├── HomePage.tsx
│           ├── FocusModePage.tsx
│           ├── PostSessionPage.tsx
│           ├── FocusRoomPage.tsx
│           ├── MyForestPage.tsx
│           ├── CommunityPage.tsx
│           └── SettingsPage.tsx
│
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── .env
    ├── .env.example
    └── src/
        ├── index.ts
        ├── lib/
        │   └── gemini.ts
        ├── middleware/
        │   ├── auth.ts
        │   └── adminOnly.ts
        ├── models/
        │   ├── User.ts
        │   └── Session.ts
        └── routes/
            ├── auth.ts
            ├── user.ts
            ├── sessions.ts
            ├── verifyUrl.ts
            ├── forest.ts
            ├── community.ts
            └── admin.ts
```

---

## 5. DESIGN SYSTEM

### Color Themes (CSS Variables on `<html data-theme="...">`)

**Midnight Ink — DEFAULT dark theme:**
```css
[data-theme="midnight-ink"] {
  --bg-primary:   #0b0e1a;
  --bg-surface:   #131726;
  --bg-card:      #1a1f35;
  --accent:       #00e5a0;
  --accent-dim:   rgba(0,229,160,0.12);
  --text-primary: #e8eaf0;
  --text-muted:   #7a8499;
  --danger:       #ff4d6d;
  --warn:         #f59e0b;
  --border:       #2a2f45;
}
```

**Warm Ivory — light theme:**
```css
[data-theme="warm-ivory"] {
  --bg-primary:   #f7f4ee;
  --bg-surface:   #edeae0;
  --bg-card:      #e3dfd5;
  --accent:       #1e6b3a;
  --accent-dim:   rgba(30,107,58,0.12);
  --text-primary: #1a1a1a;
  --text-muted:   #5a5a5a;
  --danger:       #c0392b;
  --warn:         #d97706;
  --border:       #ccc8be;
}
```

### Fonts
Load in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```
- `DM Serif Display` → logo, big headings
- `Syne` → all body text, labels, nav links
- `JetBrains Mono` → timers, numbers, code

### Design Language
- Cards: `backdrop-filter: blur(12px)` + semi-transparent bg (frosted glass)
- Glow on active elements: `box-shadow: 0 0 20px rgba(0,229,160,0.3)`
- All transitions: `300ms ease`
- Hover lift: `transform: translateY(-2px)`
- Border radius: `12px` cards, `8px` buttons, `6px` inputs

---

## 6. MONGODB MODELS

### User Model — `server/src/models/User.ts`
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;           // unique, lowercase, trimmed
  password: string;        // bcrypt hashed, never returned in responses
  role: 'user' | 'admin';
  avatarGender: 'male' | 'female' | 'neutral';
  subjects: string[];      // ["DSA", "Web Dev", "DBMS"]
  presenceIntervalMinutes: number;  // default: 10
  sensitivityLevel: 'low' | 'medium' | 'high';  // default: 'medium'
  totalSessions: number;
  totalFocusMinutes: number;
  streak: number;
  lastActiveDate: Date | null;
  onboardingComplete: boolean;  // set true after onboarding wizard
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatarGender: { type: String, enum: ['male', 'female', 'neutral'], default: 'neutral' },
  subjects: { type: [String], default: [] },
  presenceIntervalMinutes: { type: Number, default: 10 },
  sensitivityLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  totalSessions: { type: Number, default: 0 },
  totalFocusMinutes: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  onboardingComplete: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
```

**Auto-assign admin:** If `email === process.env.ADMIN_EMAIL` during register → set `role: 'admin'`

### Session Model — `server/src/models/Session.ts`
```typescript
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  isTutorial: boolean;
  tutorialUrl?: string;
  tutorialPlatform?: string;  // e.g. "YouTube", "GeeksForGeeks"

  startTime: Date;
  endTime?: Date;

  // All time values stored in SECONDS
  wallClockSeconds: number;      // total elapsed time start→end
  verifiedFocusSeconds: number;  // time MINDORA tab was active
  distractionSeconds: number;    // wallClock - verifiedFocus
  presenceFailSeconds: number;   // time lost to ignored presence checks

  tabSwitchCount: number;        // how many times tab went hidden
  presenceCheckCount: number;    // how many checks triggered
  presenceFailCount: number;     // how many checks were ignored/failed

  // Calculated server-side at session end:
  efficiencyScore: number;       // (verifiedFocus/wallClock)*100, 0-100
  verdict: 'champion' | 'good' | 'okay' | 'distracted' | 'not-focused';
  treeStage: 0 | 1 | 2 | 3 | 4 | 5;  // 0 = no session

  status: 'active' | 'completed' | 'abandoned';
}
```

---

## 7. ALL BACKEND API ENDPOINTS

**Base:** `http://localhost:3001/api`  
**Auth:** JWT stored in httpOnly cookie named `token`. Send `res.cookie('token', jwt, { httpOnly: true, sameSite: 'lax', maxAge: 7*24*60*60*1000 })`

---

### 7.1 Auth — `/api/auth`

**POST /api/auth/register**
- Body: `{ name, email, password }`
- Hash password: `bcrypt.hash(password, 10)`
- If email === ADMIN_EMAIL env var → role = 'admin'
- Sign JWT: `jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })`
- Set httpOnly cookie, return `{ user: { _id, name, email, role, onboardingComplete } }`

**POST /api/auth/login**
- Body: `{ email, password }`
- Find user, `bcrypt.compare(password, user.password)`
- Set cookie, return user object (no password field)

**POST /api/auth/logout**
- `res.clearCookie('token')`
- Return `{ message: 'Logged out' }`

**GET /api/auth/me** *(auth required)*
- Reads cookie, verifies JWT
- Returns full user object (minus password)

---

### 7.2 User — `/api/user` *(all auth required)*

**PATCH /api/user/profile**
- Body: `{ name?, avatarGender?, subjects?, presenceIntervalMinutes?, sensitivityLevel?, onboardingComplete? }`
- Updates user, returns updated user

**GET /api/user/onboarding-status**
- Returns `{ onboardingComplete: boolean }`

---

### 7.3 URL Verification — `/api/verify-url` *(auth required)*

**POST /api/verify-url**
- Body: `{ url: string }`

**IMPLEMENTATION — read carefully:**

```
Step 1: Validate URL format. If invalid → return error.

Step 2: Fetch page HTML server-side:
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MINDORA/1.0)' },
    signal: AbortSignal.timeout(8000)
  });
  const html = await res.text();

Step 3: Extract metadata using node-html-parser:
  - <title> tag → pageTitle
  - <meta property="og:title"> → ogTitle
  - <meta property="og:description"> → ogDescription
  - <meta name="description"> → metaDescription

  Use best available: ogTitle || pageTitle as title
  Use ogDescription || metaDescription as description

Step 4: Send to Gemini API (gemini-1.5-flash):

  Prompt:
  -------
  You are a strict educational content classifier for a student productivity app.

  A student wants to study using this resource:
  URL: {url}
  Page Title: {title}
  Description: {description}

  Classify whether this is GENUINELY educational content.

  EDUCATIONAL (isEducational: true):
  - Programming/CS tutorials, coding practice problems
  - Math, science, engineering lectures or articles
  - Academic documentation, textbooks, research papers
  - E-learning platforms (Coursera, NPTEL, Khan Academy, etc.)
  - YouTube videos with educational titles (SQL tutorial, DSA lecture, physics class, etc.)
  - Wikipedia, MDN, GeeksForGeeks, W3Schools articles
  - University course materials

  NOT EDUCATIONAL (isEducational: false):
  - Music videos, movies, entertainment
  - Social media (Instagram, Twitter, Facebook feeds)
  - Gaming, memes, vlogs
  - News, shopping, anything unrelated to studying

  IMPORTANT: Judge the SPECIFIC content, not the platform.
  "YouTube - SQL Full Course" = educational ✅
  "YouTube - Rick Astley Never Gonna Give You Up" = NOT educational ❌

  Respond ONLY with valid JSON, no markdown:
  {"isEducational": true/false, "platform": "platform name", "category": "subject category", "reason": "one line explanation"}
  -------

Step 5: Parse Gemini JSON response.

Step 6: If URL fetch fails (bot protection, timeout, CORS):
  → Fall back: send just the URL to Gemini without metadata
  → Use simpler prompt asking to classify based on domain + URL path only

Step 7: Return result.
```

**Responses:**
```json
// Success - educational
{ "verified": true, "platform": "YouTube", "category": "CS / Database", "reason": "Full SQL database course for beginners" }

// Success - not educational  
{ "verified": false, "platform": null, "reason": "U R LYING? This is not educational content." }

// Fetch failed, Gemini still classified
{ "verified": true, "platform": "GeeksForGeeks", "category": "CS", "reason": "Based on URL analysis" }

// Error
{ "verified": false, "platform": null, "reason": "Could not access this URL. Check the link and try again." }
```

---

### 7.4 Sessions — `/api/sessions` *(auth required)*

**POST /api/sessions**
- Body: `{ subject, isTutorial, tutorialUrl?, tutorialPlatform? }`
- Create session with `status: 'active'`, `startTime: new Date()`
- Return `{ sessionId: session._id, startTime }`

**PATCH /api/sessions/:id**
- Body:
```json
{
  "wallClockSeconds": 3600,
  "verifiedFocusSeconds": 2800,
  "distractionSeconds": 800,
  "presenceFailSeconds": 120,
  "tabSwitchCount": 5,
  "presenceCheckCount": 6,
  "presenceFailCount": 1,
  "status": "completed"
}
```
- Server calculates: `efficiencyScore = (verifiedFocusSeconds / wallClockSeconds) * 100`
- Server calculates verdict:
  - 90-100 → `champion`
  - 75-89 → `good`
  - 55-74 → `okay`
  - 35-54 → `distracted`
  - 0-34 → `not-focused`
- Server calculates treeStage:
  - 0-20 → 1 (sapling)
  - 21-50 → 2
  - 51-75 → 3
  - 76-95 → 4
  - 96-100 → 5 (master tree)
- Sets `endTime: new Date()`
- Updates user: `totalSessions += 1`, `totalFocusMinutes += verifiedFocusSeconds/60`
- Updates streak (see Section 10)
- Returns completed session object

**GET /api/sessions**
- Query: `?range=day|week|month` (default: week)
- Returns array of user's sessions in that date range

**GET /api/sessions/summary**
- Query: `?range=day|week|month`
- Returns:
```json
{
  "totalSessions": 12,
  "totalFocusMinutes": 480,
  "avgEfficiency": 73.5,
  "bestSubject": "DSA",
  "chartData": [
    { "date": "2026-04-01", "focusMinutes": 90, "efficiency": 82 }
  ]
}
```

---

### 7.5 Forest — `/api/forest` *(auth required)*

**GET /api/forest?view=week|month|year**

week response:
```json
{
  "view": "week",
  "days": [
    { "date": "2026-03-28", "treeStage": 4, "focusMinutes": 90, "efficiency": 82, "subject": "DSA" },
    { "date": "2026-03-29", "treeStage": 0, "focusMinutes": 0, "efficiency": 0, "subject": null }
  ]
}
```
`treeStage: 0` = no session that day.

month response: 30/31 entries with `{ date, focusMinutes }` for color intensity.

year response: 12 entries `{ month: "Jan", totalFocusMinutes: 600 }`.

---

### 7.6 Community — `/api/community` *(auth required)*

**GET /api/community/heatmap**
- 365 daily entries for current user: `[{ date: "2026-04-01", focusMinutes: 90 }]`

**GET /api/community/leaderboard**
- Score formula: `sum(verifiedFocusMinutes × efficiencyScore/100)` across last 30 days
- Mask emails: first 2 chars + `***` + last 2 chars of username
- Response:
```json
{
  "leaderboard": [
    { "rank": 1, "displayName": "su***bu", "score": 4320, "streak": 14, "avgEfficiency": 88, "isCurrentUser": false }
  ],
  "currentUserRank": 3
}
```

---

### 7.7 Admin — `/api/admin` *(auth + adminOnly middleware)*

**GET /api/admin/stats** — platform totals: users, sessions, focus hours, avg efficiency

**GET /api/admin/users** — full user list with session counts

**PATCH /api/admin/users/:id/role** — Body: `{ role: 'user' | 'admin' }`

**GET /api/admin/export** — returns CSV of all sessions (set Content-Type: text/csv)

---

## 8. FRONTEND — ALL PAGES & COMPONENTS

### 8.1 App.tsx — Routes
```
PUBLIC:
  /login        → LoginPage
  /register     → LoginPage (register mode)

PROTECTED (redirect to /login if not authenticated):
  /onboarding   → OnboardingPage  (shown once after first register)
  /             → HomePage
  /focus        → FocusModePage
  /post-session → PostSessionPage
  /focus-room   → FocusRoomPage
  /my-forest    → MyForestPage
  /community    → CommunityPage
  /settings     → SettingsPage
```

On app load:
1. Show `SplashScreen` for 2.8 seconds
2. Call `authStore.fetchMe()` → GET /api/auth/me
3. If authenticated + `!user.onboardingComplete` → redirect to `/onboarding`
4. Otherwise proceed to requested route

---

### 8.2 SplashScreen.tsx
Full-viewport overlay, bg = `var(--bg-primary)`, everything centered.

Animation sequence (CSS keyframes, use `animation-delay`):
1. **0ms**: `"hello world."` — font: Syne, color: `--text-muted`, fades up (opacity 0→1, translateY 20px→0, 1.2s ease)
2. **700ms**: `"MINDORA"` — font: DM Serif Display, large (5rem), color: `--accent`, fades in (0.8s)
3. **1400ms**: `"Digital Distraction Analysis System"` — font: Syne, small, `--text-muted`, fades in (0.6s)
4. **2800ms**: entire overlay fades out over 400ms, then `setShowSplash(false)`

---

### 8.3 Navbar.tsx
Fixed top, full width, `backdrop-filter: blur(16px)`, background: `var(--bg-surface)` at 80% opacity, border-bottom: `1px solid var(--border)`.

- **Left:** `MINDORA` in DM Serif Display → links to `/`
- **Center:** `MY FOREST` | `FOCUS ROOM` | `COMMUNITY` — font: Syne, uppercase, `letter-spacing: 2px`, separated by `|` dividers. Active = `color: var(--accent)` + 2px bottom border
- **Right:** `<ThemeToggle />` + user name chip (pill shape, `--bg-card` bg) + green dot (online indicator) + ⚙️ icon (→ `/settings`) + logout icon

---

### 8.4 ThemeToggle.tsx
Button with moon icon (dark mode) or sun icon (light mode). Click → `themeStore.toggleTheme()`. Smooth icon rotation animation. Store persists theme to localStorage.

---

### 8.5 LoginPage.tsx
Full screen, always forces Midnight Ink theme regardless of user setting.

Layout: centered card (max-width 420px), frosted glass.

- Big `MINDORA` — DM Serif Display, `--accent` color
- `"Digital Distraction Analysis System"` — Syne, small, muted
- Two tabs: `Sign In` | `Register` (underline style, switch between forms)

**Sign In form:** Email input, Password input, Submit button

**Register form:** Name, Email, Password, Confirm Password, Submit
- Validate passwords match client-side

On success → store user in authStore → if `!onboardingComplete` go to `/onboarding` else go to `/`

Show error message inline below the form (e.g., "Invalid credentials", "Email already registered")

---

### 8.6 OnboardingPage.tsx
3-step wizard. Progress dots at top showing current step.

**Step 1 — "Pick your avatar":**
- 3 large SVG character options side by side (male/female/neutral)
- Click to select (accent border + glow)

**Step 2 — "What do you study?":**
- Grid of subject tags. Pre-defined list:
  - DSA, Web Dev, DBMS, Operating Systems, Computer Networks, Machine Learning, Python, Java, C/C++, Mathematics, Physics, Chemistry, Biology, History, Economics, English
- Click to toggle selection (accent bg when selected)
- `+ Custom` input to add own subjects
- Must select at least 1

**Step 3 — "Set your preferences":**
- "How often should we check on you?" → Dropdown: Every 5 min / 10 min / 15 min / 20 min (default 10)
- "Sensitivity" → Radio: Low (gentle) / Medium (balanced) / High (strict)

**Finish button:** PATCH /api/user/profile with `{ avatarGender, subjects, presenceIntervalMinutes, sensitivityLevel, onboardingComplete: true }` → redirect to `/`

---

### 8.7 HomePage.tsx — Session Launcher
Layout: centered, max-width 720px, padding top for navbar.

**Header section:**
- `"Ready to focus?"` — DM Serif Display, large
- Today's date displayed below in muted text

**Subject picker:**
- Label: `"What are you studying today?"`
- Display user's saved subjects as clickable cards
- Each card: emoji + name (assign emoji per subject: DSA=💻, Web Dev=🌐, Maths=📐, Physics=⚡, etc.)
- Selected card: `--accent` border, `--accent-dim` background
- `+ Add Subject` ghost button at end

**Session type toggle:**
- Two radio-style buttons: `📖 Tutorial Mode` | `🧠 Open Study`
- Tutorial Mode: reveals a URL input section below
  - Input: "Paste your tutorial/resource URL here..."
  - `VERIFY URL` button
  - On click: shows spinner, calls POST /api/verify-url
  - Success state: green ✅ badge + platform name + category (e.g., "✅ YouTube — CS / Database Tutorial")
  - Fail state: red ❌ + "U R LYING? This is not educational content."
  - Loading state: spinner + "Verifying with AI..."

**BEGIN SESSION button:**
- Large, full-width, accent color, bold
- Disabled if: no subject selected, OR (Tutorial Mode + URL not verified)
- On click: POST /api/sessions → navigate to `/focus`

---

### 8.8 FocusModePage.tsx — The Core Page
**Two-column layout** (left 45%, right 55%)

**LEFT COLUMN:**
- `<AvatarSVG gender={user.avatarGender} />` — centered at top
- `<TreeSVG efficiency={liveEfficiency} isVisible={!wasJustDistracted} />` — grows as efficiency improves
- Labeled progress bar: `"Focus Efficiency"` — `(verifiedFocusSeconds/wallClockSeconds*100)`%
  - Green if >75%, amber if 50-75%, red if <50%
  - Animates smoothly as value changes

**RIGHT COLUMN:**
- Interruption badge: `⚡ {tabSwitchCount} interruptions` — red pill, pulses briefly on each new interruption
- Next check countdown: `"Next check in: 08:42"` — JetBrains Mono, muted small text
- **Main timer block:**
  ```
  VERIFIED FOCUS          ← Syne, uppercase, small, muted label
  01:23:45                ← JetBrains Mono, 5rem, --accent color
  
  TOTAL SESSION           ← Syne, uppercase, small, muted label
  01:45:00                ← JetBrains Mono, 2.5rem, muted color
  ```
- When tab is hidden: verified focus display shows `"PAUSED ●"` in `--danger` color with blinking dot
- Bottom: subject name + current date, muted small
- **Controls:**
  - `END SESSION` — danger color button
  - `PAUSE` — ghost button (manual pause, does NOT count as distraction)

**Tab visibility behavior (CRITICAL — TWO MODES BEHAVE DIFFERENTLY):**
```
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Tab became hidden (user switched away)
    if (isTutorial) {
      // TUTORIAL MODE: student is trusted to be on their verified resource
      // Focus Timer KEEPS TICKING — do NOT pause, do NOT count interruption
      // Just note the time for presence check scheduling
      setWasJustDistracted(false); // tree stays visible
    } else {
      // OPEN STUDY MODE: switching away = distraction
      clearInterval(focusInterval);       // pause verified focus timer
      tabSwitchCount++;                    // increment interruptions
      distractionStartTime = Date.now();  // track when distraction started
      setWasJustDistracted(true);         // hide tree (opacity 0)
    }
  } else {
    // Tab became visible again
    if (!isTutorial) {
      // OPEN STUDY MODE: resume focus timer on return
      distractionSeconds += (Date.now() - distractionStartTime) / 1000;
      focusInterval = setInterval(() => setVerifiedFocusSeconds(s => s+1), 1000);
      // Show tree again after 3 second delay
      setTimeout(() => setWasJustDistracted(false), 3000);
    }
    // Tutorial Mode: already ticking, nothing to resume
  }
});
```

**Presence check behavior:**
```
After presenceIntervalMinutes of wall clock time:
  → Show <PresenceModal />
  → If user clicks confirm within 30s: close modal, schedule next check
  → If 30s passes with no click: presenceFailCount++, 
    add 30s to presenceFailSeconds, close modal, schedule next check
```

**`<PresenceModal />`:**
- Full-screen dark backdrop (pointer-events: none on backdrop so it doesn't block clicks outside)
- Card: `"Still there? 👀"` heading
- Body: `"Tap to confirm you're still studying!"`
- SVG countdown ring (30 seconds, stroke-dasharray animation)
- Big green `"YES, I'M HERE ✓"` button
- If countdown hits 0: card flashes red, shows `"Presence check failed!"`, auto-closes

---

### 8.9 useSession.ts — Core Timer Hook
```typescript
// This hook is used inside FocusModePage
// It manages ALL timing and session state

// State:
// - wallClockSeconds: number (ALWAYS ticking, never stops)
// - verifiedFocusSeconds: number
//     Open Study Mode: only ticks when MINDORA tab is active
//     Tutorial Mode: ticks always (wall clock and focus clock are the same unless presence fails)
// - isTutorial: boolean (read from sessionStore)
// - tabSwitchCount: number (only incremented in Open Study Mode)
// - presenceCheckCount: number
// - presenceFailCount: number
// - presenceFailSeconds: number
// - isPresenceModalOpen: boolean
// - timeUntilNextCheck: number (countdown display)

// On mount:
// 1. wallClockInterval = setInterval every 1s — NEVER cleared until session end
// 2. If Open Study Mode: focusInterval = separate setInterval every 1s
//    If Tutorial Mode: DON'T start a separate focusInterval —
//    instead verifiedFocusSeconds just mirrors wallClockSeconds
//    (unless presence modal is open and fails)
// 3. document.addEventListener('visibilitychange', handler)
// 4. window.addEventListener('beforeunload', abandonHandler)
// 5. Schedule first presence check: setTimeout(triggerPresenceCheck, intervalMs)

// visibilitychange handler:
// - Open Study Mode hidden: clearInterval(focusInterval), tabSwitchCount++
// - Open Study Mode visible: restart focusInterval
// - Tutorial Mode: IGNORE visibility changes completely — timer never pauses

// Presence check (SAME in both modes):
// - Pause verifiedFocus timer during the 30s check window
// - If confirmed: resume, schedule next check
// - If failed (30s timeout): presenceFailCount++, presenceFailSeconds += 30, schedule next

// END SESSION flow:
// 1. Clear all intervals and event listeners
// 2. Calculate efficiencyScore = (verifiedFocusSeconds / wallClockSeconds) * 100
// 3. PATCH /api/sessions/:id with all final data, status: 'completed'
// 4. Store in sessionStore.completedSession
// 5. navigate('/post-session')

// beforeunload handler:
// navigator.sendBeacon('/api/sessions/:id', JSON.stringify({ status: 'abandoned', ...partialData }))
```

---

### 8.10 TreeSVG.tsx
Pure SVG component. Props: `efficiency: number` (0-100), `isVisible: boolean`.

| Efficiency | Stage | SVG Description |
|---|---|---|
| 0–20% | 1 — Sapling | Thin vertical rect (trunk only), 2 tiny oval leaves |
| 21–50% | 2 — Small | Trunk + small circle canopy |
| 51–75% | 3 — Medium | Trunk + larger canopy circle + 2 side branch lines |
| 76–95% | 4 — Full | Trunk + dense canopy + multiple branches + small leaf paths |
| 96–100% | 5 — Master | Full tree + gold 5-point star polygon at top + drop-shadow glow |

- Greens: `fill="var(--accent)"`
- Trunk: `fill="#6B3A1F"`
- `style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}`
- Transitions between stages with `transition: 'all 0.6s ease'` on SVG elements

---

### 8.11 AvatarSVG.tsx
Props: `gender: 'male' | 'female' | 'neutral'`

Simple SVG person:
- Head: circle
- Body: rounded rectangle
- Arms: two lines from sides of body
- Legs: two lines from bottom of body

Gender differences (hair):
- Male: 2-3 short line strokes on top of head circle
- Female: longer curved path flowing to shoulders, two small circles for earrings
- Neutral: simple clean circle, no hair detail

Colors use CSS vars. Scale-in animation on mount: `transform: scale(0)` → `scale(1)` over 0.6s ease-out.

---

### 8.12 PostSessionPage.tsx — Truth Report Card
Two-column layout.

**LEFT — Donut Chart (Recharts PieChart, innerRadius=60):**
- 3 data segments:
  - `name: "Verified Focus"`, value: verifiedFocusSeconds, color: `#00e5a0`
  - `name: "Distractions"`, value: distractionSeconds, color: `#ff4d6d`
  - `name: "Presence Fails"`, value: presenceFailSeconds, color: `#f59e0b`
- Custom center label: efficiency % in JetBrains Mono, large

**RIGHT — Report Card:**
```
📚  DSA
📅  3 April 2026, 10:30 AM
⏱   Total Session: 1h 45m
✅  Verified Focus: 1h 17m
❌  Tab Switches: 6 interruptions
😴  Presence Failures: 2 checks failed (8 min lost)

FOCUS EFFICIENCY
[===73%===] progress bar

┌─────────────────────────────────┐
│  VERDICT: DECENT SESSION 😐     │
│  "Room to improve."             │
└─────────────────────────────────┘
```

**Verdict messages:**
| Score | Verdict | Message |
|---|---|---|
| 90-100% | champion | `"ABSOLUTE CHAMPION! 🏆 You were completely locked in!"` |
| 75-89% | good | `"GREAT SESSION! 👍 Almost perfect focus."` |
| 55-74% | okay | `"DECENT SESSION 😐 Room to improve."` |
| 35-54% | distracted | `"YOU GOT DISTRACTED 😬 Try harder next time."` |
| 0-34% | not-focused | `"U WEREN'T STUDYING 💀 Be honest with yourself."` |

Verdict box background changes color to match (green/blue/amber/orange/red).

**Bottom buttons:**
- `"Save & Go Home"` → PATCH /api/sessions/:id if not already saved → navigate to `/`
- `"Study Again"` → navigate to `/` with same subject pre-selected in sessionStore

---

### 8.13 FocusRoomPage.tsx — Analytics Hub

**Top: Tab switcher** — `Day` | `Week` | `Month` (controls all data below)

**3 stat cards (horizontal row):**
- Total Sessions (this period)
- Total Focus Hours
- Avg Efficiency %

**Recharts BarChart:**
- X-axis: dates
- Y-axis: focus minutes
- Bars colored by efficiency: green (good), amber (okay), red (low)
- Hover tooltip: date, subject, focus time, efficiency

**Session table:**
| Date | Subject | Duration | Verified Focus | Efficiency | Verdict |
|---|---|---|---|---|---|
- Efficiency colored: ≥75 green, 50-74 amber, <50 red
- Verdict has colored badge
- Click row → expand details

**Empty state:** Large illustration placeholder + `"No sessions yet!"` + `"Start your first session →"` button

---

### 8.14 MyForestPage.tsx

**Tab bar:** `This Week` | `This Month` | `This Year`

**Weekly View (7-cell grid):**
- Mon–Sun, each cell contains a `<TreeSVG>` at appropriate stage
- Below each tree: day label (Mon, Tue...) + focus minutes
- Empty day: small flowerpot SVG (no tree, gray)
- Hover tooltip: date, subject, efficiency, focus time

**Monthly View (30/31 grid):**
- Small squares, 5×6 or 7×5 grid
- Color by focus minutes (5 intensity levels):
  - 0 min → `var(--border)` (empty gray)
  - 1–30 → `rgba(accent, 0.2)`
  - 31–60 → `rgba(accent, 0.4)`
  - 61–120 → `rgba(accent, 0.7)`
  - 120+ → `var(--accent)` (full color)
- Hover tooltip: date + minutes

**Yearly View:**
- Recharts BarChart, 12 bars (Jan–Dec)
- Height = total focus hours that month

---

### 8.15 CommunityPage.tsx

**GitHub-style Heatmap:**
- 52 columns × 7 rows = 364 cells (past year)
- Color = focus minutes that day (same 5-level scale)
- Month labels above: Jan, Feb, ... Dec
- Legend bottom-right: `Less ◻◻◻◻◻ More`
- Tooltip on hover: date + focus minutes

**Leaderboard table:**
| 🥇 | su***bu | Score: 4320 | 🔥 14 day streak | 88% avg |
- Top 3: gold/silver/bronze medal emoji
- Current user row: accent border, `(you)` tag next to name
- Scores are computed server-side from last 30 days

---

### 8.16 SettingsPage.tsx

**Left sidebar (tabs):**
- 👤 Profile
- 📚 Subjects
- 🔔 Preferences
- 🛡️ Admin ← only visible if `user.role === 'admin'`

**Profile tab:**
- Name (editable input)
- Email (read-only, muted)
- Avatar re-picker (3 SVG options, click to change)
- Save button → PATCH /api/user/profile

**Subjects tab:**
- Current subjects as removable chips (× to remove)
- Searchable list of pre-defined subjects to add
- Custom input for unlisted subjects
- Save button

**Preferences tab:**
- Presence check interval: Select dropdown (5/10/15/20 min)
- Sensitivity: Radio buttons (Low/Medium/High)
  - Low = only count tab switches >30s as distraction
  - Medium = count all tab switches
  - High = count all + highlight any pause >10s in report
- Save button → PATCH /api/user/profile

**Admin tab:**
- 4 platform stat cards: Total Users | Total Sessions | Total Focus Hours | Avg Efficiency
- User management table: name, email, role, sessions, focus hours, + role toggle button
- `📥 Download CSV` button → GET /api/admin/export

---

## 9. ZUSTAND STORES

### authStore.ts
```typescript
interface AuthState {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    avatarGender: 'male' | 'female' | 'neutral';
    subjects: string[];
    presenceIntervalMinutes: number;
    sensitivityLevel: 'low' | 'medium' | 'high';
    streak: number;
    onboardingComplete: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateUser: (data: Partial<AuthState['user']>) => void;
}
// fetchMe() is called on app load to restore session from cookie
```

### sessionStore.ts
```typescript
interface SessionState {
  // Set before session starts (on Home page)
  sessionId: string | null;
  subject: string;
  isTutorial: boolean;
  tutorialUrl: string;
  tutorialPlatform: string;
  tutorialUrlVerified: boolean;

  // Live values (updated every second by useSession hook)
  wallClockSeconds: number;
  verifiedFocusSeconds: number;
  tabSwitchCount: number;
  presenceCheckCount: number;
  presenceFailCount: number;
  presenceFailSeconds: number;

  // Stored after session ends (for PostSessionPage)
  completedSession: CompletedSession | null;

  // Actions
  startSession: (data: { sessionId, subject, isTutorial, tutorialUrl, tutorialPlatform }) => void;
  updateTimers: (data: Partial<SessionState>) => void;
  setCompletedSession: (data: CompletedSession) => void;
  resetSession: () => void;
}
```

### themeStore.ts
```typescript
interface ThemeState {
  theme: 'midnight-ink' | 'warm-ivory';
  toggleTheme: () => void;
}
// On init: read from localStorage, apply data-theme attribute to document.documentElement
// On toggle: switch theme, save to localStorage, apply attribute
```

---

## 10. KEY BUSINESS LOGIC

### Efficiency Score
```
efficiencyScore = Math.round((verifiedFocusSeconds / wallClockSeconds) * 1000) / 10
// e.g. 82.3%
// Capped at 100 if somehow exceeds
```

### Streak Calculation (server-side, on session complete)
```
todayDate = new Date().toDateString()
lastDate = user.lastActiveDate?.toDateString()

if lastDate === yesterday:
  user.streak += 1
else if lastDate === today:
  // already counted today, no change
else:
  user.streak = 1  // reset

user.lastActiveDate = new Date()
```

### Community Score
```
For each session in last 30 days:
  score += (session.verifiedFocusSeconds / 60) * (session.efficiencyScore / 100)
// = weighted focus minutes by quality
```

---

## 11. SERVER ENTRY POINT

### server/src/index.ts
```typescript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import userRouter from './routes/user';
import sessionsRouter from './routes/sessions';
import verifyUrlRouter from './routes/verifyUrl';
import forestRouter from './routes/forest';
import communityRouter from './routes/community';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,   // REQUIRED for cookies
  methods: ['GET','POST','PUT','PATCH','DELETE'],
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/verify-url', verifyUrlRouter);
app.use('/api/forest', forestRouter);
app.use('/api/community', communityRouter);
app.use('/api/admin', adminRouter);

mongoose.connect(process.env.MONGODB_URI!).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(Number(process.env.PORT) || 3001, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3001}`);
  });
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});
```

### server/src/middleware/auth.ts
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### server/src/middleware/adminOnly.ts
```typescript
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};
```

### server/src/lib/gemini.ts
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function classifyUrlWithMetadata(
  url: string,
  title: string,
  description: string
): Promise<{ isEducational: boolean; platform: string; category: string; reason: string }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a strict educational content classifier for a student productivity app.

A student wants to study using this resource:
URL: ${url}
Page Title: ${title}
Description: ${description}

Is this GENUINELY educational? Judge the specific content, not just the platform.
"YouTube - SQL Full Course" = educational. "YouTube - Rick Astley" = NOT educational.

Educational: tutorials, CS courses, math/science, coding practice, documentation, lectures, Wikipedia, e-learning.
Not educational: music, entertainment, social media, gaming, news, shopping.

Respond ONLY with valid JSON (no markdown, no code blocks):
{"isEducational": true, "platform": "YouTube", "category": "CS / Database", "reason": "Full SQL course for beginners"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip any markdown code fences if present
    const clean = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    return { isEducational: false, platform: '', category: '', reason: 'Classification failed' };
  }
}

export async function classifyUrlFallback(
  url: string
): Promise<{ isEducational: boolean; platform: string; category: string; reason: string }> {
  // Used when page fetch fails — classify based on URL alone
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Is this URL educational? URL: ${url}
Respond ONLY with JSON: {"isEducational": true/false, "platform": "string", "category": "string", "reason": "string"}`;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(text);
  } catch {
    return { isEducational: false, platform: '', category: '', reason: 'Could not classify URL' };
  }
}
```

---

## 12. CLIENT SETUP FILES

### client/vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
```

### client/src/lib/api.ts
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,  // sends httpOnly cookie automatically
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Clear auth state and redirect
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## 13. DEPENDENCIES

### Server — package.json dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.2.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.1",
    "@google/generative-ai": "^0.17.0",
    "node-html-parser": "^6.1.13"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.11.5",
    "ts-node-dev": "^2.0.0"
  },
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Server — tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Client — package.json dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.7",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17",
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@types/node": "^20.11.5"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## 14. HOW TO RUN

```bash
# PREREQUISITES:
# 1. MongoDB — either install locally OR create free Atlas cluster at mongodb.com/atlas
# 2. Gemini API key — free at aistudio.google.com/app/apikey

# === SERVER ===
cd server
npm install
# Copy .env.example to .env and fill in values
npm run dev
# Server runs at http://localhost:3001

# === CLIENT (new terminal) ===
cd client
npm install
npm run dev
# Frontend runs at http://localhost:5173

# === FIRST TIME SETUP ===
# Register with the email you set as ADMIN_EMAIL in server/.env
# That account gets admin role automatically
```

---

## 15. CRITICAL NOTES FOR THE BUILDER

1. **Tab visibility** — Uses native `document.visibilitychange` event. No library. When `document.hidden === true`, the MINDORA tab is not visible (user switched to another tab OR minimized browser).

2. **Two independent timers** — wallClock interval NEVER pauses. verifiedFocus interval is clearInterval'd and restarted on visibility changes. Both use `setInterval(fn, 1000)`.

3. **JWT cookie** — Server sets `httpOnly: true` cookie. Client NEVER reads it directly. All API calls must have `withCredentials: true` (Axios) so browser sends cookie automatically.

4. **Gemini URL verification** — First fetches the actual page HTML to get real title/description. Passes that rich context to Gemini. If page fetch fails (site blocks bots), falls back to URL-only classification. This enables video-level YouTube classification without YouTubeDataAPI.

5. **MongoDB** — No Prisma, no PostgreSQL. Pure Mongoose with TypeScript interfaces as shown in Section 6.

6. **No websockets** — All real-time updates are client-side state (React/Zustand). Server is only called to save/load data.

7. **Admin role** — First user registered with the ADMIN_EMAIL env variable gets `role: 'admin'` automatically. No manual DB edits needed.

8. **Presence check timing** — Based on wall clock time (total elapsed), NOT verified focus time. So if student does 10-minute intervals and is distracted for 3 minutes, check still triggers at 10 minutes wall clock.

9. **beforeunload** — Use `navigator.sendBeacon()` to save partial session data when page closes mid-session. Regular fetch/axios won't work reliably in beforeunload.

10. **TreeSVG** — Pure inline SVG. No images, no external assets. All shapes use CSS variable colors.
