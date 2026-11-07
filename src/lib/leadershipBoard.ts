import type { FacultyMember } from '../types';
import { isSuspendedPublicProfile, normalizePublicName, normalizePublicProfile, publicFacultyProfile } from './publicProfiles';

export interface ApprovedExpert {
  id: string;
  name: string;
  role: string;
  location: string;
  expertise: string[];
  bio: string;
  area: string;
  experience: string;
  avatar: string;
  languages: string[];
  formats: string[];
  applicationType: 'mentor' | 'consultant';
}

export interface BoardMember extends FacultyMember {
  expertTypes: ApprovedExpert['applicationType'][];
}

export function buildLeadershipBoard(team: FacultyMember[], approved: ApprovedExpert[]): BoardMember[] {
  const members: BoardMember[] = [];
  const teamIds = new Set<string>();
  for (const entry of team) {
    const member = publicFacultyProfile(entry);
    if (!member || member.id === 'f1' || isSuspendedPublicProfile(member) || teamIds.has(member.id)) continue;
    teamIds.add(member.id);
    members.push({ ...member, expertTypes: [] });
  }
  const teamCount = members.length;
  const expertIds = new Set<string>();
  for (const entry of approved) {
    if (isSuspendedPublicProfile(entry) || expertIds.has(entry.id)) continue;
    expertIds.add(entry.id);
    const expert = normalizePublicProfile(entry);
    const existing = members.slice(0, teamCount).find(member =>
      member.id === expert.id || normalizePublicName(member.name) === normalizePublicName(expert.name)
    );
    if (existing) {
      existing.expertTypes = [...new Set([...existing.expertTypes, expert.applicationType])];
      existing.credentials = [...new Set([...existing.credentials, ...expert.expertise])];
    } else {
      members.push({
        id: `approved-${expert.id}`, name: expert.name,
        role: expert.role || (expert.applicationType === 'consultant' ? 'Consultant' : 'Mentor'),
        institution: expert.location, bio: expert.bio, credentials: [...expert.expertise], avatar: expert.avatar,
        expertTypes: [expert.applicationType],
      });
    }
  }
  return members;
}
