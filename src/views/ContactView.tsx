import React from 'react';
import { PageHero } from '../components/PageHero';
import { Mail, Phone, MapPin, Building2, CheckCircle2, Send, Loader2, AlertCircle } from 'lucide-react';
import { useFormSubmit, HONEYPOT_PROPS } from '../lib/useFormSubmit';

const INTERESTS = [
  'Individual Enrollment',
  'Corporate Training',
  'Government / Public Sector',
  'Mentorship',
  'Partnership',
  'Media / Speaking',
];

export const ContactView: React.FC = () => {
  const { status, error, submit, reset, sending } = useFormSubmit('contact');
  const sent = status === 'sent';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Get In Touch"
        icon={<Mail className="w-4 h-4" />}
        title={<>Talk to Our Team</>}
        subtitle="Whether you're an individual, an organization, or a government agency - we'll help you find the right pathway."
      />

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200"><Mail className="w-5 h-5 text-amber-600" /></div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-900">infoschoolofgrowth@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200"><Phone className="w-5 h-5 text-amber-600" /></div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm text-slate-900">+41 44 000 0000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200"><MapPin className="w-5 h-5 text-amber-600" /></div>
              <div>
                <p className="text-xs text-slate-500">Global Campuses</p>
                <p className="text-sm text-slate-900">Zurich • Singapore • New York • London</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-white to-slate-50 shadow-sm border border-amber-300 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900 font-serif">Corporate & Government Training</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Custom cohorts, staff onboarding, and leadership academies for teams of 15 to 5,000+. Upload your staff
              list and receive a tailored proposal with reporting dashboards.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          {sent ? (
            <div className="p-10 rounded-2xl bg-white shadow-sm border border-emerald-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Message Sent</h3>
              <p className="text-sm text-slate-500">Thank you - a member of our team will respond within one business day.</p>
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="p-8 rounded-2xl bg-white shadow-sm border border-slate-200 space-y-4 text-xs"
            >
              <input {...HONEYPOT_PROPS} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Full Name</label>
                  <input required name="name" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Work Email</label>
                  <input required name="email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Organization (optional)</label>
                  <input name="organization" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">I'm interested in</label>
                  <select name="interest" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500">
                    {INTERESTS.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Message</label>
                <textarea required name="message" rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 resize-none" placeholder="Tell us about your goals..." />
              </div>

              {error && (
                <p className="flex items-start gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                  <span>{error}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
