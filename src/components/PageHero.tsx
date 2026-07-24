import React from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
}

/** Consistent inner-page hero header matching the institutional dark/amber theme. */
export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, subtitle, icon }) => (
  <section className="relative overflow-hidden pt-14 pb-14 border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400 mb-5">
        {icon}
        <span>{eyebrow}</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight max-w-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-5 text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  </section>
);
