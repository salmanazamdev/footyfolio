<div align="center">

# 🏟️ FootyFolio

### Get Scouted. Get Seen.

**An AI-powered digital scouting platform for grassroots football players and talent scouts across Pakistan and South Asia.**

[![Live App](https://img.shields.io/badge/Live%20App-footyfolio.vercel.app-16A34A?style=for-the-badge)](https://footyfolio.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%203.6%20Flash-4285F4?style=for-the-badge&logo=googlegemini)](https://ai.google.dev)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

</div>

---

## 📌 The Problem

Across Pakistan and South Asia, thousands of grassroots football players compete every week in local leagues, street tournaments, and ground matches — with genuine talent going completely unnoticed. There's no centralized way to record performance or build a credible profile.

Meanwhile, scouts and academy coaches struggle to find players outside elite urban clubs. Scouting stays manual, word-of-mouth, and limited to whoever happens to be watching that day.

**FootyFolio** closes that gap: players turn their match stats into a professional, AI-generated scouting report — a digital football CV — and scouts get a real discovery feed to find them.

---

## 🌐 Live App

### 👉 [**footyfolio.vercel.app**](https://footyfolio.vercel.app)

Deployed on **Vercel**, fully functional, and ready for evaluation.

---

## ✨ Features

| | |
|---|---|
| 🎽 **Dual-role onboarding** | Choose Player or Scout at signup — each gets a tailored onboarding flow |
| 📊 **Match performance tracker** | Log goals, assists, minutes played, and match notes per game |
| 🤖 **AI scouting dossier** | Gemini-generated report: summary, strengths, areas to develop, and a scout's verdict |
| 🔍 **Scout discovery feed** | Browse and filter talent by position, city, and age |
| ⭐ **Shortlisting** | Scouts save prospects to a personal shortlist for follow-up |
| 🔐 **Real authentication** | Supabase email/password + Google OAuth, with persistent sessions |
| 📱 **Mobile-first design** | Built for the phone-first way most players and scouts will actually use it |

---

## 🖼️ Screenshots

<table>
<tr>
<td width="50%">

**Role Selection — Player or Scout**
<br>
![Onboarding screen letting a new user choose Player or Scout mode](docs/screenshots/role-selection.png)

</td>
<td width="50%">

**Player Profile — Full Match History**
<br>
![Player profile showing career stats and logged match history](docs/screenshots/player-profile.png)

</td>
</tr>
<tr>
<td width="50%">

**Logging a Match**
<br>
![Modal for logging match stats and tactical notes](docs/screenshots/log-match.png)

</td>
<td width="50%">

**AI-Generated Scouting Report**
<br>
![AI scouting report with executive summary, strengths, and development areas](docs/screenshots/ai-scouting-report.png)

</td>
</tr>
<tr>
<td colspan="2">

**Scout Discovery Feed**
<br>
![Scout dashboard showing filterable talent cards with tactical evaluations](docs/screenshots/scout-discovery.png)

</td>
</tr>
</table>

---

## 🤖 The AI Feature

Every time a player logs a match, FootyFolio sends their profile and match history to a server-side route (`/api/generate-report`), which calls **Google Gemini 3.6 Flash** with a structured system prompt and a strict JSON response schema — so the output is always well-formed and ready to render, not free-text.

<details>
<summary><strong>View the full system prompt</strong></summary>

```text
You are an experienced football scout writing an internal scouting note about an
amateur player, based on match stats and notes they've logged themselves.

Write a scouting report with exactly this structure in JSON:

1. "summary": A 2-3 sentence player summary in a professional scouting tone —
   confident, specific, not generic praise. Reference actual patterns in the data
   (e.g. high goal involvement relative to minutes played, consistency across
   matches, positioning) rather than restating raw numbers.

2. "strengths": 2-3 short bullet points, each grounded in something specific from
   the data or notes provided. Do not invent skills not supported by the input.

3. "areasToDevelop": 1-2 honest, constructive bullet points, based on gaps in the
   data (e.g. limited minutes, low involvement in certain match types) or
   reasonable inference from the position.

4. "verdict": A single sentence a scout might write in a report margin, e.g.
   "Worth a closer look at trial stage" or "Promising for age group, needs more
   competitive minutes."

Tone: professional, direct, concise scout notes.
Do not fabricate specific statistics that were not provided. Only reason from
what's given.
```

**Enforced response schema:**

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

</details>

---

## 🛠️ Built With

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **AI** | Google Gemini 3.6 Flash (`@google/genai`) |
| **Database & Auth** | Supabase (Postgres, Row Level Security, `@supabase/ssr`) |
| **Styling** | Tailwind CSS v4, Lucide Icons, Motion |
| **Deployment** | Vercel |

---

## 🚀 Run It Locally

**Prerequisites:** Node.js 20+, npm

```bash
# 1. Clone and install
git clone https://github.com/salmanazamdev/footyfolio
cd footyfolio
npm install

# 2. Configure environment variables — create a .env file:
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
GEMINI_API_KEY="your-gemini-api-key"

# 3. Run the dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

**Production build:**
```bash
npm run build
npm start
```

---

## 🗄️ Database Schema

Full migration script at [`schema.sql`](./schema.sql).

| Table | Purpose |
|---|---|
| `profiles` | User ID, role (`talent` / `scout`), name, age, city, onboarding status |
| `talent_details` | Position, preferred foot, bio |
| `matches` | Per-match stats: opponent, goals, assists, minutes, notes, date |
| `scouting_reports` | AI-generated dossiers linked to each player |
| `scout_preferences` | A scout's default search filters |
| `shortlists` | Saved prospects per scout |

Row Level Security is enabled on every table — players can only write their own data, scouts can browse talent profiles but only manage their own shortlist.

---

<div align="center">

*FootyFolio — helping grassroots football talent get seen.*

</div>
