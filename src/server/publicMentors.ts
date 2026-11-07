import type { ContentRecord } from '../lib/content.js';
import type { ApprovedExpert } from '../lib/leadershipBoard.js';
import { isSuspendedPublicProfile, normalizePublicProfile, publicFacultyProfile } from '../lib/publicProfiles.js';
import type { MentorApplication } from './mentorStore.js';

export function toPublicMentorDirectory(applications: MentorApplication[]): ApprovedExpert[] {
  return applications.filter(application => application.status === 'approved' && !isSuspendedPublicProfile(application))
    .map(application => normalizePublicProfile({
      id: application.id, name: application.name,
      role: application.organization ? `${application.title}, ${application.organization}` : application.title,
      location: application.location, expertise: application.specialisms,
      bio: application.answers['Professional background'] ?? '', area: application.area,
      experience: application.experience, avatar: application.answers['Profile photo'] ?? '',
      languages: application.answers['Languages you mentor in']?.split(',').map(value => value.trim()).filter(Boolean) ?? [],
      formats: application.answers['Session formats you offer']?.split(',').map(value => value.trim()).filter(Boolean) ?? [],
      applicationType: application.applicationType === 'consultant' ? 'consultant' : 'mentor',
    }));
}

export function toPublicTeamRecords(records: ContentRecord[]): ContentRecord[] {
  return records.flatMap(record => {
    if (record.kind !== 'team') return [];
    const payload = record.payload as unknown as Record<string, unknown>;
    const identity = { id: record.id, name: typeof payload?.name === 'string' ? payload.name : '' };
    if (record.id === 'f1' || isSuspendedPublicProfile(identity)) {
      return [{ ...record, published: false, payload: { id: record.id, name: '', role: '', institution: '', bio: '', credentials: [], avatar: '' } }];
    }
    // Applications share team storage, but only the approved directory can publish them.
    if (record.id.startsWith('mentor-') || payload?.status || payload?.answers) return [];
    const member = publicFacultyProfile(payload);
    return member ? [{ ...record, payload: member }] : [];
  });
}
