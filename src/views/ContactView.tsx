import React, { useState } from 'react';
import { PageHero } from '../components/PageHero';
import { Mail, Phone, MapPin, Building2, CheckCircle2, Send } from 'lucide-react';

const INTERESTS = [
  'Individual Enrollment',
  'Corporate Training',
  'Government / Public Sector',
  'Mentorship',
  'Partnership',
  'Media / Speaking',
];

export const ContactView: React.FC = () => {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PageHero
        eyebrow="Get In Touch"
        icon={<Mail className="w-4 h-4" />}
        title={<>Talk to Our Team</>}
        subtitle="Whether you're an individual, an organization, or a government agency — we'll help you find the right pathway."
      />

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800"><Mail className="w-5 h-5 text-amber-400" /></div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm text-white">admissions@schoolofgrowth.global</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800"><Phone className="w-5 h-5 text-amber-400" /></div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-sm text-white">+41 44 000 0000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800"><MapPin className="w-5 h-5 text-amber-400" /></div>
              <div>
                <p className="text-xs text-slate-400">Global Campuses</p>
                <p className="text-sm text-white">Zurich • Singapore • New York • London</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white font-serif">Corporate & Government Training</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Custom cohorts, staff onboarding, and leadership academies for teams of 15 to 5,000+. Upload your staff
              list and receive a tailored proposal with reporting dashboards.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          {sent ? (
            <div className="p-10 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Message Sent</h3>
              <p className="text-sm text-slate-400">Thank you — a member of our team will respond within one business day.</p>
              <button
                onClick={() => setSent(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Work Email</label>
                  <input required type="email" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Organization (optional)</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">I'm interested in</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500">
                    {INTERESTS.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Message</label>
                <textarea required rows={5} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 resize-none" placeholder="Tell us about your goals..." />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
