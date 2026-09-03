export type ReferralAudience = 'student' | 'mentor';

interface ReferralIdentity {
  name?: string;
  email?: string;
}

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

function shortHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).slice(0, 6).padStart(4, '0');
}

export function makeReferralCode(
  audience: ReferralAudience,
  identity: ReferralIdentity = {}
): string {
  const label = normalize(identity.name || identity.email || 'growth-member');
  const hash = shortHash(`${audience}:${identity.name ?? ''}:${identity.email ?? ''}`);
  return `${audience}-${label || 'growth-member'}-${hash}`;
}

export function makeReferralUrl(opts: ReferralIdentity & {
  audience: ReferralAudience;
  origin?: string;
}): string {
  const origin =
    opts.origin ||
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://schoolofgrowthglobal.vercel.app');
  const path = opts.audience === 'mentor' ? '/register/mentor' : '/register';
  const url = new URL(path, origin);
  url.searchParams.set('ref', makeReferralCode(opts.audience, opts));
  return url.toString();
}

