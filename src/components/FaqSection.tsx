import React, { useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';
import { SocialShare } from './SocialShare';

const FAQS = [
  ['What is School of Growth Global?', 'School of Growth Global is a growth ecosystem for individuals, professionals, organizations and institutions, combining learning, mentorship, consulting and practical support.'],
  ['How do I enrol in a course?', 'Visit Courses or Pricing, choose a pathway, and follow the enrolment or checkout steps. Your student access is connected to the email used during registration.'],
  ['Can I learn on my phone?', 'Yes. The learning experience is responsive and designed for desktop, tablet and mobile use.'],
  ['How do I become a mentor or consultant?', 'Start from the Enlist page and complete the relevant application. Applications are reviewed before a profile is published.'],
  ['How long does it take to receive a response?', 'The team normally responds within one business day using the email address submitted on your form.'],
  ['How can I contact the institution?', 'Use the Contact page, email infoschoolofgrowth@gmail.com, or use the directions link to find the institution on Google Maps.'],
  ['Do I receive a certificate just for opening lessons?', 'No. Completion and certification depend on the defined course requirements, including required activities, submissions and assessments where applicable.'],
];

export const FaqSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 sm:py-24" aria-labelledby="home-faq-title">
      <div className="mx-auto max-w-[50rem] px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600"><CircleHelp className="h-4 w-4" /> Common questions</div>
          <h2 id="home-faq-title" className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Frequently <span className="text-blue-600">Asked</span></h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">Everything you need to know about School of Growth Global.</p>
        </div>
        <div className="mt-12 space-y-4">
          {FAQS.map(([question, answer], index) => <div key={question} className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_8px_24px_-24px_rgba(15,23,42,0.5)]">
            <button type="button" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index} className="flex min-h-[4.7rem] w-full items-center justify-between gap-5 px-6 py-5 text-left text-[1.05rem] font-semibold text-slate-900 sm:min-h-[5.4rem] sm:px-7 sm:text-lg">
              <span>{question}</span><ChevronDown className={`h-5 w-5 shrink-0 text-slate-700 transition-transform ${open === index ? 'rotate-180' : ''}`} />
            </button>
            {open === index && <p className="border-t border-slate-100 px-6 pb-6 pt-1 text-sm leading-7 text-slate-600 sm:px-7">{answer}</p>}
          </div>)}
        </div>
        <div className="mt-8 flex justify-center"><SocialShare title="Frequently Asked Questions | School of Growth Global" /></div>
      </div>
    </section>
  );
};
