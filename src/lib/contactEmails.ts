/** Public institutional inboxes used across the site. */
export const CONTACT_EMAILS = {
  general: 'info@schoolofgrowthglobal.com',
  admissions: 'admissions@schoolofgrowthglobal.com',
  careers: 'careerjobs@schoolofgrowthglobal.com',
  growth: 'growth@schoolofgrowthglobal.com',
  partnerships: 'partnership@schoolofgrowthglobal.com',
  support: 'support@schoolofgrowthglobal.com',
} as const;

export type ContactDepartment = keyof typeof CONTACT_EMAILS;
