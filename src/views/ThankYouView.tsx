import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const ThankYouView: React.FC = () => <div className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 py-16 text-center">
  <div className="max-w-xl rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm sm:p-12">
    <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
    <p className="mt-6 text-xs font-mono uppercase tracking-widest text-amber-700">Message received</p>
    <h1 className="mt-3 text-3xl font-serif font-bold text-slate-900">Thank you for reaching out.</h1>
    <p className="mt-4 text-sm leading-7 text-slate-600">Your message is with the School of Growth Global team. We will review it and respond using the email address you provided.</p>
    <Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400">Return home <ArrowRight className="h-4 w-4" /></Link>
  </div>
</div>;
