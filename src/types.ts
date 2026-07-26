export type UserRole = 'talent' | 'scout';

export type Position = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

export interface Match {
  id: string;
  talentProfileId: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  notes: string;
  matchDate: string;
  opponent?: string;
  result?: string;
}

export interface ScoutingReport {
  id: string;
  talentProfileId: string;
  summary: string;
  strengths: string[];
  areasToDevelop: string[];
  verdict: string;
  generatedAt: string;
}

export interface TalentProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  position: Position;
  city: string;
  bio?: string;
  avatarUrl?: string;
  preferredFoot?: string;
  matches: Match[];
  latestReport?: ScoutingReport;
  shortlistedBy?: string[]; // Array of scout profile IDs
  createdAt: string;
}

export interface ScoutProfile {
  id: string;
  userId: string;
  name: string;
  organization?: string;
  targetPositions: Position[];
  targetCities: string[];
  createdAt: string;
}

export interface ShortlistItem {
  id: string;
  scoutProfileId: string;
  scoutName: string;
  talentProfileId: string;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profileId: string;
}
