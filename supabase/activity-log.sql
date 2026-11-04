-- ════════════════════════════════════════════════════════════════════════
--  PNTC website: History of changes (admin console > History)
--  Run once in the current Supabase project: SQL Editor > New query > paste all > Run.
--  Safe to run again. (A new project gets this table from schema.sql already.)
-- ════════════════════════════════════════════════════════════════════════

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

-- only the admin server (service_role key) may read or write it
alter table activity_log enable row level security;
