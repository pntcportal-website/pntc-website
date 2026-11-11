-- ════════════════════════════════════════════════════════════════════════
--  PNTC website: job application forms (Careers > Apply for this role)
--  Run once in the current Supabase project: SQL Editor > New query > paste all > Run.
--  Safe to run again. (A new project gets all of this from schema.sql already.)
-- ════════════════════════════════════════════════════════════════════════

-- each opening has a status (open = on the website, draft or closed = admin only) and its own application form
alter table careers add column if not exists status text  default 'open';
alter table careers add column if not exists form   jsonb;

-- one row per application sent from the website
create table if not exists job_applications (
  id               uuid        primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  career_id        uuid,
  job_title        text,
  applicant_name   text,
  applicant_email  text,
  answers          jsonb,      -- the answers, by question
  questions        jsonb,      -- the questions as they were when the person applied
  files            jsonb,      -- attached files (kept in the private job-applications bucket)
  status           text        default 'new',
  notes            text
);
create index if not exists job_applications_created_idx on job_applications (created_at desc);
create index if not exists job_applications_career_idx  on job_applications (career_id, created_at desc);

-- only the admin server (service_role key) may read or write it
alter table job_applications enable row level security;

-- private storage for résumés and other attachments (never public, opened by HR through short-lived links)
insert into storage.buckets (id, name, public, file_size_limit)
values ('job-applications', 'job-applications', false, 5242880)
on conflict (id) do update set public = false;
