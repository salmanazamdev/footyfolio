# FootyFolio — "get scouted. get seen."

FootyFolio is a digital scouting platform built for amateur and local football (soccer) players in Pakistan and South Asia to showcase their talent to scouts and coaches.

Amateur players often lack a formal platform to document their performances. FootyFolio turns raw match statistics into structured, professional AI-generated scouting reports, and gives scouts and coaches a pre-filtered discovery feed to identify local prospects.

---

## 🎨 Theme & Design System

- **Theme Name:** "Pitch & Leather"
- **Color Palette:**
  - `pitch` (`#2D5D3F`): Deep muted green — primary brand color & player accent
  - `chalk` (`#F6F1E7`): Warm off-white background
  - `clay` (`#C9862E`): Ochre/amber — CTA buttons & scout accent
  - `charcoal` (`#1E1C19`): Near-black warm dark text
  - `stone` (`#8C8577`): Warm gray borders & secondary text
- **Typography:**
  - Headings: Google Font **Bitter** (bold serif)
  - Body: Google Font **Inter** (clean sans-serif)

---

## 🤖 AI Scouting Report System

### Overview
When a player logs match statistics (goals, assists, minutes played, opponent, and match notes), FootyFolio triggers a server-side route `/api/generate-report` calling Google Gemini (`gemini-3.6-flash`). The AI acts as an experienced football scout, analyzing match patterns to write an internal scouting dossier.

### System Prompt
```
You are an experienced football scout writing an internal scouting note about an amateur player, based on match stats and notes they've logged themselves.

You will be given:
- Player name, age, position, city
- A list of logged matches with goals, assists, minutes played, and any free-text notes

Write a scouting report with exactly this structure:
1. A 2-3 sentence player summary in a professional scouting tone — confident, specific, not generic praise. Reference actual patterns in the data (e.g. high goal involvement relative to minutes played, consistency across matches, etc.) rather than restating raw numbers.
2. "Strengths" — 2-3 short bullet points, each grounded in something specific from the data or notes provided. Do not invent skills not supported by the input.
3. "Areas to develop" — 1-2 honest, constructive bullet points. Avoid empty criticism; base this on gaps in the data (e.g. limited minutes, low involvement in certain match types) or reasonable inference from the position.
4. A one-line "verdict" — a single sentence a scout might write in a report margin, e.g. "Worth a closer look at trial stage" or "Promising for age group, needs more competitive minutes."

Tone: professional, direct, the way a real scout writes for other scouts to read quickly — not marketing copy, not overly encouraging, not harsh. If the data provided is very limited (e.g. only one match logged), acknowledge that briefly rather than overstating confidence.

Do not fabricate specific statistics that were not provided. Only reason from what's given.
```

---

## 🛠️ Environment Variables

Copy `.env.example` to `.env`:

```env
# GEMINI_API_KEY: Required for Gemini AI API calls (automatically injected in AI Studio)
GEMINI_API_KEY="your_gemini_api_key"

# APP_URL: The base URL of the hosted app
APP_URL="http://localhost:3000"
```

---

## 🗄️ Database Schema (Supabase / Postgres)

The app comes with an exportable Supabase SQL migration script in `src/lib/supabase.ts`.

### Tables:
1. `profiles`: `id (uuid, auth.users)`, `role ('talent' | 'scout')`, `name`, `age`, `city`, `created_at`
2. `talent_details`: `profile_id (fk)`, `position ('goalkeeper' | 'defender' | 'midfielder' | 'forward')`, `bio`
3. `matches`: `id`, `talent_profile_id (fk)`, `goals`, `assists`, `minutes_played`, `notes`, `match_date`, `created_at`
4. `scouting_reports`: `id`, `talent_profile_id (fk)`, `summary`, `strengths (text[])`, `areas_to_develop (text[])`, `verdict`, `generated_at`
5. `shortlists`: `id`, `scout_profile_id (fk)`, `talent_profile_id (fk)`, `created_at`

---

## 🚀 Quick Start & Scripts

```bash
# Development (Express + Vite on Port 3000)
npm run dev

# Production Build
npm run build

# Start Production Server
npm start
```
