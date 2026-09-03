import React, { useMemo, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { makeReferralUrl, type ReferralAudience } from '../lib/referrals';

interface ReferralShareCardProps {
  audience: ReferralAudience;
  name?: string;
  email?: string;
  title?: string;
  body?: string;
  dark?: boolean;
}

export const ReferralShareCard: React.FC<ReferralShareCardProps> = ({
  audience,
  name,
  email,
  title = 'Invite and referral link',
  body = 'Share your personal link with someone who should join School of Growth Global.',
  dark,
}) => {
  const [copied, setCopied] = useState(false);
  const referralUrl = useMemo(
    () => makeReferralUrl({ audience, name, email }),
    [audience, email, name]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'School of Growth Global',
        text: body,
        url: referralUrl,
      });
      return;
    }
    await copy();
  };

  return (
    <section
      className={`rounded-lg border p-4 shadow-sm ${
        dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[10px] font-mono uppercase tracking-wider ${dark ? 'text-amber-300' : 'text-amber-700'}`}>
            Referral
          </p>
          <h3 className="mt-1 text-sm font-black">{title}</h3>
          <p className={`mt-1 text-[11px] leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
            {body}
          </p>
        </div>
        <Share2 className={`h-4 w-4 shrink-0 ${dark ? 'text-amber-300' : 'text-amber-600'}`} />
      </div>
      <div className={`mt-3 rounded-lg border px-3 py-2 text-[11px] break-all ${dark ? 'border-white/10 bg-slate-950 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
        {referralUrl}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copy}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-bold transition ${
            dark ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-800'
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={share}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-bold transition ${
            dark ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
          }`}
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
      </div>
    </section>
  );
};

