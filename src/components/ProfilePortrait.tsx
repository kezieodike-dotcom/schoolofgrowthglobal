import { useState } from 'react';
import { normalizePublicName } from '../lib/publicProfiles';

/** A portrait frame with room for the full head, shared by the team cards. */
export function ProfilePortrait({ name, src, className = '' }: { name: string; src: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const generated = src.includes('generated');
  const initials = normalizePublicName(name).split(' ').slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
  return <div data-profile-portrait className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-slate-100 text-3xl font-bold text-slate-700 ${className}`}>
    {src && failedSource !== src ? <img src={src}
      alt={generated ? `AI-generated professional portrait for ${name}` : name}
      title={generated ? 'AI-generated professional portrait' : undefined}
      width={400} height={500} loading="lazy" decoding="async"
      onError={() => setFailedSource(src)} className="h-full w-full object-cover object-top" />
      : <span role="img" aria-label={`${name} profile`}>{initials}</span>}
  </div>;
}
