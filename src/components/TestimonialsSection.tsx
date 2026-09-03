import React from 'react';
import { TestimonialsColumn } from '@/components/ui/testimonials-columns-1';
import { USER_TESTIMONIALS } from '../data/mockData';

const firstColumn = USER_TESTIMONIALS.slice(0, 3);
const secondColumn = USER_TESTIMONIALS.slice(3, 6);
const thirdColumn = USER_TESTIMONIALS.slice(6, 9);

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="bg-white py-20 relative border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600">
            Proven Global Outcomes
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-slate-900 mt-4">
            What Our Leaders Say
          </h2>
          <p className="text-center mt-4 text-sm text-slate-500">
            Hear from Managing Directors, Founders, and C-Suite alumni who scaled global impact with our frameworks.
          </p>
        </div>

        <div className="flex justify-center gap-6 mt-12 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden text-slate-700 text-sm">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};
