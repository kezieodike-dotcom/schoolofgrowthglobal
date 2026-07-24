import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 font-sans text-sm">
      {/* Top Banner / Accreditation bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="text-white font-medium text-sm">Globally Accredited Excellence</h4>
              <p className="text-xs text-slate-400">Certified by the International Council for Executive Education &amp; Governance</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
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
              <span className="font-serif font-bold text-lg text-white tracking-tight">
                SCHOOL OF GROWTH GLOBAL
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A world-class digital institution raising transformational leaders, entrepreneurs, and
              organizations through education, mentorship, consulting, and innovation.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-300">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Global Headquarters: Zurich • Singapore • New York • London</span>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">Explore</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/schools" className="hover:text-amber-300 transition-colors">Schools &amp; Faculties</Link></li>
              <li><Link to="/courses" className="hover:text-amber-300 transition-colors">Courses &amp; Programs</Link></li>
              <li><Link to="/mentors" className="hover:text-amber-300 transition-colors">Mentor Marketplace</Link></li>
              <li><Link to="/events" className="hover:text-amber-300 transition-colors">Events &amp; Summits</Link></li>
              <li><Link to="/blog" className="hover:text-amber-300 transition-colors">Knowledge Centre</Link></li>
            </ul>
          </div>

          {/* Column 2: Ecosystem */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">Ecosystem</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/portal" className="hover:text-amber-300 transition-colors">Student Portal</Link></li>
              <li>
                <Link to="/command-center" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 text-amber-400">
                  <span>Growth AI Workspace</span>
                  <span className="px-1 rounded bg-amber-500/20 text-[9px] font-mono">LIVE</span>
                </Link>
              </li>
              <li><Link to="/contact" className="hover:text-amber-300 transition-colors">Corporate Training</Link></li>
              <li><Link to="/about" className="hover:text-amber-300 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-amber-300 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">Executive Intelligence</h5>
            <p className="text-xs text-slate-400">
              Receive bi-weekly strategic briefings on geopolitical risk, AI governance, and macro-scaling.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="executive@organization.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Subscribe Briefings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} School of Growth Global. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Protocol</a>
            <a href="#" className="hover:text-slate-300">Institutional Terms</a>
            <a href="#" className="hover:text-slate-300">Academic Integrity</a>
            <a href="#" className="hover:text-slate-300">Security &amp; Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
