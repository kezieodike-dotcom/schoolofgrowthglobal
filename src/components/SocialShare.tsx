import React from 'react';
import { Linkedin, Link2, MessageCircle, Share2 } from 'lucide-react';

interface SocialShareProps { title: string; className?: string; }

export const SocialShare: React.FC<SocialShareProps> = ({ title, className = '' }) => {
  const url = typeof window === 'undefined' ? 'https://schoolofgrowthglobal.vercel.app/' : window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      window.dispatchEvent(new CustomEvent('sgg-share-copied'));
    } catch { /* Clipboard may be unavailable in an embedded browser. */ }
  };

  const nativeShare = async () => {
    if (navigator.share) await navigator.share({ title, url });
    else await copy();
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Share this page">
      <span className="mr-1 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500"><Share2 className="h-3.5 w-3.5" /> Share</span>
      <button type="button" onClick={nativeShare} aria-label="Share using your device" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-amber-400 hover:text-amber-700"><Share2 className="h-4 w-4" /></button>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-amber-400 hover:text-amber-700"><Linkedin className="h-4 w-4" /></a>
      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-amber-400 hover:text-amber-700"><MessageCircle className="h-4 w-4" /></a>
      <button type="button" onClick={copy} aria-label="Copy page link" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-amber-400 hover:text-amber-700"><Link2 className="h-4 w-4" /></button>
    </div>
  );
};
