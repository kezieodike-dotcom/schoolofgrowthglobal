import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SCHOOLS } from '../data/mockData';
import { SchoolIcon, accent } from '../lib/icons';
import { PageHero } from '../components/PageHero';
import { GraduationCap, ArrowRight, Search } from 'lucide-react';

export const SchoolsView: React.FC = () => {
  const [query, setQuery] = useState('');

  const schools = SCHOOLS.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.tagline.toLowerCase().includes(query.toLowerCase()) ||
      s.keyTopics.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <PageHero
        eyebrow="Academic Architecture"
        icon={<GraduationCap className="w-4 h-4" />}
        title={<>14 Global Schools. <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">One Standard of Excellence.</span></>}
        subtitle="Specialized faculties offering accredited programs, expert instructors, defined career paths, and globally verifiable certifications."
      />

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="relative max-w-md mb-10">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter schools by name or topic..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => {
            const a = accent(school.accentColor);
            return (
              <Link
                key={school.id}
                to={`/schools/${school.id}`}
                className={`group p-6 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 ${a.border} transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${a.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
                      <SchoolIcon name={school.iconName} className={`w-6 h-6 ${a.text}`} />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {school.code} • {school.programCount} Programs
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                    {school.name}
                  </h3>
                  <p className={`text-xs font-mono ${a.text} mb-3`}>{school.tagline}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{school.overview}</p>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {school.keyTopics.slice(0, 3).map((topic, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800/80">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold group-hover:text-amber-300">
                  <span>Explore Faculty</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {schools.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">No schools match "{query}".</div>
        )}
      </section>
    </div>
  );
};
