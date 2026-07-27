# FootyFolio — Digital Football Scouting & Talent Portfolio Platform

> **"Get Scouted. Get Seen."**  
> A full-stack, AI-powered digital scouting platform built for grassroots football (soccer) players and talent scouts in Pakistan and South Asia.

---

## 📌 Project Overview & Problem Solved

### The Problem
In South Asia and emerging football regions, millions of passionate grassroots players perform weekly in local leagues, street tournaments, and ground matches. However, **over 95% of these players have zero centralized digital record or scouting network** to showcase their stats and talent. 

At the same time, talent scouts, academy coaches, and local club directors face immense difficulty discovering talent outside elite urban academies. Scouting is currently manual, fragmented, and heavily reliant on word-of-mouth recommendations, leaving high-potential players unnoticed.

### The Solution: FootyFolio
**FootyFolio** bridges this gap by giving amateur players a professional digital portfolio to record match performances, track progress, and generate **AI-driven scouting dossiers**. Scouts gain access to a filtered discovery feed, allowing them to search prospects by position, city, and performance stats, and shortlist candidates for trial invitations.

---

## 🌐 Live Application Link

- **Live Deployed URL:** [https://footyfolio.vercel.app](https://footyfolio.vercel.app)
- **Status:** Live, fully functional, and ready for evaluation.

---

## ✨ Complete Features List

### 1. Dual-Persona Role Selection & Onboarding
- **Talent Mode**: Designed for players to build a digital football resume, record match statistics, and view AI scouting evaluations.
- **Scout Mode**: Designed for talent scouts and coaches to browse player profiles, filter by tactical positions, and build shortlist rosters.

### 2. Match Performance Tracker & Log Sheet
- Log individual match statistics: opponent name, goals scored, assists, minutes played, match date, and free-text tactical notes.
- Instant aggregate statistics calculation (Total Goals, Assists, Goal Contributions per 90, Minutes Played).

### 3. AI-Powered Scouting Dossier Generator
- Server-side integration with **Google Gemini 3.6 Flash** (`@google/genai`).
- Generates professional scouting notes based on logged match data and player notes.
- Produces structured JSON output containing:
  - **Player Executive Summary**: Tactical overview in professional scout tone.
  - **Tactical Strengths**: Key attributes backed by logged match evidence.
  - **Areas to Develop**: Constructive development feedback and dataset gaps.
  - **Scout Margin Verdict**: One-line scout verdict (e.g., *"Worth inviting for open trial"*).

### 4. Scout Discovery Feed & Prospect Filtering
- Browse all registered talent with position filters (**Forward, Midfielder, Defender, Goalkeeper**).
- Search and filter by city and age groups.
- One-click **Shortlist Management** for scouts to organize top prospects.

### 5. Seamless Authentication with Demo Session Fallback
- Full support for **Supabase Authentication** (Email/Password & Google Sign-In via OAuth redirect).
- Includes automatic local session fallback so evaluators can instantly test all features without requiring external database setup.

### 6. "Pitch & Leather" Design System
- Tailored football-inspired theme using warm pitch greens, chalk backgrounds, and clay accents.
- Responsive design crafted with Tailwind CSS v4 and interactive micro-animations via Motion.

---

## 🤖 The AI Feature & System Prompt

### How It Works
When a player requests a scouting report or logs new match statistics, FootyFolio sends the player's profile data and match log history to a server-side API route (`/api/generate-report`). The backend calls **Google Gemini 3.6 Flash** with a structured system prompt and strict JSON schema enforcement.

### System Prompt (`/src/app/api/generate-report/route.ts`)

```text
You are an experienced football scout writing an internal scouting note about an amateur player, based on match stats and notes they've logged themselves.

Write a scouting report with exactly this structure in JSON:
1. "summary": A 2-3 sentence player summary in a professional scouting tone — confident, specific, not generic praise. Reference actual patterns in the data (e.g. high goal involvement relative to minutes played, consistency across matches, positioning) rather than restating raw numbers.
2. "strengths": 2-3 short bullet points, each grounded in something specific from the data or notes provided. Do not invent skills not supported by the input.
3. "areasToDevelop": 1-2 honest, constructive bullet points. Base this on gaps in the data (e.g. limited minutes, low involvement in certain match types) or reasonable inference from the position.
4. "verdict": A single sentence a scout might write in a report margin, e.g. "Worth a closer look at trial stage" or "Promising for age group, needs more competitive minutes."

Tone: professional, direct, concise scout notes.
Do not fabricate specific statistics that were not provided. Only reason from what's given.
```

### Response Schema Enforcement
```json
{
  "type": "OBJECT",
  "properties": {
    "summary": { "type": "STRING" },
    "strengths": { "type": "ARRAY", "items": { "type": "STRING" } },
    "areasToDevelop": { "type": "ARRAY", "items": { "type": "STRING" } },
    "verdict": { "type": "STRING" }
  },
  "required": ["summary", "strengths", "areasToDevelop", "verdict"]
}
```

---

## 🛠️ Tools, Services, and Technologies Used

- **Frontend & App Framework**: Next.js 16 (App Router), React 19, TypeScript
- **AI Infrastructure**: Google Gemini 3.6 Flash (`@google/genai` SDK)
- **Backend & Database**: Supabase (`@supabase/ssr`, PostgreSQL database schema)
- **Styling & UI**: Tailwind CSS v4, Lucide React Icons, Motion (Framer Motion)
- **Deployment Platform**: Cloud Run / AI Studio Platform

---

## 📸 App Interface Overview

Here are the key views of FootyFolio in action:

1. **Player Dashboard & AI Scouting Dossier**  
   *Displays player profile headers, accumulated match statistics, and the AI-generated scout report with strengths, development areas, and scout margin verdict.*

2. **Match Performance Logger**  
   *Interactive form where players input match details, stats, and performance notes to update their digital portfolio.*

3. **Scout Discovery Feed & Prospect Filtering**  
   *Scouts browse talent cards filtered by tactical position, city, and stats with one-click shortlisting.*

---

## 🚀 How to Run the Project Locally

### Prerequisites
- Node.js 20+ and npm

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/salmanazamdev/footyfolio
cd footyfolio
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root (reference `.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📊 Database Schema (Supabase / Postgres)

The project includes ready-to-run PostgreSQL migrations (`schema.sql`):
- `profiles`: User IDs, roles (`talent` / `scout`), full name, age, city, onboarding status.
- `talent_details`: Position, preferred foot, primary club/academy, bio.
- `matches`: Match logs with opponent, goals, assists, minutes, notes, and match date.
- `scouting_reports`: AI scouting dossier history linked to player profiles.
- `scout_preferences` & `shortlists`: Scout filtering settings and saved talent rosters.

---

*FootyFolio — Empowering Grassroots Footballers Through Technology & AI.*

