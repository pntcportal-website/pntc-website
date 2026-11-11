-- ════════════════════════════════════════════════════════════════════════
--  PNTC website: complete Supabase database setup
--  Run once in a new Supabase project: SQL Editor > New query > paste all > Run.
--  Safe to run again (it only creates what is missing).
--  Then run data.sql to load the current content.
-- ════════════════════════════════════════════════════════════════════════

-- ── Blog posts (College, SHS and Training Center blogs) ─────────────────
create table if not exists posts (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null default 'Untitled Post',
  slug            text        unique not null,
  excerpt         text        default '',
  content         text        default '',
  "featuredImage" text        default '',
  sites           jsonb       default '[]',
  status          text        default 'draft',
  category        text        default '',
  tags            jsonb       default '[]',
  author          text        default 'PNTC Communications',
  "createdAt"     timestamptz default now(),
  "updatedAt"     timestamptz default now(),
  "publishedAt"   timestamptz
);
create index if not exists posts_status_published_idx on posts (status, "publishedAt" desc);
create index if not exists posts_updated_idx on posts ("updatedAt" desc);

-- ── Careers page ────────────────────────────────────────────────────────
create table if not exists careers (
  id            uuid        primary key default gen_random_uuid(),
  title         text        default '',
  department    text        default '',
  location      text        default 'Dasmariñas, Cavite',
  description   text        default '',
  "badgeType"   text        default 'Full-Time',
  status        text        default 'open',     -- open = on the website, draft or closed = admin only
  form          jsonb,                          -- the application form for this opening
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);

-- ── Research page ───────────────────────────────────────────────────────
create table if not exists research (
  id            uuid        primary key default gen_random_uuid(),
  title         text        default '',
  body          text        default '',
  icon          text        default '🏅',
  year          text        default '',
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);

-- ── Directory page ──────────────────────────────────────────────────────
create table if not exists directory (
  id            uuid        primary key default gen_random_uuid(),
  name          text        default '',
  description   text        default '',
  icon          text        default '📋',
  contacts      jsonb       default '[]',
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);

-- ── Merchandise page ────────────────────────────────────────────────────
create table if not exists merchandise (
  id            uuid        primary key default gen_random_uuid(),
  name          text        default '',
  category      text        default '',
  note          text        default '',
  price         text        default '',
  icon          text        default '🛍️',
  "imgClass"    text        default 'mi-navy',
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);

-- ── Live chat ───────────────────────────────────────────────────────────
create table if not exists chat_sessions (
  id                  uuid        primary key default gen_random_uuid(),
  site                text        default 'main',
  visitor_name        text        default 'Visitor',
  visitor_email       text,
  visitor_contact     text,
  concern_type        text,
  concern_background  text,
  status              text        default 'open',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index if not exists chat_sessions_updated_idx on chat_sessions (updated_at desc);

create table if not exists chat_messages (
  id          uuid        primary key default gen_random_uuid(),
  session_id  uuid        not null references chat_sessions (id) on delete cascade,
  sender      text        not null,              -- visitor, agent or system
  message     text        not null default '',
  agent_name  text,
  read        boolean     default false,
  created_at  timestamptz default now()
);
-- the chat only ever asks for one conversation's newest messages, so these keep each check small and fast
create index if not exists chat_messages_session_time_idx on chat_messages (session_id, created_at);
create index if not exists chat_messages_unread_idx on chat_messages (session_id) where sender = 'visitor' and read = false;

-- who is answering chats right now (shows the "agent is online" label)
create table if not exists agent_status (
  agent_name  text        primary key,
  last_seen   timestamptz default now()
);

-- ── History of changes (admin console > History) ────────────────────────
-- one row per change saved in the admin console (who, when, which section, what changed)
create table if not exists activity_log (
  id          bigserial   primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid,
  user_email  text,
  user_name   text,
  role        text,
  area        text,
  action      text,
  details     jsonb
);
create index if not exists activity_log_created_idx on activity_log (created_at desc);
create index if not exists activity_log_user_idx    on activity_log (user_email, created_at desc);

-- ── Job applications (Careers > Apply for this role) ─────────────────────
create table if not exists job_applications (
  id               uuid        primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  career_id        uuid,
  job_title        text,
  applicant_name   text,
  applicant_email  text,
  answers          jsonb,
  questions        jsonb,
  files            jsonb,
  status           text        default 'new',
  notes            text
);
create index if not exists job_applications_created_idx on job_applications (created_at desc);
create index if not exists job_applications_career_idx  on job_applications (career_id, created_at desc);
-- older projects: add the opening status and form columns
alter table careers add column if not exists status text default 'open';
alter table careers add column if not exists form   jsonb;

-- ── Live chat departments, office hours and offline replies ─────────────
-- the teams that answer chats. "sites" are the websites whose chats go to the team first.
create table if not exists chat_departments (
  id               text        primary key,
  name             text        not null,
  sites            text[]      default '{}',       -- colleges, shs, main, maritime, aman
  days             int[]       default '{1,2,3,4,5}', -- office days, 0 = Sunday ... 6 = Saturday (Philippine time)
  open_time        text        default '08:00',
  close_time       text        default '17:00',
  offline_message  text,
  sort             int         default 0
);

insert into chat_departments (id, name, sites, days, open_time, close_time, offline_message, sort) values
  ('college-marketing',  'College Marketing',         '{colleges,shs,main}', '{1,2,3,4,5}',   '07:00', '17:30',
   'Thank you for your message. Our team is offline right now. Our office hours are Monday to Friday, 7:00 AM to 5:30 PM. We will call you on the next business day, or you may continue this chat once we are back.', 1),
  ('training-marketing', 'Training Center Marketing', '{maritime,aman}',     '{1,2,3,4,5,6}', '08:00', '17:30',
   'Thank you for your message. Our team is offline right now. Our office hours are Monday to Saturday, 8:00 AM to 5:30 PM. We will call you on the next business day, or you may continue this chat once we are back.', 2),
  ('college-registrar',  'College Registrar',         '{}',                  '{1,2,3,4,5}',   '07:00', '17:30',
   'Thank you for your message. The Registrar is offline right now. Our office hours are Monday to Friday, 7:00 AM to 5:30 PM. We will call you on the next business day, or you may continue this chat once we are back.', 3),
  ('finance',            'Finance',                   '{}',                  '{1,2,3,4,5}',   '07:00', '17:30',
   'Thank you for your message. Our Finance office is offline right now. Our office hours are Monday to Friday, 7:00 AM to 5:30 PM. We will call you on the next business day, or you may continue this chat once we are back.', 4)
on conflict (id) do nothing;

-- each chat belongs to one department, and each online agent says which department they answer for
alter table chat_sessions add column if not exists department text;
alter table agent_status  add column if not exists department text;
update chat_sessions set department = case when site in ('maritime', 'aman') then 'training-marketing' else 'college-marketing' end
 where department is null;
create index if not exists chat_sessions_dept_idx on chat_sessions (department, updated_at desc);


-- ── Security ────────────────────────────────────────────────────────────
-- The website never talks to Supabase directly. Only the admin server does, with the service_role key,
-- which bypasses these rules. Turning row level security on with no policies blocks everyone else.
alter table posts          enable row level security;
alter table careers        enable row level security;
alter table research       enable row level security;
alter table directory      enable row level security;
alter table merchandise    enable row level security;
alter table chat_sessions  enable row level security;
alter table chat_messages  enable row level security;
alter table agent_status   enable row level security;
alter table activity_log   enable row level security;
alter table job_applications enable row level security;
alter table chat_departments enable row level security;

-- ── Image storage bucket ────────────────────────────────────────────────
-- Used only by the older Images (Supabase) screen in the admin console. Blog cover photos and article
-- pictures are saved into the website through GitHub instead, so visitors never download from here.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- private storage for job application attachments (opened by HR through short-lived links only)
insert into storage.buckets (id, name, public, file_size_limit)
values ('job-applications', 'job-applications', false, 5242880)
on conflict (id) do update set public = false;

-- ── Admin logins ────────────────────────────────────────────────────────
-- Logins are Supabase Auth users and cannot be created with SQL here. The super admin is pntcportal@mypntc.edu.ph.
-- Add each admin in Authentication > Users > Add user > Create new user (email and password,
-- tick "Auto Confirm User"). Then log in at /admin with that email and password.
