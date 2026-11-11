-- ════════════════════════════════════════════════════════════════════════
--  PNTC website: Live Chat departments, office hours and offline replies
--  Run once in the current Supabase project: SQL Editor > New query > paste all > Run.
--  Safe to run again. (A new project gets all of this from schema.sql already.)
-- ════════════════════════════════════════════════════════════════════════

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

-- only the admin server (service_role key) may read or write it
alter table chat_departments enable row level security;
