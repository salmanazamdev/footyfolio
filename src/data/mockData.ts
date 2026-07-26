import { TalentProfile, ScoutProfile } from '../types';

export const INITIAL_TALENT_PROFILES: TalentProfile[] = [
  {
    id: 'talent-1',
    userId: 'user-1',
    name: 'Hamza Khan',
    age: 19,
    position: 'forward',
    city: 'Lahore',
    bio: 'Pacey central striker with sharp movement off the ball. Playing for Model Town FC in Lahore division.',
    preferredFoot: 'Right',
    shortlistedBy: ['scout-1', 'scout-2'],
    createdAt: '2026-05-10T10:00:00Z',
    matches: [
      {
        id: 'm-101',
        talentProfileId: 'talent-1',
        goals: 2,
        assists: 1,
        minutesPlayed: 85,
        notes: 'Played striker against Gulberg United. Won 3-1. Scored one header and one clinical finish inside the box.',
        matchDate: '2026-07-20',
        opponent: 'Gulberg United',
        result: '3-1 Win'
      },
      {
        id: 'm-102',
        talentProfileId: 'talent-1',
        goals: 1,
        assists: 0,
        minutesPlayed: 90,
        notes: 'High pressing game vs Defence FC. Scored counter-attack goal in 72nd min.',
        matchDate: '2026-07-12',
        opponent: 'Defence FC',
        result: '1-0 Win'
      },
      {
        id: 'm-103',
        talentProfileId: 'talent-1',
        goals: 0,
        assists: 2,
        minutesPlayed: 75,
        notes: 'Operated on right wing due to tactical shift. Created both goals with low crosses into the 6-yard box.',
        matchDate: '2026-07-04',
        opponent: 'Johar Town Royals',
        result: '2-2 Draw'
      }
    ],
    latestReport: {
      id: 'rep-1',
      talentProfileId: 'talent-1',
      summary: 'Hamza Khan demonstrates high goal-involvement efficiency (3 goals, 3 assists in 250 minutes). His off-the-ball runs and versatility across the front line make him a constant threat in transition play.',
      strengths: [
        'Clinical finishing inside the 18-yard box with a strong conversion rate.',
        'Intelligent lateral runs to stretch opponent defensive lines.',
        'Effective crossing from wide areas when drifting to the right flank.'
      ],
      areasToDevelop: [
        'Sustaining high-intensity pressing beyond 75 minutes.',
        'Physical aerial duels against taller central defenders.'
      ],
      verdict: 'High-potential attacking prospect for regional academy trials; displays mature tactical awareness.',
      generatedAt: '2026-07-21T12:00:00Z'
    }
  },
  {
    id: 'talent-2',
    userId: 'user-2',
    name: 'Zain Ul Abideen',
    age: 21,
    position: 'midfielder',
    city: 'Karachi',
    bio: 'Deep-lying playmaker with exceptional vision and pass distribution. Karachi Premier League standout.',
    preferredFoot: 'Left',
    shortlistedBy: ['scout-1'],
    createdAt: '2026-05-14T11:30:00Z',
    matches: [
      {
        id: 'm-201',
        talentProfileId: 'talent-2',
        goals: 0,
        assists: 2,
        minutesPlayed: 90,
        notes: 'Controlled tempo against Lyari Strikers. 88% pass completion, set up winning goal from a deep free-kick.',
        matchDate: '2026-07-22',
        opponent: 'Lyari Strikers',
        result: '2-1 Win'
      },
      {
        id: 'm-202',
        talentProfileId: 'talent-2',
        goals: 1,
        assists: 1,
        minutesPlayed: 90,
        notes: 'Played as number 8. Scored long-range shot from outside the penalty area.',
        matchDate: '2026-07-15',
        opponent: 'Clifton Youth FC',
        result: '4-0 Win'
      }
    ],
    latestReport: {
      id: 'rep-2',
      talentProfileId: 'talent-2',
      summary: 'Zain is a technically gifted central midfielder who excels at dictating game tempo from deep positions. His set-piece delivery and progressive passes through the lines consistently break down low blocks.',
      strengths: [
        'Exceptional vision and range of passing over medium-to-long distances.',
        'Calm under high defensive pressure in central zones.',
        'Dangerous set-piece execution from dead-ball situations.'
      ],
      areasToDevelop: [
        'Defensive mobility and recovery speed when defending quick counter-attacks.',
        'Increasing box-to-box stamina in hot weather conditions.'
      ],
      verdict: 'Ready for higher-tier competitive league trials; central control is top tier for amateur level.',
      generatedAt: '2026-07-23T09:15:00Z'
    }
  },
  {
    id: 'talent-3',
    userId: 'user-3',
    name: 'Bilal Chaudhry',
    age: 18,
    position: 'defender',
    city: 'Islamabad',
    bio: 'Strong centre-back with dominant aerial presence and clean tackling record in local youth tournaments.',
    preferredFoot: 'Right',
    shortlistedBy: [],
    createdAt: '2026-06-01T14:00:00Z',
    matches: [
      {
        id: 'm-301',
        talentProfileId: 'talent-3',
        goals: 1,
        assists: 0,
        minutesPlayed: 90,
        notes: 'Clean sheet against Rawalpindi Lions. Scored powering header from corner kick.',
        matchDate: '2026-07-19',
        opponent: 'Rawalpindi Lions',
        result: '1-0 Win'
      },
      {
        id: 'm-302',
        talentProfileId: 'talent-3',
        goals: 0,
        assists: 0,
        minutesPlayed: 90,
        notes: 'Made 6 clearances and 4 ball recoveries against F-8 Falcons.',
        matchDate: '2026-07-11',
        opponent: 'F-8 Falcons',
        result: '0-0 Draw'
      }
    ],
    latestReport: {
      id: 'rep-3',
      talentProfileId: 'talent-3',
      summary: 'Bilal Chaudhry is a physically imposing 18-year-old central defender with strong fundamental defending skills. He excels in aerial duels and maintains clean positioning during sustained defensive phases.',
      strengths: [
        'Aerial dominance both defensively and in opposition penalty box.',
        'Disciplined slide and standing tackles without conceding needless fouls.',
        'Good communication and defensive line leadership.'
      ],
      areasToDevelop: [
        'Building play out from the back with left foot under pressure.',
        'Agility when turned by quick, agile wingers.'
      ],
      verdict: 'Raw defensive talent with huge physical ceiling; ideal candidate for club development squad.',
      generatedAt: '2026-07-20T16:00:00Z'
    }
  },
  {
    id: 'talent-4',
    userId: 'user-4',
    name: 'Usman Ali',
    age: 20,
    position: 'goalkeeper',
    city: 'Peshawar',
    bio: 'Agile shot-stopper with explosive reflexes and confident box command.',
    preferredFoot: 'Right',
    shortlistedBy: ['scout-2'],
    createdAt: '2026-06-08T08:00:00Z',
    matches: [
      {
        id: 'm-401',
        talentProfileId: 'talent-4',
        goals: 0,
        assists: 0,
        minutesPlayed: 90,
        notes: 'Saved a penalty in 84th minute vs Hayatabad Stars. Made 7 key saves.',
        matchDate: '2026-07-18',
        opponent: 'Hayatabad Stars',
        result: '2-1 Win'
      }
    ],
    latestReport: {
      id: 'rep-4',
      talentProfileId: 'talent-4',
      summary: 'Usman demonstrated high-clutch potential in his logged performance, highlighted by a game-winning penalty save and high shot-stopping frequency under pressure.',
      strengths: [
        'Explosive reaction saves from close-range shots.',
        'Strong mental composure during high-stakes match moments.'
      ],
      areasToDevelop: [
        'Long distribution accuracy to wide midfielders.',
        'Needs more logged competitive match minutes to evaluate consistency.'
      ],
      verdict: 'Promising goalkeeper candidate; warrants closer monitoring across upcoming league fixtures.',
      generatedAt: '2026-07-19T10:00:00Z'
    }
  }
];

export const INITIAL_SCOUT_PROFILE: ScoutProfile = {
  id: 'scout-1',
  userId: 'user-scout-1',
  name: 'Coach Tariq Mahmood',
  organization: 'Lahore Academy Scouts',
  targetPositions: ['forward', 'midfielder'],
  targetCities: ['Lahore', 'Karachi', 'Islamabad'],
  createdAt: '2026-05-01T00:00:00Z'
};
