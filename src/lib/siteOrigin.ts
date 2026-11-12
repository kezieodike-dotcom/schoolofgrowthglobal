const OFFICIAL_HOSTS = new Set(['schoolofgrowthglobal.com', 'www.schoolofgrowthglobal.com', 'schoolofgrowthglobal.vercel.app']);

export function canonicalSiteOrigin(origin: string): string {
  const url = new URL(origin);
  return OFFICIAL_HOSTS.has(url.hostname) ? 'https://www.schoolofgrowthglobal.com' : url.origin;
}

export function movePaidAccessToMainSite(reference?: string): boolean {
  const canonical = canonicalSiteOrigin(window.location.origin);
  if (canonical === window.location.origin) return false;
  const target = new URL(`${window.location.pathname}${window.location.search}${window.location.hash}`, canonical);
  if (reference) target.searchParams.set('reference', reference);
  window.location.replace(target.href);
  return true;
}
