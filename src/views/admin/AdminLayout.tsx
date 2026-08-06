import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  useAdminToken,
  clearAdminToken,
  adminGet,
  type AdminStatus,
} from '../../lib/adminApi';
import { AdminLoginView } from './AdminLoginView';
import {
  LayoutDashboard,
  Receipt,
  Users,
  UserCheck,
  MessageSquare,
  BookOpen,
  Plug,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

/**
 * Chrome and gate for every /admin route.
 *
 * Deliberately styled apart from the marketing site — dark rail, dense type,
 * monospaced figures. An operator should never be unsure which side of the
 * site they are looking at, and a panel that looks like the public homepage
 * invites exactly that mistake.
 *
 * The gate here is a convenience, not the security boundary. Every admin
 * endpoint verifies the session token itself, so hiding the UI is about not
 * showing an empty shell to someone who cannot load data into it.
 */

const NAV = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/enrolments', label: 'Enrolments', icon: Receipt },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/mentors', label: 'Mentors', icon: UserCheck },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/catalogue', label: 'Catalogue', icon: BookOpen },
  { to: '/admin/integrations', label: 'Integrations', icon: Plug },
];

export const AdminLayout: React.FC = () => {
  const token = useAdminToken();
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Asked before anything else: if ADMIN_PASSWORD is unset the panel cannot
  // be used at all, and saying so beats a login box that rejects every
  // password without explaining why.
  useEffect(() => {
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ enabled: false, paystackConnected: false }));
  }, []);

  if (status === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!status.enabled) return <AdminDisabled />;
  if (!token) return <AdminLoginView />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 flex flex-col transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
          <img src="/logo.jpg" alt="" className="w-8 h-8 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="text-xs font-serif font-bold text-white truncate">
              School of Growth
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-500">
              Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            View public site
          </Link>
          <button
            onClick={clearAdminToken}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* ── Workspace ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 sticky top-0 z-20">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg bg-slate-100 text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-serif font-bold">Admin</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

/** Shown when ADMIN_PASSWORD is not set, which disables the panel entirely. */
const AdminDisabled: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center px-4">
    <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-7 h-7 text-amber-500" />
      </div>
      <h1 className="text-xl font-serif font-bold text-white">
        The admin panel is switched off
      </h1>
      <p className="text-xs text-slate-400 leading-relaxed">
        There is no default password, so the panel stays closed until one is set.
        Add <code className="text-amber-400 font-mono">ADMIN_PASSWORD</code> to your
        environment — in <code className="font-mono">.env</code> locally, and in the
        Vercel project settings for the deployed site — then reload this page.
      </p>
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left">
        <p className="text-[10px] font-mono text-slate-500 mb-1">
          Generate a strong one:
        </p>
        <code className="text-[10px] font-mono text-emerald-400 break-all">
          node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
        </code>
      </div>
      <Link
        to="/"
        className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
      >
        Back to the site
      </Link>
    </div>
  </div>
);
