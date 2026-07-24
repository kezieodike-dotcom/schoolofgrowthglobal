import React from 'react';
import {
  Crown,
  TrendingUp,
  Landmark,
  Cpu,
  Cog,
  Sprout,
  HeartPulse,
  Palette,
  GraduationCap,
  Scale,
  HardHat,
  Flame,
  Briefcase,
  Sparkles,
  Users,
  Globe,
  Lightbulb,
  BookOpen,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Crown,
  TrendingUp,
  Landmark,
  Cpu,
  Cog,
  Sprout,
  HeartPulse,
  Palette,
  GraduationCap,
  Scale,
  HardHat,
  Flame,
  Briefcase,
  Sparkles,
  Users,
  Globe,
  Lightbulb,
  BookOpen,
};

interface SchoolIconProps {
  name: string;
  className?: string;
}

/** Renders a lucide icon by its string name (used for data-driven school/mentor icons). */
export const SchoolIcon: React.FC<SchoolIconProps> = ({ name, className }) => {
  const Icon = ICON_MAP[name] ?? Crown;
  return <Icon className={className} />;
};

/** Maps a school accent color token to Tailwind text/border utility classes. */
export const accent = (color: string) => {
  const map: Record<string, { text: string; border: string; bg: string }> = {
    blue: { text: 'text-blue-400', border: 'hover:border-blue-500/50', bg: 'bg-blue-500' },
    emerald: { text: 'text-emerald-400', border: 'hover:border-emerald-500/50', bg: 'bg-emerald-500' },
    amber: { text: 'text-amber-400', border: 'hover:border-amber-500/50', bg: 'bg-amber-500' },
    indigo: { text: 'text-indigo-400', border: 'hover:border-indigo-500/50', bg: 'bg-indigo-500' },
    purple: { text: 'text-purple-400', border: 'hover:border-purple-500/50', bg: 'bg-purple-500' },
    teal: { text: 'text-teal-400', border: 'hover:border-teal-500/50', bg: 'bg-teal-500' },
    rose: { text: 'text-rose-400', border: 'hover:border-rose-500/50', bg: 'bg-rose-500' },
    orange: { text: 'text-orange-400', border: 'hover:border-orange-500/50', bg: 'bg-orange-500' },
    red: { text: 'text-red-400', border: 'hover:border-red-500/50', bg: 'bg-red-500' },
    slate: { text: 'text-slate-300', border: 'hover:border-slate-500/50', bg: 'bg-slate-500' },
  };
  return map[color] ?? map.amber;
};
