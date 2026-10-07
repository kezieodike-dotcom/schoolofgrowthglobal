import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { PageHero } from '../components/PageHero';

export const PrivacyView: React.FC = () => <div className="min-h-screen bg-slate-50 text-slate-900">
  <PageHero eyebrow="Trust & Privacy" icon={<FileText className="h-4 w-4" />} title={<>Privacy Policy</>} subtitle="How School of Growth Global handles information submitted through this website." />
  <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
    <article className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600 shadow-sm sm:p-10">
      <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Last updated: October 2026</p>
      <section><h2 className="text-xl font-serif font-bold text-slate-900">Information we collect</h2><p>We collect information you choose to provide through registration, contact, mentor, consultant, course and newsletter forms. This may include your name, email address, organization, professional information and submitted responses.</p></section>
      <section><h2 className="text-xl font-serif font-bold text-slate-900">How we use information</h2><p>We use submitted information to respond to enquiries, process applications, provide learning and mentorship services, maintain programme records, improve the website and send requested updates.</p></section>
      <section><h2 className="text-xl font-serif font-bold text-slate-900">Cookies</h2><p>Essential browser storage may be used to remember your cookie preference and preserve parts of your learning experience. Optional analytics or marketing cookies are not enabled by this notice unless you choose to accept them.</p></section>
      <section><h2 className="text-xl font-serif font-bold text-slate-900">Third-party services</h2><p>We may use trusted service providers for email delivery, payments, authentication, hosting and file storage. Those providers process information only as needed to provide their service and under their own applicable policies.</p></section>
      <section><h2 className="text-xl font-serif font-bold text-slate-900">Your choices</h2><p>You may ask us to access, correct or delete personal information we hold about you, subject to applicable legal and operational requirements. Contact <a className="font-semibold text-amber-700 underline" href="mailto:infoschoolofgrowth@gmail.com">infoschoolofgrowth@gmail.com</a> for privacy questions.</p></section>
      <p>For general questions, visit our <Link to="/contact" className="font-semibold text-amber-700 underline">Contact page</Link>.</p>
    </article>
  </main>
</div>;
