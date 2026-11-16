-- ════════════════════════════════════════════════════════════════════════
--  PNTC website: Merchandise model photos, sizes and show or hide
--  Run once in the current Supabase project: SQL Editor > New query > paste all > Run.
--  Safe to run again. (A new project gets these from schema.sql already.)
-- ════════════════════════════════════════════════════════════════════════

-- the photo addresses (front, side, back) saved in the website under /college/merch/
alter table merchandise add column if not exists images jsonb default '{}'::jsonb;
-- sizes shown under the item, for example "XS to 3XL"
alter table merchandise add column if not exists sizes  text  default '';
-- show = on the Merchandise page after Publish, hidden = kept in the admin only
alter table merchandise add column if not exists status text  default 'show';
