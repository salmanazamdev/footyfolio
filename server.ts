import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Endpoint for Scouting Report Generation
app.post('/api/generate-report', async (req, res) => {
  try {
    const { name, age, position, city, matches } = req.body;

    if (!name || !position || !matches || !Array.isArray(matches)) {
      return res.status(400).json({ error: 'Missing required player or match details.' });
    }

    const totalGoals = matches.reduce((acc: number, m: any) => acc + (Number(m.goals) || 0), 0);
    const totalAssists = matches.reduce((acc: number, m: any) => acc + (Number(m.assists) || 0), 0);
    const totalMinutes = matches.reduce((acc: number, m: any) => acc + (Number(m.minutesPlayed) || 0), 0);
    const matchCount = matches.length;

    const matchesSummary = matches.map((m: any, index: number) => 
      `Match ${index + 1} (${m.matchDate || 'Recent'}): ${m.minutesPlayed || 0} mins, ${m.goals || 0} goals, ${m.assists || 0} assists. Notes: ${m.notes || 'No specific notes.'}`
    ).join('\n');

    const promptText = `
Player Details:
- Name: ${name}
- Age: ${age}
- Position: ${position}
- City: ${city}

Total Stats Summary:
- Matches Logged: ${matchCount}
- Total Goals: ${totalGoals}
- Total Assists: ${totalAssists}
- Total Minutes Played: ${totalMinutes}

Individual Matches Logged:
${matchesSummary}
`;

    const ai = getGenAIClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
          config: {
            systemInstruction: `You are an experienced football scout writing an internal scouting note about an amateur player, based on match stats and notes they've logged themselves.

Write a scouting report with exactly this structure in JSON:
1. "summary": A 2-3 sentence player summary in a professional scouting tone — confident, specific, not generic praise. Reference actual patterns in the data (e.g. high goal involvement relative to minutes played, consistency across matches, positioning) rather than restating raw numbers.
2. "strengths": 2-3 short bullet points, each grounded in something specific from the data or notes provided. Do not invent skills not supported by the input.
3. "areasToDevelop": 1-2 honest, constructive bullet points. Base this on gaps in the data (e.g. limited minutes, low involvement in certain match types) or reasonable inference from the position.
4. "verdict": A single sentence a scout might write in a report margin, e.g. "Worth a closer look at trial stage" or "Promising for age group, needs more competitive minutes."

Tone: professional, direct, concise scout notes.
Do not fabricate specific statistics that were not provided. Only reason from what's given.`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                areasToDevelop: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                verdict: { type: Type.STRING }
              },
              required: ['summary', 'strengths', 'areasToDevelop', 'verdict']
            }
          }
        });

        if (response.text) {
          const parsedReport = JSON.parse(response.text.trim());
          return res.json({ report: parsedReport, source: 'gemini' });
        }
      } catch (geminiError: any) {
        console.log('[Scouting Engine] Using structured tactical fallback report generator.');
      }
    }

    // Smart Fallback Report Generator if API key missing or endpoint fails
    const goalRatio = totalMinutes > 0 ? (totalGoals / (totalMinutes / 90)).toFixed(1) : '0';
    const G_A_total = totalGoals + totalAssists;

    let summary = `${name} is a ${age}-year-old ${position} from ${city} who has logged ${matchCount} match ${matchCount === 1 ? 'session' : 'sessions'} (${totalMinutes} total minutes). `;
    if (position === 'forward' || position === 'midfielder') {
      if (G_A_total > 2) {
        summary += `Exhibits high attacking productivity with ${G_A_total} direct goal contributions, showing strong instinct in front of goal and active decision-making in transition phases.`;
      } else {
        summary += `Displays willingness to compete in intermediate zones, actively looking to connect plays and establish presence in key tactical areas.`;
      }
    } else if (position === 'defender') {
      summary += `Provides structured defensive organization and physical presence across logged appearances, maintaining composure under sustained pressure.`;
    } else {
      summary += `Demonstrates focus in goal with key shot-stopping moments logged under competitive game scenarios.`;
    }

    const strengths: string[] = [];
    if (totalGoals > 0) strengths.push(`Direct goal threat with ${totalGoals} goals recorded over recent matches.`);
    if (totalAssists > 0) strengths.push(`Vision and unselfish play in final third, accumulating ${totalAssists} assists.`);
    if (totalMinutes >= 80) strengths.push(`High stamina capacity, completing full-length match durations.`);
    if (strengths.length < 2) strengths.push(`Proactive work ethic and tactical engagement noted in player logs.`);
    if (strengths.length < 3) strengths.push(`Disciplined positional awareness fitting the ${position} role.`);

    const areasToDevelop: string[] = [];
    if (matchCount < 3) {
      areasToDevelop.push(`Limited dataset available (${matchCount} logged match) — requires consistent entry over 5+ fixtures to establish baseline.`);
    } else {
      areasToDevelop.push(`Maintaining high physical intensity into the final 15 minutes of competitive play.`);
    }
    areasToDevelop.push(`Refining left-foot distribution and composure under immediate high-pressing opponents.`);

    let verdict = matchCount < 2 
      ? `Promising early profile for ${age} age group; requires more competitive match logs for full scout evaluation.`
      : `Solid regional prospect in ${city}; worth inviting for an open trial session.`;

    return res.json({
      report: {
        summary,
        strengths: strengths.slice(0, 3),
        areasToDevelop: areasToDevelop.slice(0, 2),
        verdict
      },
      source: 'heuristic-fallback'
    });

  } catch (err: any) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate scouting report' });
  }
});

// Vite Middleware & Static Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FootyFolio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
