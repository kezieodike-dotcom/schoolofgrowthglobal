import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  LayoutDashboard,
  Terminal,
  ArrowRight,
} from 'lucide-react';
import { COURSES } from '../data/mockData';

const NAV_ITEMS: { to: string; label: string }[] = [
  { to: '/schools', label: 'Schools' },
  { to: '/courses', label: 'Courses' },
  { to: '/mentors', label: 'Mentors' },
  { to: '/events', label: 'Events' },
  { to: '/blog', label: 'Insights' },
  { to: '/about', label: 'About' },
];

export const HeaderNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredCourses = COURSES.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
      isActive
        ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group select-none">
            <img
              src="/logo.jpg"
              alt="School of Growth Global crest"
              className="w-11 h-11 rounded-xl object-cover ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  SCHOOL OF GROWTH
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  GLOBAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                Leadership. Strategy. Transformation.
              </p>
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
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-full bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Search Frameworks & Courses"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              to="/portal"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Portal</span>
            </Link>

            <Link
              to="/command-center"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/10 transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Growth AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
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
          <div className="pt-2 grid grid-cols-2 gap-2">
            <Link
              to="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Student Portal</span>
            </Link>
            <Link
              to="/command-center"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span>Growth AI</span>
            </Link>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
                <Search className="w-4 h-4" />
                <span>SEARCH FRAMEWORKS & COURSES</span>
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search strategy, executive leadership, AI governance..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              autoFocus
            />

            <div className="max-h-80 overflow-y-auto space-y-2 pt-2 text-xs">
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSearchOpen(false);
                    navigate(`/courses/${course.id}`);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-mono text-amber-400">{course.schoolName}</span>
                    <h5 className="font-bold text-white text-sm">{course.title}</h5>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
              {filteredCourses.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  No courses found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
