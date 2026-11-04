// Exports the current Supabase content as SQL, for loading into a new Supabase project after schema.sql.
//   supabase/data.sql       posts, careers, research, directory, merchandise
//   supabase/data-chat.sql  chat history (contains visitors' names, emails and phone numbers: keep it private)
// Reads only. Uses SUPABASE_URL and SUPABASE_SERVICE_KEY from .env.
// Run:  node tools/export-supabase-data.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
  const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const { createClient } = require('@supabase/supabase-js');
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const lit = v => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
};
async function all(table, order) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select('*').order(order, { ascending: true }).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}
function inserts(table, rows) {
  if (!rows.length) return `-- ${table}: no rows\n`;
  const cols = Object.keys(rows[0]);
  const head = `insert into ${table} (${cols.map(c => `"${c}"`).join(', ')}) values\n`;
  const out = [];
  for (let i = 0; i < rows.length; i += 200) {
    out.push(head + rows.slice(i, i + 200).map(r => '  (' + cols.map(c => lit(r[c])).join(', ') + ')').join(',\n') + '\non conflict (id) do nothing;');
  }
  return `-- ${table}: ${rows.length} rows\n${out.join('\n')}\n`;
}

(async () => {
  const head = (what) => `-- PNTC website: ${what}, exported ${new Date().toISOString().slice(0, 10)} from the current Supabase project.\n` +
    `-- Run after schema.sql, in Supabase > SQL Editor. Safe to run again (existing rows are skipped).\n\n`;
  let sql = head('site content');
  const counts = {};
  for (const [t, o] of [['posts', 'createdAt'], ['careers', 'createdAt'], ['research', 'createdAt'], ['directory', 'createdAt'], ['merchandise', 'createdAt']]) {
    const rows = await all(t, o); counts[t] = rows.length; sql += inserts(t, rows) + '\n';
  }
  // blog cover photos now live in the website (PNTC Colleges/blog/images/), not in Supabase Storage
  sql = sql.replace(/https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/site-images\/PNTC%20Colleges\/uploads\/featured\/([^'"\s)]+)/g,
    (m, name) => '/college/blog/images/' + name.replace(/\.jfif$/i, '.jpg'));
  fs.writeFileSync(path.join(ROOT, 'supabase', 'data.sql'), sql);
  let chat = head('chat history (private: visitor contact details)');
  const s = await all('chat_sessions', 'created_at'), m = await all('chat_messages', 'created_at');
  counts.chat_sessions = s.length; counts.chat_messages = m.length;
  chat += inserts('chat_sessions', s) + '\n' + inserts('chat_messages', m);
  fs.writeFileSync(path.join(ROOT, 'supabase', 'data-chat.sql'), chat);
  console.log('exported', counts);
})().catch(e => { console.error(e.message); process.exit(1); });
