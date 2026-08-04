import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HeaderNavbar } from './HeaderNavbar';
import { Footer } from './Footer';
import { GrowthAIFloatingWidget } from './GrowthAIFloatingWidget';
import { TierPreviewSwitcher } from './TierPreviewSwitcher';

/** Scrolls to top on every route change. */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

export const Layout: React.FC = () => {
  const { pathname } = useLocation();
  // The Command Center is a full-screen workspace — hide the marketing chrome there.
  const isCommandCenter = pathname.startsWith('/command-center');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <ScrollToTop />
      <HeaderNavbar />

      <div className="flex-1">
        <Outlet />
      </div>

      {!isCommandCenter && <GrowthAIFloatingWidget />}
      {!isCommandCenter && <Footer />}

      {/* Development only — stripped from production builds. */}
      <TierPreviewSwitcher />
    </div>
  );
};
