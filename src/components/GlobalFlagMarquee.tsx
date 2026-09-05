import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

type GlobalFlagMarket = {
  country: string;
  region: string;
  flag: string;
};

export const GLOBAL_FLAG_MARKETS: GlobalFlagMarket[] = [
  { country: 'Nigeria', region: 'West Africa', flag: 'linear-gradient(90deg, #15803d 0 33%, #ffffff 33% 66%, #15803d 66%)' },
  { country: 'United Kingdom', region: 'Europe', flag: 'linear-gradient(135deg, #012169 0 36%, #ffffff 36% 42%, #c8102e 42% 48%, #ffffff 48% 54%, #012169 54%)' },
  { country: 'United States', region: 'North America', flag: 'repeating-linear-gradient(180deg, #b91c1c 0 5px, #ffffff 5px 10px)' },
  { country: 'Ghana', region: 'West Africa', flag: 'linear-gradient(180deg, #ce1126 0 33%, #fcd116 33% 66%, #006b3f 66%)' },
  { country: 'Kenya', region: 'East Africa', flag: 'linear-gradient(180deg, #0f172a 0 28%, #ffffff 28% 34%, #bb0000 34% 66%, #ffffff 66% 72%, #166534 72%)' },
  { country: 'South Africa', region: 'Southern Africa', flag: 'linear-gradient(135deg, #007a4d 0 34%, #ffb612 34% 43%, #de3831 43% 58%, #ffffff 58% 65%, #002395 65%)' },
  { country: 'Canada', region: 'North America', flag: 'linear-gradient(90deg, #d80621 0 25%, #ffffff 25% 75%, #d80621 75%)' },
  { country: 'Rwanda', region: 'East Africa', flag: 'linear-gradient(180deg, #00a1de 0 50%, #fad201 50% 75%, #20603d 75%)' },
  { country: 'United Arab Emirates', region: 'Middle East', flag: 'linear-gradient(90deg, #ef3340 0 25%, transparent 25%), linear-gradient(180deg, #009739 0 33%, #ffffff 33% 66%, #020617 66%)' },
  { country: 'India', region: 'Asia', flag: 'linear-gradient(180deg, #ff9933 0 33%, #ffffff 33% 66%, #138808 66%)' },
  { country: 'China', region: 'Asia', flag: 'linear-gradient(135deg, #de2910 0 70%, #ffde00 70%)' },
  { country: 'Singapore', region: 'Asia', flag: 'linear-gradient(180deg, #ef3340 0 50%, #ffffff 50%)' },
  { country: 'Brazil', region: 'South America', flag: 'linear-gradient(135deg, #009b3a 0 42%, #ffdf00 42% 60%, #002776 60%)' },
  { country: 'Germany', region: 'Europe', flag: 'linear-gradient(180deg, #111827 0 33%, #dd0000 33% 66%, #ffce00 66%)' },
  { country: 'France', region: 'Europe', flag: 'linear-gradient(90deg, #0055a4 0 33%, #ffffff 33% 66%, #ef4135 66%)' },
  { country: 'Netherlands', region: 'Europe', flag: 'linear-gradient(180deg, #ae1c28 0 33%, #ffffff 33% 66%, #21468b 66%)' },
  { country: 'Saudi Arabia', region: 'Middle East', flag: 'linear-gradient(135deg, #006c35 0 80%, #ffffff 80%)' },
  { country: 'Qatar', region: 'Middle East', flag: 'linear-gradient(90deg, #ffffff 0 28%, #8a1538 28%)' },
  { country: 'Australia', region: 'Oceania', flag: 'linear-gradient(135deg, #00008b 0 68%, #ffffff 68% 75%, #e4002b 75%)' },
  { country: 'Egypt', region: 'North Africa', flag: 'linear-gradient(180deg, #ce1126 0 33%, #ffffff 33% 66%, #020617 66%)' },
  { country: 'Morocco', region: 'North Africa', flag: 'linear-gradient(135deg, #c1272d 0 72%, #006233 72%)' },
  { country: 'Japan', region: 'Asia', flag: 'radial-gradient(circle at center, #bc002d 0 24%, transparent 25%), #ffffff' },
];

const FlagTile: React.FC<GlobalFlagMarket> = ({ country, region, flag }) => (
  <div className="group flex min-w-max items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/88 px-3.5 py-2 shadow-sm shadow-slate-950/5 transition duration-[240ms] hover:-translate-y-1 hover:border-amber-400/70 hover:bg-white hover:shadow-lg hover:shadow-amber-500/10">
    <span
      className="h-8 w-12 shrink-0 rounded-lg border border-slate-950/10 shadow-inner"
      style={{ background: flag }}
      aria-hidden="true"
    />
    <span className="leading-tight">
      <span className="block text-[13px] font-semibold text-slate-900">{country}</span>
      <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">{region}</span>
    </span>
  </div>
);

const FlagTrack: React.FC<{ markets: GlobalFlagMarket[] }> = ({ markets }) => (
  <>
    {markets.map((market) => (
      <FlagTile key={market.country} {...market} />
    ))}
  </>
);

export const GlobalFlagMarquee: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const firstTrack = GLOBAL_FLAG_MARKETS.slice(0, 11);
  const secondTrack = GLOBAL_FLAG_MARKETS.slice(11);

  return (
    <section
      aria-label="Global countries marquee"
      className="overflow-hidden border-b border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-slate-50"
      style={{ position: 'relative' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700">
            Global Growth Community
          </p>
          <p className="text-xs font-medium text-slate-500">
            LEADERSHIP. STRATEGY. TRANSFORMATION ACROSS BORDERS
          </p>
        </div>

        {shouldReduceMotion ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            <FlagTrack markets={GLOBAL_FLAG_MARKETS} />
          </div>
        ) : (
          <div className="space-y-3">
            <InfiniteSlider className="flex w-full items-center" duration={34} gap={18}>
              <FlagTrack markets={firstTrack} />
            </InfiniteSlider>
            <InfiniteSlider className="hidden w-full items-center sm:flex" duration={42} gap={18} reverse>
              <FlagTrack markets={secondTrack} />
            </InfiniteSlider>
          </div>
        )}
      </div>
    </section>
  );
};
