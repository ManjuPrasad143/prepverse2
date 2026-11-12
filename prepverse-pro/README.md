# PrepVerse Pro

AI-powered placement & internship preparation platform, powered by Google Gemini.
Zero dependencies — plain Node.js server + vanilla JS front-end.

## Run locally

```bash
cd prepverse-pro
node server.js          # needs Node 18+
# open http://localhost:3000
```

The Gemini key lives in `.env` (`GEMINI_API_KEY=...`). It is read **only on the server**
(`lib/gemini.js`) and never sent to the browser.

## Deploy to Vercel

1. Push the folder to GitHub (`.env` is git-ignored).
2. Import the repo in Vercel → Settings → Environment Variables → add `GEMINI_API_KEY`.
3. Deploy. `/api/ai` and `/api/health` run as serverless functions; `public/` is served statically.

## Features

| Area | What you get |
|---|---|
| Dashboard | Readiness score, XP & levels, streaks, 18-week activity heatmap, daily challenge, 12 badges |
| AI Mock Interview | 6 interview types, company/role/difficulty, adaptive follow-ups, voice input + read-aloud, scored report with 360° radar, per-question feedback, history |
| Quizzes | 48 built-in questions (quant, reasoning, verbal, CS, DSA, code output), company-style mixes, practice & timed exam modes, AI-generated quizzes on any topic, AI explanations |
| Coding Arena | 12 problems, in-browser judge (Web Worker, 4 s timeout), AI hints / review / optimal approach |
| Question Bank | HR + core CS questions with key points, AI answer feedback, AI question generator |
| Flashcards | Spaced repetition (Again/Hard/Good/Easy), built-in decks, AI deck builder |
| Resume & ATS | Live resume builder, AI summary & bullet polish, print to PDF, keyword/format ATS check + deep AI analysis vs any JD |
| Cover Letter | Cover letters, cold emails, LinkedIn notes, follow-ups, referral requests |
| Application Tracker | Drag-and-drop kanban, follow-up dates, response-rate stats |
| Internship Finder | Smart search links (LinkedIn, Indeed, Internshala, Unstop), 12 curated portals, AI role matching |
| Company Hub | 10 company profiles + AI prep guide for any company, one-click company mock interview |
| Study Planner | AI week-by-week roadmap with checkable tasks |
| AI Career Coach | Chat mentor that knows your profile |
| Focus Timer | Pomodoro that earns XP and keeps running across pages |
| Profile | Personalisation, light/dark theme, export / import / reset data, AI connection test |
| Extras | Ctrl/Cmd+K command palette, responsive layout, print styles |

All progress is stored in your browser (`localStorage`). Use Profile → Export to back it up.

## Security note

Rotate your Gemini key if it was ever pasted anywhere public (chats, screenshots, git).
Create a new one at https://aistudio.google.com/apikey and update `.env` / Vercel.
