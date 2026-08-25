# Supabase Content Setup

The admin content studio can store courses, events, team members, jobs and insights in Supabase.
Without these variables the app falls back to local `.data/content.json`, which is
useful for development but not durable on Vercel.

## Environment Variables

Add these locally and in Vercel:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_CONTENT_TABLE="sog_content_items"
SUPABASE_STORAGE_BUCKET="site-images"
```

`SUPABASE_SERVICE_ROLE_KEY` is a server-only secret. Do not prefix it with
`VITE_`, do not expose it to the browser, and do not commit real values.

`SUPABASE_STORAGE_BUCKET` is used by the admin image uploader. Create this as a
public bucket in Supabase Storage so course, event, team, job and insight images
can render on the public website. If it is omitted, the app uses `site-images`.

## Schema

Run this SQL in Supabase SQL Editor:

```sql
create table if not exists public.sog_content_items (
  id text not null,
  kind text not null check (kind in ('course', 'event', 'team', 'job', 'insight')),
  payload jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (kind, id)
);

alter table public.sog_content_items enable row level security;

drop policy if exists "No client reads content items directly" on public.sog_content_items;
drop policy if exists "No client writes content items directly" on public.sog_content_items;

create policy "No client reads content items directly"
on public.sog_content_items
for select
to anon, authenticated
using (false);

create policy "No client writes content items directly"
on public.sog_content_items
for all
to anon, authenticated
using (false)
with check (false);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.sog_content_items to service_role;
```

The public website does not query Supabase directly. It calls this app's
`/api/content/:kind` endpoint, and the server uses the service-role key.
