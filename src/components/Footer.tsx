import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useFormSubmit, HONEYPOT_PROPS } from '../lib/useFormSubmit';

export const Footer: React.FC = () => {
  const newsletter = useFormSubmit('newsletter');

  return (
    <footer className="bg-slate-100 text-slate-600 border-t border-slate-200 font-sans text-sm">
      {/* Top Banner / Accreditation bar */}
      <div className="border-b border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-slate-900 font-medium text-sm">Globally Accredited Excellence</h4>
              <p className="text-xs text-slate-500">Certified by the International Council for Executive Education &amp; Governance</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-mono">
            <span>• 10,000+ Alumni</span>
            <span>• 50+ Countries</span>
            <span>• ISO 21001 Certified</span>
            <span>• 94% Career Progression</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="School of Growth Global crest"
                className="w-10 h-10 rounded-lg object-cover ring-1 ring-amber-500/20"
              />
              <span className="font-serif font-bold text-lg text-slate-900 tracking-tight">
                SCHOOL OF GROWTH GLOBAL
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              A world-class digital institution raising transformational leaders, entrepreneurs, and
              organizations through education, mentorship, consulting, and innovation.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-600">
              <Globe className="w-4 h-4 text-amber-600" />
              <span>Global Headquarters: Zurich • Singapore • New York • London</span>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-3">
            <h5 className="text-slate-900 font-semibold text-xs uppercase tracking-wider font-mono">Explore</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/courses" className="hover:text-amber-700 transition-colors">Courses &amp; Programs</Link></li>
              <li><Link to="/mentorship" className="hover:text-amber-700 transition-colors">Mentorship</Link></li>
              <li><Link to="/jobs" className="hover:text-amber-700 transition-colors">Career Jobs</Link></li>
              <li><Link to="/pricing" className="hover:text-amber-700 transition-colors">Tuition &amp; Packages</Link></li>
              <li><Link to="/events" className="hover:text-amber-700 transition-colors">Events &amp; Summits</Link></li>
              <li><Link to="/blog" className="hover:text-amber-700 transition-colors">Knowledge Centre</Link></li>
            </ul>
          </div>

          {/* Column 2: Ecosystem */}
          <div className="space-y-3">
            <h5 className="text-slate-900 font-semibold text-xs uppercase tracking-wider font-mono">Ecosystem</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/portal" className="hover:text-amber-700 transition-colors">Student Portal</Link></li>
              <li>
                <Link to="/command-center" className="hover:text-amber-700 transition-colors flex items-center gap-1.5 text-amber-600">
                  <span>Growth AI Workspace</span>
                  <span className="px-1 rounded bg-amber-100 text-[9px] font-mono">LIVE</span>
                </Link>
              </li>
              <li><Link to="/contact" className="hover:text-amber-700 transition-colors">Corporate Training</Link></li>
              <li><Link to="/about" className="hover:text-amber-700 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-amber-700 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-3">
            <h5 className="text-slate-900 font-semibold text-xs uppercase tracking-wider font-mono">Executive Intelligence</h5>
            <p className="text-xs text-slate-500">
              Receive bi-weekly strategic briefings on geopolitical risk, AI governance, and macro-scaling.
            </p>
            {newsletter.status === 'sent' ? (
              <p className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>You're subscribed. Watch your inbox for the next briefing.</span>
              </p>
            ) : (
              <form onSubmit={newsletter.submit} className="space-y-2">
                <input {...HONEYPOT_PROPS} />
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="executive@organization.com"
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={newsletter.sending}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {newsletter.sending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Subscribing...</span></>
                  ) : (
                    <><span>Subscribe Briefings</span><ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
                {newsletter.error && (
                  <p className="text-[11px] text-rose-600">{newsletter.error}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} School of Growth Global. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="#" className="hover:text-slate-900">Privacy Protocol</a>
            <a href="#" className="hover:text-slate-900">Institutional Terms</a>
            <a href="#" className="hover:text-slate-900">Academic Integrity</a>
            <a href="#" className="hover:text-slate-900">Security &amp; Compliance</a>
            {/*
              Plain text among the legal links rather than a button. The panel
              is password-gated server-side, so this is a convenience for the
              operator, not a thing to advertise to visitors.
            */}
            <Link to="/admin" className="hover:text-slate-900">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
