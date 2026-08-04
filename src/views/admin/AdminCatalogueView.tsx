import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Panel, Note, money } from './AdminUI';
import { COURSES, MENTORS, EVENTS, BLOG_POSTS } from '../../data/mockData';
import { PACKAGES, MENTORSHIP_PLANS, type CourseLevel } from '../../lib/pricing';
import { BookOpen, Users, Calendar, FileText, Wallet, ExternalLink } from 'lucide-react';

/**
 * What the public site is currently offering.
 *
 * Read-only, and honest about why: courses, mentors and events live in
 * src/data/mockData.ts and prices live in src/lib/pricing.ts, both of which
 * are compiled into the build. There is nowhere for an edit made here to be
 * written, so this page shows the live content and points at the file that
 * defines it rather than offering a Save button that would do nothing.
 */

const TABS = [
  { id: 'packages', label: 'Packages & pricing', icon: Wallet },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'mentors', label: 'Mentors', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'blog', label: 'Insights', icon: FileText },
] as const;

type TabId = (typeof TABS)[number]['id'];

export const AdminCatalogueView: React.FC = () => {
  const [tab, setTab] = useState<TabId>('packages');

  return (
    <>
      <PageHeader
        title="Catalogue"
        subtitle="Everything the public site is currently selling and showing."
      />

      <div className="flex items-center gap-1 mb-5 overflow-x-auto bg-white p-1 rounded-xl border border-slate-200 w-fit max-w-full">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
              tab === id
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tab === 'packages' && <PackagesTab />}
        {tab === 'courses' && <CoursesTab />}
        {tab === 'mentors' && <MentorsTab />}
        {tab === 'events' && <EventsTab />}
        {tab === 'blog' && <BlogTab />}

        <Note>
          This catalogue is <strong>read-only</strong>. Courses, mentors, events and
          posts are defined in{' '}
          <code className="font-mono text-slate-700">src/data/mockData.ts</code>, and
          prices in{' '}
          <code className="font-mono text-slate-700">src/lib/pricing.ts</code> — both
          compiled into the site, so there is nowhere for an edit made here to be
          saved. Editing from this panel needs a database; until then, changing those
          files and redeploying is the way, and it keeps the advertised price and the
          charged price in lockstep because both read the same file.
        </Note>
      </div>
    </>
  );
};

// ── Packages ─────────────────────────────────────────────────────────────

const PackagesTab: React.FC = () => (
  <>
    <Panel title="Course packages" hint="What a student pays to unlock the curriculum">
      <div className="divide-y divide-slate-100">
        {PACKAGES.map((plan) => (
          <div key={plan.code} className="px-5 py-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-serif font-bold text-slate-900">
                  {plan.name}
                  {plan.highlight && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-mono uppercase tracking-wider align-middle">
                      {plan.highlight}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{plan.tagline}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-serif font-bold text-amber-600 tabular-nums">
                  {money(plan.amountKobo)}
                </p>
                <p className="text-[10px] font-mono text-slate-400">{plan.billing}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {plan.includedLevels.map((level) => (
                <span
                  key={level}
                  className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600"
                >
                  {level}
                </span>
              ))}
              {plan.mentorshipDays > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-700">
                  {plan.mentorshipDays} days mentor access
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>

    <Panel title="Mentorship subscriptions">
      <div className="divide-y divide-slate-100">
        {MENTORSHIP_PLANS.map((plan) => (
          <div key={plan.code} className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-serif font-bold text-slate-900">
                {plan.name.replace('Mentorship — ', '')}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {plan.mentorSlots} mentor{plan.mentorSlots > 1 ? 's' : ''} ·{' '}
                {plan.durationDays} days
              </p>
            </div>
            <p className="text-lg font-serif font-bold text-amber-600 tabular-nums shrink-0">
              {money(plan.amountKobo)}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  </>
);

// ── Courses ──────────────────────────────────────────────────────────────

const CoursesTab: React.FC = () => (
  <Panel
    title={`${COURSES.length} courses`}
    hint="Which package unlocks each one is decided by its level"
  >
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {['Course', 'School', 'Level', 'Unlocked by', 'Duration', ''].map((h, i) => (
              <th
                key={i}
                className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {COURSES.map((course) => {
            const unlockedBy = PACKAGES.find((p) =>
              p.includedLevels.includes(course.level as CourseLevel)
            );
            return (
              <tr key={course.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 text-xs font-medium text-slate-900">
                  {course.title}
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-500">
                  {course.schoolName}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600 whitespace-nowrap">
                    {course.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-[11px] font-mono text-amber-600 whitespace-nowrap">
                  {unlockedBy ? `${unlockedBy.name}+` : '—'}
                </td>
                <td className="px-4 py-3 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                  {course.duration}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-slate-300 hover:text-amber-600 transition-colors"
                    title="View on the public site"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Panel>
);

// ── Mentors ──────────────────────────────────────────────────────────────

const MentorsTab: React.FC = () => (
  <>
    <Panel title={`${MENTORS.length} mentors listed`} hint="The public directory">
      <div className="divide-y divide-slate-100">
        {MENTORS.map((mentor) => (
          <div key={mentor.id} className="px-5 py-3 flex items-center gap-3">
            <img
              src={mentor.avatar}
              alt=""
              className="w-9 h-9 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-900 truncate">
                {mentor.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{mentor.role}</p>
            </div>
            <div className="hidden sm:flex flex-wrap gap-1 max-w-[220px] justify-end">
              {mentor.expertise.slice(0, 2).map((e) => (
                <span
                  key={e}
                  className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600 whitespace-nowrap"
                >
                  {e}
                </span>
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0 w-16 text-right">
              {mentor.availability}
            </span>
          </div>
        ))}
      </div>
    </Panel>

    <Note>
      <strong>Mentor applications do not arrive here.</strong> The five-step form at{' '}
      <code className="font-mono text-slate-700">/register/mentor</code> emails each
      application to your inbox, because there is no database to queue them in.
      Approving a mentor today means adding them to{' '}
      <code className="font-mono text-slate-700">MENTORS</code> in mockData.ts and
      redeploying.
    </Note>
  </>
);

// ── Events & blog ────────────────────────────────────────────────────────

const EventsTab: React.FC = () => (
  <Panel title={`${EVENTS.length} events`}>
    <div className="divide-y divide-slate-100">
      {EVENTS.map((event) => (
        <div key={event.id} className="px-5 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">{event.title}</p>
            <p className="text-[10px] font-mono text-slate-400">
              {event.date} · {event.mode} · {event.location}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-mono text-amber-600">{event.price}</p>
            <p className="text-[10px] font-mono text-slate-400">
              {event.seatsLeft} seats left
            </p>
          </div>
        </div>
      ))}
    </div>
  </Panel>
);

const BlogTab: React.FC = () => (
  <Panel title={`${BLOG_POSTS.length} posts`}>
    <div className="divide-y divide-slate-100">
      {BLOG_POSTS.map((post) => (
        <div key={post.id} className="px-5 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">{post.title}</p>
            <p className="text-[10px] font-mono text-slate-400">
              {post.category} · {post.author} · {post.date}
            </p>
          </div>
          <Link
            to={`/blog/${post.slug}`}
            className="text-slate-300 hover:text-amber-600 shrink-0 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      ))}
    </div>
  </Panel>
);
