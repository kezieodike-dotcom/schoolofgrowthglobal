import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Handshake, Mail, MessageCircle, Sparkles } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { useFormSubmit, HONEYPOT_PROPS } from '../lib/useFormSubmit';

const OPPORTUNITIES = [
  'Conference Sponsorship', 'Corporate Partnership', 'Institutional Partnership',
  'Government Partnership', 'Education & Training Partnership', 'Media Partnership',
  'Technology Partnership', 'Tourism & Hospitality Partnership', 'Venue Partnership',
  'Travel & Aviation Partnership', 'Financial Services Partnership', 'Youth & Employability Partnership',
  'Leadership Development Partnership', 'Community & Social Impact Partnership',
  'Exhibition & Brand Activation', 'Scholarship Sponsorship', 'Student Support',
  'Awards & Recognition Sponsorship', 'International Conference Partnership',
];

const COMMUNITY = [
  'Students', 'Graduates', 'Entrepreneurs', 'Professionals', 'Business leaders',
  'Young leaders', 'Executives', 'Institutions', 'Government stakeholders', 'Investors',
  'Mentors', 'Coaches', 'Development organizations', 'Global Growth Community members',
];

const CTA_LINKS = [
  ['Become a Sponsor', '#partnership-application'],
  ['Become a Partner', '#partnership-application'],
  ['Support a Student', '/donate'],
  ['Partner for the Global Conference', '#partnership-application'],
] as const;

export const PartnershipView: React.FC = () => {
  const { status, error, submit, sending, reset } = useFormSubmit('contact');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Sponsorship & Partnership"
        icon={<Handshake className="h-4 w-4" />}
        title={<>Partner with the <span className="text-amber-300 lg:text-amber-600">Global Growth Movement.</span></>}
        subtitle="Join School of Growth Global in developing people, strengthening leadership capacity and creating measurable social and economic impact."
        imageSrc="/scenes/summit-audience.jpg"
        imageOnDesktop
      />

      <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-blue-600">Global Growth Conference</p>
            <h2 className="mt-3 max-w-lg text-3xl font-serif font-bold leading-tight text-slate-950 sm:text-4xl">More than a conference. A global growth experience.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">Leadership. Strategy. Transformation.</p>
          </div>
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white"><Sparkles className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">Why partner with us?</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">Partnership opportunities can include brand visibility, speaking opportunities, exhibition space, community engagement, strategic networking, scholarship support, media exposure, corporate social impact and other mutually agreed benefits.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-blue-600">Strategic opportunities</p>
            <h2 className="mt-3 text-3xl font-serif font-bold text-slate-950 sm:text-4xl">Ways to partner with us</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">We welcome strategic partnerships across the following areas.</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OPPORTUNITIES.map((opportunity) => <div key={opportunity} className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_8px_20px_-24px_rgba(15,23,42,0.5)]"><CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />{opportunity}</div>)}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-blue-600">Reach and community</p>
            <h2 className="mt-3 text-3xl font-serif font-bold text-slate-950 sm:text-4xl">Connect with a growing global community.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">Partners can connect with a growing global community of:</p>
          </div>
          <div className="flex flex-wrap content-start gap-3">
            {COMMUNITY.map((group) => <span key={group} className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800">{group}</span>)}
          </div>
        </div>
      </section>

      <section id="partnership-application" className="scroll-mt-24 bg-slate-950 py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-300">Become a sponsor or partner</p>
            <h2 className="mt-3 text-3xl font-serif font-bold sm:text-4xl">Build the future with us.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-300">Your organization can help create opportunities for people to learn, lead, build businesses, develop careers, solve problems and create measurable impact.</p>
            <div className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-amber-300">Official partnership channel</p>
              <a href="mailto:partnerships@schoolofgrowthglobal.com?subject=Global%20Growth%20Conference%20Sponsorship%20%26%20Partnership" className="flex items-center gap-3 text-sm font-semibold text-white hover:text-amber-300"><Mail className="h-4 w-4 text-amber-300" /> partnerships@schoolofgrowthglobal.com</a>
              <a
                href="https://wa.me/2348160030188"
                target="_blank"
                rel="noreferrer"
                aria-label="Reach out on WhatsApp"
                title="Reach out on WhatsApp"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-300 hover:bg-emerald-400/20 hover:text-white"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <span>Reach out on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
            {status === 'sent' ? (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <h3 className="mt-5 text-2xl font-serif font-bold">Expression of interest received</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">The partnership team will review your details and contact you for further discussion.</p>
                <button type="button" onClick={reset} className="mt-6 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">Submit another enquiry</button>
              </div>
            ) : (
              <form onSubmit={(event) => submit(event, { interest: 'Global Growth Conference Sponsorship & Partnership' })} className="space-y-4">
                <div><p className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">Online partnership application</p><h3 className="mt-2 text-2xl font-serif font-bold text-slate-950">Start the conversation</h3><p className="mt-2 text-sm leading-6 text-slate-600">Submit an expression of interest and the appropriate School of Growth Global team will review it.</p></div>
                <input {...HONEYPOT_PROPS} />
                <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Name<input required name="name" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500" /></label><label className="text-xs font-semibold text-slate-600">Email<input required name="email" type="email" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500" /></label></div>
                <label className="block text-xs font-semibold text-slate-600">Organization<input required name="organization" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500" /></label>
                <label className="block text-xs font-semibold text-slate-600">Tell us how you would like to partner<textarea required name="message" rows={5} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500" /></label>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
                <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">{sending ? 'Sending...' : 'Submit partnership enquiry'} <ArrowRight className="h-4 w-4" /></button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-8">
          {CTA_LINKS.map(([label, href]) => href.startsWith('/') ? <Link key={label} to={href} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700">{label}<ArrowRight className="h-3.5 w-3.5" /></Link> : <a key={label} href={href} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700">{label}<ArrowRight className="h-3.5 w-3.5" /></a>)}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-10 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Building2 className="mx-auto h-7 w-7 text-blue-600" />
          <p className="mt-3 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">School of Growth Global</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">A Continental Leadership, Life &amp; Business Transformation Institution.</p>
          <p className="mt-1 text-sm text-slate-500">Helping Individuals, Businesses and Organizations to Grow.</p>
        </div>
      </section>
    </div>
  );
};
