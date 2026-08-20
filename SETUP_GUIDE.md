# Setup Guide — from zero to a live shareable URL

This assumes you have none of the three accounts yet. It'll take about
20-30 minutes the first time. Every step after this (for future states)
is much faster — see the "spinning up a new instance" section in
README.md.

You'll create three free accounts, in this order: **GitHub** (holds the
code) → **Supabase** (holds the data) → **Vercel** (hosts the live site).

---

## Part 1 — GitHub (where the code lives)

1. Go to [github.com/join](https://github.com/join) and create a free
   account (email, username, password, verify email).
2. Once logged in, click the **+** icon top-right → **New repository**.
3. Name it something like `mt-session-calendar`. Keep it **Public** (a
   private repo works too, but Vercel's free tier deploys either way —
   public is simplest). Don't add a README/gitignore/license — leave
   those unchecked, since you're uploading existing files. Click **Create
   repository**.
4. On the new (empty) repo page, click **"uploading an existing file"**
   (a link in the quick-setup instructions).
5. Drag in all the files from this project folder: `index.html`, `app.js`,
   `ics.js`, `config.js`, `vercel.json`, `README.md`, `SETUP_GUIDE.md`, the
   `api` folder (with `feed.js` inside it), and the `supabase` folder (with
   `schema.sql` and `seed_montana.sql` inside it). GitHub's drag-and-drop
   upload preserves folder structure if you drag the whole `api` and
   `supabase` folders in.
6. Scroll down, click **Commit changes**.

You now have the code on GitHub. You'll come back here in step 5 of Part
3 to update `config.js` with your Supabase credentials.

---

## Part 2 — Supabase (where the event data lives)

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub sign-in
   is the fastest option, since you already have that account).
2. Click **New project**. Pick any name (e.g. `mt-session-calendar`), set
   a database password (save it somewhere — you likely won't need it
   again, but keep it just in case), pick the region closest to you, and
   create the project. It takes a minute or two to provision.
3. Once it's ready, open the **SQL Editor** (left sidebar) → **New
   query**.
4. Open `supabase/schema.sql` from this project, copy its entire
   contents, paste into the SQL Editor, and click **Run**. You should see
   "Success. No rows returned."
5. New query again → open `supabase/seed_montana.sql`, copy its entire
   contents, paste in, and click **Run**. This inserts the 15 starting
   events.
6. Go to **Table Editor** (left sidebar) → you should see an `events`
   table with 15 rows. That confirms it worked.
7. Go to **Project Settings** (gear icon) → **API**. You'll need two
   values from this page in the next step:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (a long string starting with `eyJ...`) — this
     is the key labeled "anon public", *not* "service_role" (never use
     the service_role key in this app — it bypasses all security rules).

---

## Part 3 — Wire Supabase into the app

1. Back in your GitHub repo, open `config.js` and click the pencil
   (edit) icon.
2. Replace:
   ```js
   supabaseUrl: "https://YOUR-PROJECT-REF.supabase.co",
   supabaseAnonKey: "YOUR-ANON-PUBLIC-KEY",
   ```
   with the **Project URL** and **anon public key** you copied in Part 2,
   step 7.
3. Scroll down, click **Commit changes**.

---

## Part 4 — Vercel (makes it a live URL)

1. Go to [vercel.com](https://vercel.com) and sign up using **"Continue
   with GitHub"** — this lets Vercel see your repos without a separate
   password.
2. Click **Add New...** → **Project**.
3. Find your `mt-session-calendar` repo in the list and click **Import**.
4. Vercel will try to guess a framework — set **Framework Preset** to
   **Other** (this is a plain static site, no build step needed). Leave
   everything else as default.
5. Click **Deploy**. It takes under a minute.
6. When it finishes, click the URL it gives you (something like
   `mt-session-calendar.vercel.app`) — your calendar is now live.

That URL is what you share with your client. Anyone with the link can
view and edit the calendar; changes save to Supabase and show up for
everyone within a couple seconds.

Deploying also turns on the live subscribe feed automatically, at
`<your-vercel-url>/api/feed.ics` — no separate setup, since it reads the
same `config.js` values you already pasted in in Part 3. It's what the
"🔗 Subscribe" button in the app links to.

---

## Verifying it works

- Open the live URL, click **+ Add event**, fill it in, save — it should
  appear in the list immediately.
- Open the same URL in a second browser tab (or send it to your phone)
  and confirm the new event shows up there too within a few seconds.
- Click **⬇ Download .ics** and confirm a `.ics` file downloads that you
  can open in Google/Outlook/Apple Calendar.
- Click **🔗 Subscribe**, copy the feed URL, and confirm it opens as a
  calendar feed (not a download) when you visit it directly in a browser —
  you should see raw `BEGIN:VCALENDAR...` text, not an error page.
- Try both **List** and **Calendar** view toggles.

## Making future edits to the app itself

Any time you edit a file in the GitHub repo (through the web UI, as
above, or by cloning it locally with git if you're comfortable with
that), Vercel automatically redeploys within a minute or two — no extra
steps needed.

## Troubleshooting

- **Page loads but events never appear / status says "sync failed":**
  double check the `supabaseUrl` and `supabaseAnonKey` in `config.js`
  were pasted correctly (no extra quotes, no trailing space), and that
  you ran `schema.sql` successfully in the SQL Editor.
- **Events save but don't show up on other people's screens:** the app
  falls back to polling every 15 seconds even if realtime isn't working,
  so give it 15 seconds — if it's still not updating, re-check that
  `alter publication supabase_realtime add table events;` at the bottom
  of `schema.sql` ran without error (or toggle it on manually under
  Supabase → **Database** → **Replication**).
- **"relation events already exists" error when re-running schema.sql:**
  that's fine, it means it already ran — the script is safe to run more
  than once.
- **Visiting `/api/feed.ics` shows an error or 404 instead of calendar
  text:** make sure the `api` folder (with `feed.js` inside) and
  `vercel.json` were both uploaded to the GitHub repo in Part 1 and
  Vercel redeployed after that (check the **Deployments** tab). If it
  loads but is empty (`BEGIN:VCALENDAR` / `END:VCALENDAR` with nothing in
  between), that's normal for a brand-new instance with no events yet.
- **A subscribed calendar isn't picking up new events:** this is expected
  behavior, not a bug — subscribed calendars re-check the feed on the
  calendar app's own schedule (often every few hours, sometimes longer),
  unlike the live web page, which updates within seconds. There's no way
  to force most calendar apps to check more often.

## A note on security

There's no login by design — that was a requirement, not an oversight.
The tradeoff: anyone who has the link (or who finds the Supabase URL and
anon key, which are visible in the page's source code) can add, edit, or
delete any event. That's an acceptable tradeoff for an internal/client
collaboration tool, but don't treat the link as something that needs to
stay secret for the app to be safe — treat it more like a shared Google
Doc with link-based editing.
