import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  UserPlus,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import { useEnrollment } from '../lib/useEnrollment';
import { ContentNotificationCenter } from './ContentNotificationCenter';

const NAV_ITEMS: { to: string; label: string }[] = [
  { to: '/courses', label: 'Courses' },
  { to: '/mentorship', label: 'Mentorship' },
  { to: '/books', label: 'Books' },
  { to: '/jobs', label: 'Career Jobs' },
  { to: '/events', label: 'Events' },
  { to: '/blog', label: 'Insights' },
  { to: '/donate', label: 'Donate' },
  { to: '/about', label: 'About' },
  { to: '/schools', label: 'Schools' },
  { to: '/partnerships', label: 'Partnerships' },
];

const PRIMARY_NAV_ITEMS = NAV_ITEMS.slice(0, 5);
const MORE_NAV_ITEMS = NAV_ITEMS.slice(5);

export const HeaderNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  // An enrolled student has no use for a "Register" button; show them the way
  // into what they paid for instead.
  const { currentPackageName } = useEnrollment();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
      isActive
        ? 'text-blue-700 font-semibold bg-blue-50'
        : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
    }`;

  return (
    <header className="sticky top-0 z-[80] border-b border-slate-200 bg-slate-50/95 text-slate-900 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between gap-6">
          {/* Logo Brand */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5 cursor-pointer group select-none">
            <img
              src="/logo.jpg"
              alt="School of Growth Global crest"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-amber-500/30 shadow-sm transition-transform duration-200"
            />
            <span className="max-w-[10rem] font-serif text-sm font-bold leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 sm:max-w-none sm:text-base">SCHOOL OF GROWTH GLOBAL</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
            <div className="relative">
              <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-blue-50/70 hover:text-blue-700">
                More <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-11 z-50 min-w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {MORE_NAV_ITEMS.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMoreOpen(false)} className={linkClass}>{item.label}</NavLink>)}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden items-center gap-3 lg:flex">
            <ContentNotificationCenter />
            {currentPackageName ? (
              <Link
                to="/portal"
                className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{currentPackageName} student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/pricing"
                className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enrol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ContentNotificationCenter />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="space-y-2 border-b border-slate-200 bg-white px-4 pb-6 pt-2 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'border border-blue-200 bg-blue-50 text-blue-700'
                    : 'bg-slate-50 text-slate-600 hover:bg-blue-50'
                }`
              }
            >
              <span>{item.label}</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          ))}
          <div className="pt-2">
            <Link
              to={currentPackageName ? '/portal' : '/pricing'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2.5 text-xs font-bold text-white"
            >
              {currentPackageName ? (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>{currentPackageName} student</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Enrol</span>
                </>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
