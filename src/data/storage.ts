import { TalentProfile, ScoutProfile, ShortlistItem, Match, ScoutingReport } from '../types';
import { INITIAL_TALENT_PROFILES, INITIAL_SCOUT_PROFILE } from '../data/mockData';

const LOCAL_STORAGE_TALENTS_KEY = 'footyfolio_talents_v1';
const LOCAL_STORAGE_SCOUTS_KEY = 'footyfolio_scouts_v1';
const LOCAL_STORAGE_SHORTLISTS_KEY = 'footyfolio_shortlists_v1';
const LOCAL_STORAGE_ACTIVE_USER = 'footyfolio_active_user_v1';

export class StorageEngine {
  static getTalentProfiles(): TalentProfile[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_TALENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse talents from localStorage, using initial mock data.');
    }
    // Initialize with default mock data
    localStorage.setItem(LOCAL_STORAGE_TALENTS_KEY, JSON.stringify(INITIAL_TALENT_PROFILES));
    return INITIAL_TALENT_PROFILES;
  }

  static saveTalentProfile(profile: TalentProfile): TalentProfile[] {
    const profiles = this.getTalentProfiles();
    const index = profiles.findIndex((p) => p.id === profile.id);
    let updated: TalentProfile[];
    if (index >= 0) {
      updated = [...profiles];
      updated[index] = profile;
    } else {
      updated = [profile, ...profiles];
    }
    localStorage.setItem(LOCAL_STORAGE_TALENTS_KEY, JSON.stringify(updated));
    return updated;
  }

  static addMatchToTalent(talentId: string, match: Match, newReport?: ScoutingReport): TalentProfile | null {
    const profiles = this.getTalentProfiles();
    const target = profiles.find((p) => p.id === talentId);
    if (!target) return null;

    const updatedMatches = [match, ...target.matches];
    const updatedProfile: TalentProfile = {
      ...target,
      matches: updatedMatches,
      latestReport: newReport || target.latestReport
    };

    this.saveTalentProfile(updatedProfile);
    return updatedProfile;
  }

  static updateTalentReport(talentId: string, report: ScoutingReport): TalentProfile | null {
    const profiles = this.getTalentProfiles();
    const target = profiles.find((p) => p.id === talentId);
    if (!target) return null;

    const updatedProfile: TalentProfile = {
      ...target,
      latestReport: report
    };

    this.saveTalentProfile(updatedProfile);
    return updatedProfile;
  }

  static getScoutProfiles(): ScoutProfile[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SCOUTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse scouts from localStorage');
    }
    localStorage.setItem(LOCAL_STORAGE_SCOUTS_KEY, JSON.stringify([INITIAL_SCOUT_PROFILE]));
    return [INITIAL_SCOUT_PROFILE];
  }

  static saveScoutProfile(scout: ScoutProfile): ScoutProfile[] {
    const scouts = this.getScoutProfiles();
    const idx = scouts.findIndex((s) => s.id === scout.id);
    let updated: ScoutProfile[];
    if (idx >= 0) {
      updated = [...scouts];
      updated[idx] = scout;
    } else {
      updated = [scout, ...scouts];
    }
    localStorage.setItem(LOCAL_STORAGE_SCOUTS_KEY, JSON.stringify(updated));
    return updated;
  }

  static getShortlists(scoutId: string): ShortlistItem[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SHORTLISTS_KEY);
      if (stored) {
        const all: ShortlistItem[] = JSON.parse(stored);
        return all.filter((item) => item.scoutProfileId === scoutId);
      }
    } catch (e) {
      console.warn('Failed to read shortlists');
    }
    return [];
  }

  static toggleShortlist(scoutId: string, scoutName: string, talentId: string): { isShortlisted: boolean; updatedProfiles: TalentProfile[] } {
    const shortlistsStr = localStorage.getItem(LOCAL_STORAGE_SHORTLISTS_KEY);
    let allShortlists: ShortlistItem[] = shortlistsStr ? JSON.parse(shortlistsStr) : [];

    const existingIndex = allShortlists.findIndex((s) => s.scoutProfileId === scoutId && s.talentProfileId === talentId);
    let isShortlisted = false;

    if (existingIndex >= 0) {
      // Remove
      allShortlists.splice(existingIndex, 1);
      isShortlisted = false;
    } else {
      // Add
      const newItem: ShortlistItem = {
        id: 'sl-' + Date.now(),
        scoutProfileId: scoutId,
        scoutName,
        talentProfileId: talentId,
        createdAt: new Date().toISOString()
      };
      allShortlists.push(newItem);
      isShortlisted = true;
    }

    localStorage.setItem(LOCAL_STORAGE_SHORTLISTS_KEY, JSON.stringify(allShortlists));

    // Update shortlistedBy in Talent Profile
    const profiles = this.getTalentProfiles();
    const talent = profiles.find((p) => p.id === talentId);
    if (talent) {
      const existingShortlist = talent.shortlistedBy || [];
      let newShortlist: string[];
      if (isShortlisted) {
        newShortlist = Array.from(new Set([...existingShortlist, scoutId]));
      } else {
        newShortlist = existingShortlist.filter((id) => id !== scoutId);
      }
      const updatedTalent = { ...talent, shortlistedBy: newShortlist };
      this.saveTalentProfile(updatedTalent);
    }

    return { isShortlisted, updatedProfiles: this.getTalentProfiles() };
  }
}
