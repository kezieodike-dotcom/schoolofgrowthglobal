import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  UserPlus,
  GraduationCap,
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
];

export const HeaderNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // An enrolled student has no use for a "Register" button; show them the way
  // into what they paid for instead.
  const { currentPackageName } = useEnrollment();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
      isActive
        ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-[80] bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group select-none">
            <img
              src="/logo.jpg"
              alt="School of Growth Global crest"
              className="w-11 h-11 rounded-xl object-cover ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/20 transition-transform duration-200"
            />
            <div>
              <div className="flex items-center">
                <span className="font-serif font-bold text-base sm:text-xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  SCHOOL OF GROWTH GLOBAL
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <ContentNotificationCenter />
            {currentPackageName ? (
              <Link
                to="/portal"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-amber-300 bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{currentPackageName} student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/pricing"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/10 transition-all"
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
              className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
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
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'text-slate-300 bg-slate-900/50 hover:bg-slate-800'
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
              className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2"
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
