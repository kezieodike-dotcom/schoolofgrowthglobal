import React from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
}

/** Consistent inner-page hero header matching the institutional light/amber theme. */
export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, subtitle, icon }) => (
  <section className="relative overflow-hidden pt-14 pb-14 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700 mb-5">
        {icon}
        <span>{eyebrow}</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-tight max-w-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-5 text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  </section>
);
