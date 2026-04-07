# MINDORA Project Overview & Description
*(Prepared for AI context/Prompt for generating a PowerPoint presentation)*

## 1. What is MINDORA?
MINDORA is a full-stack web application designed as a **Digital Distraction Analysis System (DDAS)** for students. It acts as an intelligent study companion that tracks **verified focus time** versus total desk time, penalizing distractions in real-time, and generating detailed reports on study efficiency.

MINDORA aims to promote honest studying by giving users undeniable feedback on how much time they actually spent focusing, compared to how much time they spent distracted by other browser tabs.

---

## 2. Core Operational Modes
During session creation, the student must choose what kind of study session they are doing. This dictates how the system evaluates "focus":

### 🧠 Open Study Mode
- Intended for offline study or studying without a specific web resource.
- **Strict Monitoring:** The moment the user switches away from the MINDORA browser tab, the verified focus timer PAUSES, an interruption is counted, and a distraction is logged.
- To accrue focus time, the MINDORA tab must remain the active, visible tab.

### 📖 Tutorial Mode
- Intended for watching educational videos or reading articles.
- **Verification System:** The user inputs the URL of the resource they are studying. MINDORA's backend uses the **Google Gemini AI API** to analyze the webpage title and metadata to classify if it is genuinely educational (e.g., a YouTube Python tutorial = Yes; a YouTube Music Video = No).
- **Trust-Based Monitoring:** If verified, the system trusts the student. When the student switches tabs (presumably to view their tutorial), the focus timer *keeps ticking without pausing*.
- **The "Catch":** To ensure the student is actually studying, MINDORA uses periodic "Presence Checks" ("Still there? 👀" pop-ups). If the student ignores these popups because they are distracted by something else, they lose all focus time since the last check.

---

## 3. The New Mandatory Focus Break System (Recent Updates)
To prevent burnout and encourage healthy studying habits (similar to Pomodoro), MINDORA now enforces rest:

- **Duration Selection:** Users now choose a specific focus duration before starting a session (15, 30, or 40 minutes).
- **Hard Limit:** Continuous focus is capped at 40 minutes.
- **Mandatory Breaks:** Once a user accumulates 40 minutes of continuous verified focus, the session pauses, and the system **locks them out** for a mandatory 5-minute break on a dedicated `BreakPage`.
- **Resumption:** After the break timer expires, the user can resume their session or start a new one seamlessly. They cannot access focus pages while inside the break period.

---

## 4. Key Application Features

### 🌳 The Focus Forest (Gamification)
- Every session generates a tree in the user's "Forest".
- The size and health of the tree depend heavily on the **Efficiency Score** of the session `(Verified Focus Time / Total Wall Clock Time)`.
- >90% efficiency yields a "Master Tree", while <20% yields a mere "Sapling."
- Daily, Weekly, and Yearly views of the forest visually map out the student's study habits over time.

### 📊 Truth Report Cards (Post-Session Analytics)
- Once a session ends, the user gets a comprehensive report.
- Features dynamic Donut Charts comparing Focus vs Distractions.
- Breakdown of penalties: Tab Switches, Presence Check Failures.
- A hard-hitting **Verdict** message, ranging from "ABSOLUTE CHAMPION! 🏆" to "YOU WEREN'T STUDYING 💀".

### 🏆 Community & Leaderboards
- Users can view a GitHub-style heatmap of their focus routine.
- A point-based Leaderboard system ranks students over a 30-day rolling window based on a composite score of *total focus minutes* multiplied by their *efficiency score*.

---

## 5. Technology Stack
- **Frontend:** React 18, Vite, TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS v3 with dynamic CSS Variables (Support for "Midnight Ink" dark mode and "Warm Ivory" light mode)
- **Charts/Visuals:** Recharts & embedded SVGs
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB & Mongoose (Locally hosted or Atlas)
- **Authentication:** Custom JWT-based Auth heavily utilizing `httpOnly` secure cookies.
- **AI Integration:** Google Gemini API (`gemini-1.5-flash`) via `@google/generative-ai` for URL validation.

---

## 6. Real-Time Tracking Mechanisms (Under the Hood)
1. **Document Visibility API:** The frontend deeply integrates the `visibilitychange` event listener to evaluate if the tab is hidden or active.
2. **Dual-Clocks Strategy:** A "Wall Clock" tracks absolute time, while a separate "Focus Clock" pauses and plays based on the current mode and tab visibility. 
3. **Data Integrity on Exit:** Uses the `navigator.sendBeacon()` API when the page unloads/closes unexpectedly, guaranteeing session data isn't lost if the user hurriedly closes the browser.

---

## 7. Project Flow (For PPT Storyboarding)
- **Slide 1:** Project Title & Problem Statement (Students deceiving themselves about study efficiency)
- **Slide 2:** Solution Overview (MINDORA - Tracking true focus vs total time)
- **Slide 3:** Modes of Operation (Strict Open Study vs Trusted Tutorial Mode + Gemini API)
- **Slide 4:** Anti-Burnout / Break System (Selectable durations & mandatory Pomodoro-style stops)
- **Slide 5:** Accountability / Gamification (The Report Card & Focus Forest)
- **Slide 6:** Technology Architecture overview. 

*(Provide this entire document to the AI you are using to generate the PowerPoint slides!)*
