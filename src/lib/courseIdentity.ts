/** Only spelling and punctuation are folded automatically. Related subjects
 * with different scope keep their own entries. Clear renamings are explicit. */
export function normalizeCourseTitle(title: string): string {
  return title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[’']/g, '')
    .replace(/organisation/g, 'organization').replace(/behaviour/g, 'behavior')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

const equivalentTitles: Record<string, string> = {
  'leadership foundations and principles': 'foundations of leadership',
  'leadership foundations': 'foundations of leadership',
  'managing people': 'people management',
  // Abbreviated labels in the original 19-course Leadership sequence.
  'delegation': 'delegation and task management',
  'influence': 'leadership influence',
  'decision making': 'decision making in leadership',
  'problem solving': 'problem solving and critical thinking',
  'communication': 'leadership communication',
  'emotional intelligence': 'emotional intelligence in leadership',
  'leadership legacy': 'leadership legacy and succession',
};

export function courseIdentity(title: string): string {
  const key = normalizeCourseTitle(title);
  return equivalentTitles[key] ?? key;
}
