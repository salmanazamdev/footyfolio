import { TalentProfile, ScoutProfile } from '../types';

export const INITIAL_TALENT_PROFILES: TalentProfile[] = [];

export const INITIAL_SCOUT_PROFILE: ScoutProfile = {
  id: 'scout-1',
  userId: 'user-scout-1',
  name: 'Coach Tariq',
  organization: 'Scout Network',
  targetPositions: ['forward', 'midfielder'],
  targetCities: ['Lahore', 'Karachi', 'Islamabad'],
  createdAt: new Date().toISOString()
};
