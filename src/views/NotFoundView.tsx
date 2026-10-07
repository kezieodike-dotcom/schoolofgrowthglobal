import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundView: React.FC = () => <div className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 py-16 text-center">
  <div className="max-w-lg">
    <Compass className="mx-auto h-12 w-12 text-amber-600" />
    <p className="mt-6 text-xs font-mono uppercase tracking-widest text-slate-500">404</p>
    <h1 className="mt-2 text-3xl font-serif font-bold text-slate-900">This page has moved.</h1>
    <p className="mt-3 text-sm leading-7 text-slate-600">The page you requested is not available at this address. Use the main pathways below to continue your growth journey.</p>
    <Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"><ArrowLeft className="h-4 w-4" /> Back to homepage</Link>
  </div>
</div>;
