import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  Panel,
  useAdminData,
  LoadingState,
  ErrorState,
  EmptyState,
  Note,
} from './AdminUI';
import { adminPost, adminUploadImage } from '../../lib/adminApi';
import { BLOG_POSTS, COURSES, EVENTS, FACULTY_MEMBERS, GROWTH_JOBS } from '../../data/mockData';
import {
  CONTENT_LABEL,
  mergeContent,
  slugify,
  type ContentKind,
  type ContentRecord,
} from '../../lib/content';
import type { BlogPost, Course, EventItem, FacultyMember, GrowthJob } from '../../types';
import {
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Newspaper,
  Plus,
  RotateCcw,
  Save,
  Users,
} from 'lucide-react';

interface AdminContentResponse {
  kind: ContentKind;
  writable: boolean;
  mode: 'supabase' | 'local-json';
  records: ContentRecord[];
}

type ManagedItem = Course | EventItem | FacultyMember | GrowthJob | BlogPost;
type Draft = Record<string, string | boolean>;

interface Field {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'image';
  options?: string[];
  wide?: boolean;
}

const TABS: { id: ContentKind; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'course', label: 'Courses', icon: BookOpen },
  { id: 'event', label: 'Events', icon: Calendar },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'job', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'insight', label: 'Insights', icon: Newspaper },
];

const SEED: Record<ContentKind, ManagedItem[]> = {
  course: COURSES,
  event: EVENTS,
  team: FACULTY_MEMBERS,
  job: GROWTH_JOBS,
  insight: BLOG_POSTS,
};

const SINGULAR_LABEL: Record<ContentKind, string> = {
  course: 'Course',
  event: 'Event',
  team: 'Team member',
  job: 'Job',
  insight: 'Insight',
};

const FIELDS: Record<ContentKind, Field[]> = {
  course: [
    { key: 'title', label: 'Course title', wide: true },
    { key: 'schoolName', label: 'School' },
    { key: 'schoolId', label: 'School slug' },
    {
      key: 'level',
      label: 'Level',
      type: 'select',
      options: ['Executive', 'Emerging Leaders', 'Senior Directorate', 'Frontier'],
    },
    { key: 'duration', label: 'Duration' },
    { key: 'format', label: 'Format' },
    { key: 'instructorName', label: 'Instructor' },
    { key: 'instructorRole', label: 'Instructor role' },
    { key: 'status', label: 'Status' },
    { key: 'price', label: 'Display price' },
    { key: 'liveClassUrl', label: 'Live class / meeting link', wide: true },
    { key: 'heroImage', label: 'Hero image', type: 'image', wide: true },
    { key: 'instructorAvatar', label: 'Instructor image', type: 'image', wide: true },
    { key: 'description', label: 'Description', type: 'textarea', wide: true },
    { key: 'outcomes', label: 'Learning outcomes, one per line', type: 'textarea', wide: true },
    { key: 'rating', label: 'Rating', type: 'number' },
    { key: 'reviewCount', label: 'Review count', type: 'number' },
    { key: 'featured', label: 'Feature this course', type: 'checkbox' },
  ],
  event: [
    { key: 'title', label: 'Event title', wide: true },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: ['Conference', 'Webinar', 'Seminar', 'Workshop', 'Bootcamp', 'Virtual Summit'],
    },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'location', label: 'Location' },
    { key: 'mode', label: 'Mode', type: 'select', options: ['In-Person', 'Virtual', 'Hybrid'] },
    { key: 'speaker', label: 'Speaker' },
    { key: 'price', label: 'Price' },
    { key: 'seatsLeft', label: 'Seats left', type: 'number' },
    { key: 'liveClassUrl', label: 'Live class / meeting link', wide: true },
    { key: 'image', label: 'Image', type: 'image', wide: true },
    { key: 'description', label: 'Description', type: 'textarea', wide: true },
  ],
  team: [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'institution', label: 'Institution' },
    { key: 'avatar', label: 'Photo', type: 'image', wide: true },
    { key: 'bio', label: 'Bio', type: 'textarea', wide: true },
    { key: 'credentials', label: 'Credentials, one per line', type: 'textarea', wide: true },
  ],
  job: [
    { key: 'title', label: 'Job title', wide: true },
    { key: 'organization', label: 'Organization' },
    { key: 'location', label: 'Location' },
    { key: 'workMode', label: 'Work mode', type: 'select', options: ['Remote', 'Hybrid', 'On-site'] },
    { key: 'type', label: 'Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
    { key: 'level', label: 'Level' },
    { key: 'salary', label: 'Salary / compensation', wide: true },
    { key: 'posted', label: 'Posted date' },
    { key: 'closes', label: 'Closing date' },
    { key: 'applicationEmail', label: 'Application email', wide: true },
    { key: 'image', label: 'Image', type: 'image', wide: true },
    { key: 'summary', label: 'Summary', type: 'textarea', wide: true },
    { key: 'requirements', label: 'Requirements, one per line', type: 'textarea', wide: true },
    { key: 'tags', label: 'Tags, one per line', type: 'textarea', wide: true },
    { key: 'featured', label: 'Feature this job', type: 'checkbox' },
  ],
  insight: [
    { key: 'title', label: 'Insight title', wide: true },
    { key: 'slug', label: 'URL slug' },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: ['Leadership', 'Strategy', 'Finance', 'Technology', 'Wealth Creation', 'Personal Growth'],
    },
    { key: 'author', label: 'Author' },
    { key: 'authorRole', label: 'Author role' },
    { key: 'readTime', label: 'Read time' },
    { key: 'date', label: 'Date' },
    { key: 'image', label: 'Image', type: 'image', wide: true },
    { key: 'excerpt', label: 'Excerpt', type: 'textarea', wide: true },
    { key: 'featured', label: 'Feature this insight', type: 'checkbox' },
  ],
};

function defaultsFor(kind: ContentKind): ManagedItem {
  if (kind === 'course') {
    return {
      id: '',
      title: '',
      schoolId: '',
      schoolName: '',
      duration: '8 weeks',
      level: 'Executive',
      format: 'Hybrid',
      instructorName: '',
      instructorRole: '',
      instructorAvatar: '/logo.jpg',
      rating: 4.8,
      reviewCount: 0,
      status: 'Open for enrolment',
      heroImage: '/scenes/hero-team.jpg',
      description: '',
      outcomes: [],
      modules: [],
      price: 'Included in package',
      featured: false,
      liveClassUrl: '',
    } satisfies Course;
  }

  if (kind === 'event') {
    return {
      id: '',
      title: '',
      type: 'Workshop',
      date: 'Date to be announced',
      time: '09:00 WAT',
      location: 'Online',
      mode: 'Virtual',
      speaker: '',
      description: '',
      price: 'Free',
      seatsLeft: 50,
      image: '/scenes/hero-team.jpg',
      liveClassUrl: '',
    } satisfies EventItem;
  }

  if (kind === 'job') {
    return {
      id: '',
      title: '',
      organization: 'School of Growth Global Partner Network',
      location: 'Remote, Africa-friendly hours',
      workMode: 'Hybrid',
      type: 'Full-time',
      level: 'Professional',
      salary: 'Competitive compensation',
      posted: new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }),
      closes: 'Open until filled',
      summary: '',
      requirements: [],
      tags: [],
      image: '/scenes/bootcamp-team.jpg',
      applicationEmail: '',
      featured: false,
    } satisfies GrowthJob;
  }

  if (kind === 'insight') {
    return {
      id: '',
      slug: '',
      title: '',
      category: 'Leadership',
      excerpt: '',
      author: 'School of Growth Faculty',
      authorRole: 'Faculty Contributor',
      readTime: '5 min read',
      date: new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: '/scenes/leadership-meeting.jpg',
      featured: false,
    } satisfies BlogPost;
  }

  return {
    id: '',
    name: '',
    role: '',
    institution: 'School of Growth Global',
    bio: '',
    credentials: [],
    avatar: '/logo.jpg',
  } satisfies FacultyMember;
}

function itemTitle(kind: ContentKind, item: ManagedItem): string {
  if (kind === 'team') return (item as FacultyMember).name;
  return (item as Course | EventItem | GrowthJob | BlogPost).title;
}

function itemSubtitle(kind: ContentKind, item: ManagedItem): string {
  if (kind === 'course') {
    const course = item as Course;
    return `${course.schoolName} / ${course.level} / ${course.duration}`;
  }
  if (kind === 'event') {
    const event = item as EventItem;
    return `${event.date} / ${event.mode} / ${event.location}`;
  }
  if (kind === 'job') {
    const job = item as GrowthJob;
    return `${job.organization} / ${job.workMode} / closes ${job.closes}`;
  }
  if (kind === 'insight') {
    const post = item as BlogPost;
    return `${post.category} / ${post.author} / ${post.date}`;
  }
  const member = item as FacultyMember;
  return `${member.role} / ${member.institution}`;
}

function toDraft(kind: ContentKind, item: ManagedItem): Draft {
  const draft: Draft = {};
  for (const field of FIELDS[kind]) {
    const value = (item as any)[field.key];
    draft[field.key] = Array.isArray(value) ? value.join('\n') : value ?? '';
  }
  draft.id = item.id;
  return draft;
}

function fromDraft(kind: ContentKind, draft: Draft, original?: ManagedItem): ManagedItem {
  const base = { ...(original ?? defaultsFor(kind)) } as any;
  for (const field of FIELDS[kind]) {
    const value = draft[field.key];
    if (field.type === 'checkbox') base[field.key] = Boolean(value);
    else if (field.type === 'number') base[field.key] = Number(value || 0);
    else if (field.type === 'textarea' && ['outcomes', 'credentials', 'requirements', 'tags'].includes(field.key)) {
      base[field.key] = String(value ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    } else {
      base[field.key] = String(value ?? '').trim();
    }
  }

  const title = kind === 'team' ? base.name : base.title;
  base.id = String(draft.id || base.id || slugify(title));
  if (kind === 'course' && !base.schoolId) base.schoolId = slugify(base.schoolName);
  if (kind === 'insight' && !base.slug) base.slug = slugify(base.title);
  return base as ManagedItem;
}

export const AdminCatalogueView: React.FC = () => {
  const [kind, setKind] = useState<ContentKind>('course');
  const { data, error, loading, reload } = useAdminData<AdminContentResponse>(
    `/content?kind=${kind}`
  );
  const records = data?.records ?? [];
  const recordMap = useMemo(() => new Map(records.map((row) => [row.id, row])), [records]);
  const items = useMemo(() => mergeContent(SEED[kind], records), [kind, records]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const selectedRecord = selected ? recordMap.get(selected.id) : undefined;

  useEffect(() => {
    setSelectedId(null);
  }, [kind]);

  return (
    <>
      <PageHeader
        title="Content studio"
        subtitle="Add, edit, publish and retire public courses, events, team members, jobs and insights from one workspace."
        action={
          <Link
            to="/admin/mentors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Review mentors
          </Link>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5 items-start">
        <aside className="space-y-4">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setKind(id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold whitespace-nowrap transition-colors ${
                  kind === id ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <Panel
            title={CONTENT_LABEL[kind]}
            hint={`${items.length} visible on the public site`}
            action={
              <button
                onClick={() => setSelectedId('__new__')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 text-slate-950 text-[11px] font-bold hover:bg-amber-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            }
          >
            {loading && !data && <LoadingState label="Loading content" />}
            {error && <ErrorState message={error} onRetry={reload} />}
            {!loading && !error && items.length === 0 && (
              <EmptyState title="No content yet" body={`Add the first ${CONTENT_LABEL[kind].toLowerCase()} record.`} />
            )}
            {!error && items.length > 0 && (
              <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
                {items.map((item) => {
                  const record = recordMap.get(item.id);
                  const active = selected?.id === item.id && selectedId !== '__new__';
                  const unpublished = record?.published === false;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        active ? 'bg-amber-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{itemTitle(kind, item)}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-1">{itemSubtitle(kind, item)}</p>
                        </div>
                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase ${
                            unpublished
                              ? 'bg-slate-100 text-slate-400 border-slate-200'
                              : record
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          {unpublished ? 'Hidden' : record ? 'Managed' : 'Seed'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Panel>

          {data && (
            <Note>
              Storage mode: <strong>{data.mode === 'supabase' ? 'Supabase' : 'local JSON'}</strong>.
              {data.mode === 'local-json'
                ? ' Add Supabase environment variables before deploying if you want production edits to persist on Vercel.'
                : ' Writes are saved through the server using the service-role key; that key is never sent to the browser.'}
            </Note>
          )}
        </aside>

        <ContentForm
          key={`${kind}-${selectedId ?? selected?.id ?? 'first'}`}
          kind={kind}
          item={selectedId === '__new__' ? defaultsFor(kind) : selected}
          record={selectedId === '__new__' ? undefined : selectedRecord}
          writable={data?.writable ?? false}
          onSaved={(id) => {
            setSelectedId(id);
            reload();
          }}
          onReload={reload}
        />
      </div>
    </>
  );
};

const ContentForm: React.FC<{
  kind: ContentKind;
  item: ManagedItem | null;
  record?: ContentRecord;
  writable: boolean;
  onSaved: (id: string) => void;
  onReload: () => void;
}> = ({ kind, item, record, writable, onSaved, onReload }) => {
  const [draft, setDraft] = useState<Draft>(() => toDraft(kind, item ?? defaultsFor(kind)));
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const published = record?.published !== false;

  const update = (key: string, value: string | boolean) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const uploadFieldImage = async (fieldKey: string, file: File | null) => {
    if (!file) return;
    setUploadingField(fieldKey);
    setError(null);
    setMessage(null);
    try {
      const upload = await adminUploadImage(file, { kind, field: fieldKey });
      update(fieldKey, upload.url);
      setMessage(`Image uploaded. Save changes to publish it with this ${SINGULAR_LABEL[kind].toLowerCase()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that image.');
    } finally {
      setUploadingField(null);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const next = fromDraft(kind, draft, item ?? undefined);
      await adminPost(`/content/${kind}`, { item: next, published: true });
      setMessage(`${SINGULAR_LABEL[kind]} saved.`);
      onSaved(next.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this item.');
    } finally {
      setSaving(false);
    }
  };

  const publish = async (nextPublished: boolean) => {
    if (!item) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await adminPost(`/content/${kind}/${item.id}/publish`, {
        published: nextPublished,
        item,
      });
      setMessage(nextPublished ? 'Published.' : 'Hidden from public site.');
      onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update publishing.');
    } finally {
      setSaving(false);
    }
  };

  const resetOverride = async () => {
    if (!item) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await adminPost(`/content/${kind}/${item.id}/delete`, {});
      setMessage('Custom override removed.');
      onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset this item.');
    } finally {
      setSaving(false);
    }
  };

  if (!item) {
    return (
      <Panel>
        <EmptyState title="Choose an item" body="Select a record from the list or add a new one." />
      </Panel>
    );
  }

  return (
    <Panel
      title={draft.title || draft.name ? String(draft.title || draft.name) : `New ${SINGULAR_LABEL[kind].toLowerCase()}`}
      hint={record ? `Managed record / updated ${new Date(record.updatedAt).toLocaleDateString('en-NG')}` : 'Seed content until saved'}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => publish(!published)}
            disabled={!writable || saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-[11px] font-bold text-slate-700 transition-colors"
          >
            {published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {published ? 'Hide' : 'Publish'}
          </button>
          {record && (
            <button
              type="button"
              onClick={resetOverride}
              disabled={!writable || saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-40 text-[11px] font-bold text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      }
    >
      <form onSubmit={save} className="p-5 space-y-5">
        {!writable && (
          <p className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            Content storage is not writable. Configure Supabase for production, or run locally with a writable data directory.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {FIELDS[kind].map((field) => {
            const value = String(draft[field.key] ?? '');

            if (field.type === 'image') {
              return (
                <div key={field.key} className={`block space-y-1.5 ${field.wide ? 'lg:col-span-2' : ''}`}>
                  <span className="text-[11px] font-bold text-slate-600">{field.label}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="h-24 w-24 overflow-hidden rounded-md border border-slate-200 bg-white">
                      {value ? (
                        <img src={value} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-slate-300">
                          <ImagePlus className="h-6 w-6" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 space-y-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(event) => update(field.key, event.target.value)}
                        placeholder="Paste an image URL or upload a file"
                        className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <label
                          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-700 ${
                            !writable || saving || uploadingField ? 'pointer-events-none opacity-50' : ''
                          }`}
                        >
                          {uploadingField === field.key ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ImagePlus className="h-3.5 w-3.5" />
                          )}
                          {uploadingField === field.key ? 'Uploading' : 'Upload image'}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            disabled={!writable || saving || Boolean(uploadingField)}
                            className="sr-only"
                            onChange={(event) => {
                              void uploadFieldImage(field.key, event.target.files?.[0] ?? null);
                              event.currentTarget.value = '';
                            }}
                          />
                        </label>
                        <span className="text-[10px] font-medium text-slate-500">JPG, PNG, WebP or GIF up to 5MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <label
                key={field.key}
                className={`block space-y-1.5 ${field.wide ? 'lg:col-span-2' : ''}`}
              >
                <span className="text-[11px] font-bold text-slate-600">{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    value={value}
                    onChange={(event) => update(field.key, event.target.value)}
                    rows={field.key === 'description' || field.key === 'bio' ? 5 : 4}
                    className="w-full resize-y rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={value}
                    onChange={(event) => update(field.key, event.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <span className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={Boolean(draft[field.key])}
                      onChange={(event) => update(field.key, event.target.checked)}
                      className="h-4 w-4 accent-amber-500"
                    />
                    <span className="text-xs text-slate-600">Show as highlighted content</span>
                  </span>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(event) => update(field.key, event.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                )}
              </label>
            );
          })}
        </div>

        {message && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-4">
          <a
            href={
              kind === 'course'
                ? `/courses/${item.id}`
                : kind === 'event'
                  ? '/events'
                  : kind === 'team'
                    ? '/about'
                    : kind === 'job'
                      ? '/jobs'
                      : `/blog/${(item as BlogPost).slug}`
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-amber-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View public page
          </a>
          <button
            type="submit"
            disabled={!writable || saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-black transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </button>
        </div>
      </form>
    </Panel>
  );
};
