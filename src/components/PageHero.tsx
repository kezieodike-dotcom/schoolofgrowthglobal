import React from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  imageSrc?: string;
  imagePosition?: string;
  imageOnDesktop?: boolean;
  imageOverlay?: 'soft' | 'strong';
  centered?: boolean;
}

/** Consistent inner-page hero header matching the institutional light/amber theme. */
export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  icon,
  imageSrc,
  imagePosition = 'center',
  imageOnDesktop = false,
  imageOverlay = 'strong',
  centered = false,
}) => (
  <section
    className={`relative overflow-hidden border-b border-slate-200 ${!imageSrc || !imageOnDesktop ? 'hero-grid-lines' : ''} ${
      imageSrc
        ? imageOnDesktop
          ? 'min-h-[21rem] bg-slate-950 pt-16 pb-14 sm:min-h-[24rem] lg:min-h-[27rem] lg:pt-20 lg:pb-20'
          : 'min-h-[20rem] bg-slate-950 pt-20 pb-16 sm:min-h-[22rem] lg:min-h-0 lg:bg-gradient-to-b lg:from-white lg:via-slate-50 lg:to-slate-50 lg:pt-14 lg:pb-14'
        : 'bg-gradient-to-b from-white via-slate-50 to-slate-50 pt-14 pb-14'
    }`}
  >
    {imageSrc && (
      <>
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover ${imageOnDesktop ? '' : 'lg:hidden'} ${imagePosition}`}
          />
        <div className={`absolute inset-0 ${imageOverlay === 'soft' ? 'bg-slate-950/45' : 'bg-slate-950/72'} ${imageOnDesktop ? '' : 'lg:hidden'}`} />
        <div className={`absolute inset-0 bg-gradient-to-b ${imageOverlay === 'soft' ? 'from-slate-950/25 via-slate-950/35 to-slate-950/65' : 'from-slate-950/42 via-slate-950/58 to-slate-950/84'} ${imageOnDesktop ? '' : 'lg:hidden'}`} />
      </>
    )}
    <div className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${centered ? 'text-center' : ''}`}>
      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono mb-5 bg-white/12 border-white/25 text-amber-100 backdrop-blur-md ${centered ? 'mx-auto' : ''} ${imageOnDesktop ? 'lg:bg-white/12 lg:border-white/25 lg:text-amber-100 lg:backdrop-blur-md' : 'lg:bg-amber-50 lg:border-amber-200 lg:text-amber-700 lg:backdrop-blur-none'}`}>
        {icon}
        <span>{eyebrow}</span>
      </div>
      <h1 className={`mobile-hero-title text-[2.35rem] sm:text-5xl font-serif font-semibold lg:font-bold text-white ${imageOnDesktop ? 'lg:text-white' : 'lg:text-slate-900'} tracking-tight leading-[1.08] sm:leading-tight max-w-3xl ${centered ? 'mx-auto' : ''}`}>
        {title}
      </h1>
      {subtitle && (
        <p className={`mt-5 text-slate-100/90 ${imageOnDesktop ? 'lg:text-slate-100/90' : 'lg:text-slate-600'} text-[15px] sm:text-lg leading-7 sm:leading-relaxed max-w-2xl ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  </section>
);
