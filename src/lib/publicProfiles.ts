import type { FacultyMember } from '../types';

export const NGOZI_PORTRAIT = '/people/ngozi-okafor-generated-v1.jpg';

interface ProfileIdentity { id: string; name: string }

export function normalizePublicName(name: string): string {
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\bph[.\s]*d\b/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
    .split(/\s+/).filter(part => !['dr', 'prof', 'mr', 'mrs', 'ms'].includes(part)).join(' ');
}

// Temporary public suspension only; applications and admin records are retained.
export function isSuspendedPublicProfile(profile: ProfileIdentity): boolean {
  return ['f3', 'bright-john'].includes(profile.id) || normalizePublicName(profile.name) === 'bright john';
}

export function normalizePublicProfile<T extends ProfileIdentity & { role: string; avatar: string }>(profile: T): T {
  const name = normalizePublicName(profile.name);
  const isAdvisor = profile.id === 'john-akpan' || name === 'john akpan';
  const isNgozi = name === 'ngozi okafor' || profile.id === 'f2';
  return {
    ...profile,
    role: isAdvisor ? profile.role.replace(/\s+to\s+the\s+founder\b/gi, '').replace(/\bAdviser\b/g, 'Advisor').trim() : profile.role,
    avatar: isNgozi && profile.avatar.split('?')[0] === '/people/w1-okafor.jpg' ? NGOZI_PORTRAIT : profile.avatar,
  };
}

export function publicFacultyProfile(value: unknown): FacultyMember | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const member = value as Record<string, unknown>;
  if (!['id', 'name', 'role', 'institution', 'bio', 'avatar'].every(key => typeof member[key] === 'string') ||
      !Array.isArray(member.credentials) || !member.credentials.every(item => typeof item === 'string')) return undefined;
  return normalizePublicProfile({
    id: member.id as string, name: member.name as string, role: member.role as string,
    institution: member.institution as string, bio: member.bio as string,
    avatar: member.avatar as string, credentials: member.credentials as string[],
  });
}
