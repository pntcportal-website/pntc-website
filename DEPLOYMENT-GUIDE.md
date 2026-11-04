# PNTC Website: Deployment Guide (new GitHub + Cloudflare + pntc.edu.ph)

The final setup:

| Piece | Where it runs |
|---|---|
| Website pages (Main, College, SHS, Training Center, PNSC) | **Cloudflare Worker** (static files) |
| Admin console server (`/admin`, `/api`) | **Same Cloudflare Worker** (the Express server, run with Cloudflare's Node.js support) |
| Database, admin logins, blog images | **Supabase** (unchanged) |
| Code, and page edits saved from the admin console | **New GitHub repository**. Each save commits there and Cloudflare rebuilds the site |
| Domain `pntc.edu.ph` | Stays registered at **dotPH (ph.net)**. Only its nameservers point to Cloudflare |

The project is ready for this. Its Cloudflare files were added and tested locally with Cloudflare's runtime:
pages, redirects, images, admin login, Supabase, GitHub reads, image lists, calendar, course list and chat.
Saving from the admin console was **not** tested, because a save writes to the live repo. Test it in Part 4.

Files involved, for reference: `wrangler.jsonc` (Cloudflare settings), `worker/index.js` (runs the admin server),
`tools/build-cloudflare.js` (builds the public `dist/` folder and its address rules).

---

## Part 1. Before you start (checklist)

1. **dotPH (ph.net) login** for the account that owns `pntc.edu.ph`, with permission to change nameservers.
2. **Email check.** Find out who hosts `@pntc.edu.ph` email (Google Workspace, Microsoft 365, GoDaddy email ...).
   Its MX and TXT records must be copied exactly in Part 5 or email stops. `mypntc.edu.ph` is a separate domain and isn't affected.
3. **Supabase** (supabase.com > the project > Settings > API): copy the **Project URL** and the **service_role key**.
   Keep the key private.
4. **WordPress backup.** Take a full backup (files and database) from WordPress or its hosting, and keep it.
5. **Old WordPress page list.** Write down the important old URLs (for example `/about-us/`, `/admissions/`) for redirects (Part 6).

---

## Part 2. New GitHub account and repository

1. Create the new GitHub account (an institutional email such as `webmaster@pntc.edu.ph`) and turn on two-factor authentication.
2. Create a **new private repository**, for example `pntc-website`, with no README and no .gitignore.
3. In a terminal in `C:\Users\samson\Downloads\Website`, point the project at the new repo and push:

   ```bash
   git remote rename origin old-origin
   ```
   ```bash
   git remote add origin https://github.com/NEW-ACCOUNT/pntc-website.git
   ```
   ```bash
   git push -u origin main
   ```
   Sign in as the **new** account when asked. The old repo stays as a backup.

4. Create the token the admin console saves with: GitHub > Settings > Developer settings >
   **Fine-grained personal access tokens** > Generate new token
   * Repository access: **Only select repositories** > `pntc-website`
   * Permissions: **Contents: Read and write**
   * Expiration: the longest allowed, with a calendar reminder to renew it
   * Copy the token now. It's shown only once.

---

## Part 3. Create the Cloudflare Worker

1. Create or log in to the Cloudflare account (institutional email, two-factor on).
2. **Workers & Pages > Create > Import a repository**. Connect GitHub (the **new** account) and choose `pntc-website`.
3. Settings on the setup screen:

   | Setting | Value |
   |---|---|
   | Project name | `pntc-website` (must match `name` in `wrangler.jsonc`) |
   | Build command | `npm run build:cloudflare` |
   | Deploy command | `npx wrangler deploy` |
   | Root directory | leave empty |
   | Production branch | `main` |

4. Deploy. The first run takes a few minutes. Cloudflare then gives a test address like
   `pntc-website.ACCOUNT.workers.dev`.
5. **Add the secrets.** Open the Worker > **Settings > Variables and Secrets** > Add, type **Secret**, one by one:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | Supabase Project URL |
   | `SUPABASE_SERVICE_KEY` | Supabase service_role key |
   | `GITHUB_OWNER` | the new GitHub account name |
   | `GITHUB_REPO` | `pntc-website` |
   | `GITHUB_BRANCH` | `main` |
   | `GITHUB_TOKEN` | the token from Part 2.4 |

   Click **Deploy** after saving them so the Worker picks them up.

---

## Part 3.5. One-time Supabase update (do once, any time before go-live)

Supabase > **SQL Editor** > New query > paste the contents of `supabase/move-blog-images.sql` > **Run**.
It points the existing blog posts at the cover photos that were moved into the website, so visitors stop
downloading them from Supabase. The last line of the result should show no rows.

How the site protects the Supabase free tier (egress), for reference:
* The chat box checks only for new messages, every 4 seconds while it is open, and stops in background tabs.
* The "agent online" label and the latest blog posts are cached by Cloudflare, so Supabase is asked once
  every 1 to 5 minutes, not once per visitor. (This cache works on the real domain, not on `workers.dev`.)
* The admin chat screen loads the 100 most recent chats in two queries, then only new messages.
* Blog cover photos and article pictures live in the website (served by Cloudflare), never in Supabase
  Storage, and pasted base64 pictures can't be saved into a post.
* In Supabase > **Reports** or **Usage**, you can watch egress. It should now stay far below the 5 GB monthly limit.

---

## Part 4. Test on the `workers.dev` address (before touching the domain)

* Main home, `/about`, `/about/history`, `/careers`, `/philnautical`
* `/college/`, `/college/programs`, `/college/admissions`, `/shs/`, `/shs/strands`
* `/training/`, `/training/maritime-courses`, `/training/review-app`
* Apply Now popup on College and SHS, footer links, maps, chat box
* `/admin`: log in, then **change one word** in Site Content and save. After 2 to 4 minutes (the rebuild)
  the change shows on the site. Change it back.
* Images screen: upload a test image to one site, check it appears, then remove it.
* Chat: open the chat box on the site, send a message, and answer it from the admin chat screen.

Don't continue until all of these work.

---

## Part 5. Attach pntc.edu.ph (domain stays at ph.net)

Pick a quiet time, such as a weekend evening. The switch takes minutes to a few hours to reach everyone.

`.ph` domains can't be transferred to Cloudflare as registrar, and they don't need to be. You only change the
**nameservers** at dotPH. Renewal stays at dotPH as before.

1. **Cloudflare > Add a domain >** `pntc.edu.ph` **> Free plan.** Cloudflare scans the current DNS records.
2. **Check the scanned records** against the current ones (in the dotPH DNS settings or the current host's DNS):
   * every **MX** record (email)
   * every **TXT** record (SPF `v=spf1 ...`, DKIM, Google or Microsoft verification)
   * any other subdomains in use (`mail`, `portal`, `lms` ...)
   Add anything missing. Set mail records to **DNS only** (grey cloud).
   Leave the `@` and `www` records for now. They're replaced in step 6.
3. Note the **two Cloudflare nameservers** shown (for example `ada.ns.cloudflare.com`, `bob.ns.cloudflare.com`).
4. **Log in to dotPH (ph.net) >** the domain **`pntc.edu.ph` > Nameservers (Manage DNS / Name Servers).**
   Replace the current nameservers with Cloudflare's two and save.
   If the option is locked for `.edu.ph`, open a ticket with dotPH support asking them to set these two nameservers.
5. Wait until Cloudflare shows the domain as **Active** (it emails you). This is usually within a few hours,
   but can take up to 24 to 48 hours.
6. **Connect the domain to the Worker:** Workers & Pages > `pntc-website` > **Settings > Domains & Routes > Add >
   Custom domain**. Add **`www.pntc.edu.ph`**, then add **`pntc.edu.ph`**. If Cloudflare says a record already exists
   (the old WordPress `A` or `CNAME` for `@` or `www`), delete that record in DNS first, then add the custom domain again.
   Cloudflare creates the records and the certificates.
7. **Make `www` the main address**, since the pages give `https://www.pntc.edu.ph` to Google as their official
   address. Go to the domain's **Rules > Redirect Rules > Create rule** with "Redirect from root to WWW"
   (or a custom rule: hostname equals `pntc.edu.ph`, redirect to `https://www.pntc.edu.ph` with the same path, 301, keep query string).
8. **SSL/TLS > Overview: Full (strict).** Edge Certificates: **Always Use HTTPS** on.

The WordPress site stops showing on `pntc.edu.ph` from this point. It stays intact on its hosting as a fallback.

---

## Part 6. Keep Google rankings and old links

1. Send Claude the old WordPress URL list (Part 1.5). Claude adds a 301 redirect for each one to its new page.
2. **Google Search Console** (search.google.com/search-console): add `pntc.edu.ph` as a **Domain** property and
   verify it with the TXT record it gives you, added in Cloudflare DNS. Ask Claude to add a sitemap, then submit it.
3. Update the website address on the Facebook pages, the Google Business Profiles (Dasmariñas campus and
   Intramuros Training Center) and any QR codes that pointed to old WordPress pages.

---

## Part 7. After go-live

* Re-run the Part 4 checks on `https://www.pntc.edu.ph`.
* Send a test email to and from an `@pntc.edu.ph` address.
* After one or two weeks of no problems:
  * take a final WordPress backup, then cancel the WordPress hosting if nothing else uses it
  * delete the old Vercel project and archive the old GitHub repo
* Keep the GitHub token renewal date in a calendar. When the token expires, the admin console can't save edits
  (it still logs in and shows everything).

## If something goes wrong

* **New site broken, email fine:** in Cloudflare DNS, remove the Worker custom domains and add back the original
  `@` and `www` records for the WordPress host, with the orange cloud off. WordPress returns within minutes.
* **Email broken:** compare the MX and TXT records in Cloudflare with the originals and add whatever is missing.
* **Last resort:** set the nameservers at dotPH back to the original ones.

## Working on the site on this computer (for reference)

* `npm run dev:cloudflare` runs the whole site and admin server locally on Cloudflare's runtime. It reads its secrets
  from a `.dev.vars` file (same format as `.env`, never committed).
* `START ADMIN.bat` still runs the admin console the old way for local editing.
