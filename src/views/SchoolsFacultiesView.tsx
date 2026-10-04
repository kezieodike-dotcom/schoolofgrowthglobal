import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronDown, Search, Sparkles } from 'lucide-react';
import architecture from '../data/facultyArchitecture.json';

type School = {
  number: number;
  title: string;
  notes?: string[];
  subjects?: string[];
  core_areas?: string[];
  designed_for?: string[];
  subjects_include?: string[];
};

type Faculty = {
  number: number;
  title: string;
  notes?: string[];
  schools: School[];
};

const faculties = architecture.faculties as Faculty[];

function schoolMatches(school: School, query: string): boolean {
  if (!query) return true;
  const values = [
    school.title,
    ...(school.notes ?? []),
    ...(school.subjects ?? []),
    ...(school.core_areas ?? []),
    ...(school.designed_for ?? []),
    ...(school.subjects_include ?? []),
  ];
  return values.some((value) => value.toLowerCase().includes(query));
}

function SchoolDetails({ school }: { school: School }) {
  const lists = [
    ['Core areas', school.core_areas],
    ['Subjects', school.subjects],
    ['Designed for', school.designed_for],
    ['Subjects include', school.subjects_include],
  ].filter(([, values]) => values && values.length > 0) as [string, string[]][];

  return (
    <div className="border-t border-slate-200 bg-slate-50/70 px-4 pb-5 pt-4 sm:px-6">
      {(school.notes ?? []).map((note) => (
        <p key={note} className="mb-4 text-sm italic leading-6 text-slate-600">
          {note.replace(/^\*|\*$/g, '')}
        </p>
      ))}
      <div className="grid gap-5 sm:grid-cols-2">
        {lists.map(([label, values]) => (
          <div key={label}>
            <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-700">{label}</p>
            <ul className="grid gap-1.5">
              {values.map((value) => (
                <li key={value} className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export const SchoolsFacultiesView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [openFaculty, setOpenFaculty] = useState(1);
  const [openSchool, setOpenSchool] = useState<number | null>(null);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleFaculties = useMemo(
    () => faculties
      .map((faculty) => ({
        ...faculty,
        schools: faculty.schools.filter((school) => schoolMatches(school, normalizedQuery)),
      }))
      .filter((faculty) => faculty.schools.length > 0),
    [normalizedQuery]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-slate-950 py-20 sm:py-24 lg:py-28">
        <img src="/scenes/leadership-meeting.jpg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center opacity-25" />
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.16em] text-amber-300">
              <BookOpen className="h-4 w-4" />
              <span>Global Faculty &amp; School Architecture</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-serif font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl">
              A global architecture for growth, leadership and transformation.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              {architecture.institutionalPositioning}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-mono uppercase tracking-[0.14em] text-amber-200">
              <span>{architecture.architectureStatement}</span>
              <span className="text-slate-500">62 specialized schools</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-10 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-amber-700">Explore the institution</p>
            <h2 className="mt-2 text-3xl font-serif font-bold text-slate-950">Faculties and specialized schools</h2>
          </div>
          <label className="relative block w-full max-w-sm">
            <span className="sr-only">Search faculties and schools</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search schools or subjects"
              className="w-full border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </label>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {visibleFaculties.map((faculty) => {
          const isOpen = openFaculty === faculty.number || Boolean(normalizedQuery);
          return (
            <section key={faculty.number} className="overflow-hidden border border-slate-200 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.04)]">
              <button
                type="button"
                onClick={() => setOpenFaculty(isOpen ? 0 : faculty.number)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-5 px-4 py-5 text-left transition hover:bg-amber-50/40 sm:px-6 sm:py-6"
              >
                <span className="flex min-w-0 items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-amber-300 bg-amber-50 text-xs font-mono font-bold text-amber-800">
                    {String(faculty.number).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">Faculty {faculty.number}</span>
                    <span className="mt-1 block text-lg font-serif font-bold leading-tight text-slate-950 sm:text-xl">{faculty.title}</span>
                  </span>
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-amber-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="border-t border-slate-200 px-3 py-3 sm:px-5 sm:py-5">
                  {faculty.notes?.map((note) => (
                    <p key={note} className="mb-4 text-sm italic leading-6 text-slate-600">{note.replace(/^\*|\*$/g, '')}</p>
                  ))}
                  <div className="grid gap-3 lg:grid-cols-2">
                    {faculty.schools.map((school) => {
                      const schoolOpen = openSchool === school.number || Boolean(normalizedQuery);
                      const hasDetails = Boolean(
                        school.notes?.length || school.subjects?.length || school.core_areas?.length || school.designed_for?.length || school.subjects_include?.length
                      );
                      return (
                        <div key={school.number} className="overflow-hidden border border-slate-200 bg-white">
                          <button
                            type="button"
                            onClick={() => setOpenSchool(schoolOpen ? null : school.number)}
                            aria-expanded={schoolOpen}
                            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50"
                          >
                            <span className="flex items-start gap-3">
                              <span className="font-mono text-[11px] text-amber-700">{String(school.number).padStart(2, '0')}</span>
                              <span className="text-sm font-semibold leading-6 text-slate-800">{school.title}</span>
                            </span>
                            {hasDetails && <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${schoolOpen ? 'rotate-180' : ''}`} />}
                          </button>
                          {schoolOpen && hasDetails && <SchoolDetails school={school} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {visibleFaculties.length === 0 && (
          <div className="border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-900">No school matches that search.</p>
            <button type="button" onClick={() => setQuery('')} className="mt-3 text-xs font-bold text-amber-700 hover:text-amber-800">Clear search</button>
          </div>
        )}
      </main>

      <section className="border-t border-slate-200 bg-amber-50 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-serif font-bold text-slate-950">Find the right starting point for your growth.</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Explore programmes or speak with the School of Growth Global team.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/courses" className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800">Explore programmes <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/contact" className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:border-amber-400">Contact the institution <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
};
