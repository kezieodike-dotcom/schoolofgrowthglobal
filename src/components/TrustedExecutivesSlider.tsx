import React from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { CORPORATE_PARTNERS } from '../data/mockData';
import {
  Briefcase,
  Landmark,
  TrendingUp,
  LayoutGrid,
  Globe,
  Building2,
  Sprout,
  LucideIcon,
} from 'lucide-react';

// Named institutions rendered as "logos" via lucide icons (no external brand SVGs).
const PARTNER_ICONS: Record<string, LucideIcon> = {
  'McKinsey & Company': Briefcase,
  'Goldman Sachs': Landmark,
  Accenture: TrendingUp,
  Microsoft: LayoutGrid,
  Tencent: Globe,
  'JPMorgan Chase': Landmark,
  Deloitte: Building2,
  'Sequoia Capital': Sprout,
};

export const TrustedExecutivesSlider: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden">
      <InfiniteSlider className="flex h-14 w-full items-center" duration={40} gap={64}>
        {CORPORATE_PARTNERS.map((partner) => {
          const Icon = PARTNER_ICONS[partner] ?? Building2;
          return (
            <div
              key={partner}
              className="flex items-center gap-2.5 whitespace-nowrap text-slate-400 hover:text-amber-300 transition-colors duration-300"
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-serif font-bold text-sm tracking-wide">{partner}</span>
            </div>
          );
        })}
      </InfiniteSlider>

      {/* Progressive blur edges fade the marquee into the section background */}
      <ProgressiveBlur
        className="pointer-events-none absolute top-0 left-0 h-full w-[120px] sm:w-[200px]"
        direction="left"
        blurIntensity={1}
      />
      <ProgressiveBlur
        className="pointer-events-none absolute top-0 right-0 h-full w-[120px] sm:w-[200px]"
        direction="right"
        blurIntensity={1}
      />
    </div>
  );
};
