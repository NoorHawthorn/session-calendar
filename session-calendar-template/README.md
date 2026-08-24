# Session Run-Up Calendar — Template

A shared, open-editing calendar for tracking everything leading up to a
state legislature's session start date: deadlines, holidays, elections,
interim committee milestones, and relevant conferences/networking events.
Anyone with the link can view, add, edit, or delete events — no login —
and anyone can export the current events as a personal `.ics` file.

This repo is the **Montana 2027** instance, built so it can also serve as
the template for future states/clients.

For step-by-step account setup and deployment instructions (written for
someone doing this for the first time), see **[SETUP_GUIDE.md](SETUP_GUIDE.md)**.

## How it's built

- **Frontend:** plain HTML/CSS/JS, no build step, no framework. Deploys as
  a static site.
- **Data:** [Supabase](https://supabase.com) (Postgres + auto-generated
  REST API + Realtime), free tier. One Supabase project per state instance.
- **Hosting:** [Vercel](https://vercel.com), free tier, deployed straight
  from a GitHub repo — every push to `main` redeploys automatically.
- **Live updates:** the app subscribes to Supabase Realtime for the
  `events` table, so edits from one visitor show up for everyone else
  within a second or two. There's also a 15-second polling fallback in
  case a browser's realtime connection drops, so it stays correct even in
  the worst case.

## File structure

```
index.html              Page markup + all CSS (design system lives here)
app.js                   All app logic: rendering, Supabase reads/writes,
                          the add/edit/delete modal, .ics export. Generic —
                          reads everything state-specific from config.js.
config.js                THE FILE YOU EDIT PER INSTANCE. State name, convene
                          date, color theme, category list, Supabase
                          project URL/key.
supabase/schema.sql       Table definition, security policies, realtime setup.
                          Run once per new Supabase project.
supabase/seed_montana.sql Montana's initial event list. Run once after schema.sql.
SETUP_GUIDE.md            Full walkthrough: create accounts, deploy, go live.
```

## Template vs. multi-tenant — recommendation

The brief asked for a decision here, leaning toward the **template
approach**. That's what this repo implements, and it's the right call for
this use case:

- **Template approach (what this is):** one codebase (this repo), and
  each state/client gets its own copy of the repo, its own Supabase
  project, and its own Vercel deployment, tied together only by a shared
  `config.js` pattern.
- **Multi-tenant approach (not used):** one shared deployment and one
  shared database, with a `state` column on every event and URL paths
  like `/montana`, `/idaho`.

Why template wins for this project specifically: each client's calendar
is meant to be handed to that client's team as their own live, editable
document — there's real value in it feeling like *theirs*, on its own
URL, with data that's fully isolated from every other client (no risk of
one client's edits or an open-editing mistake ever touching another
client's data). It also means a client can be spun down, exported, or
handed off independently without touching anyone else's calendar. The
tradeoff is a little more setup per new state (a new Supabase project, a
new Vercel project) — but that setup is small and mostly copy/paste (see
below), and it buys real isolation and simplicity in exchange. A
multi-tenant app would need auth or per-state access rules to prevent
clients from editing each other's events, which cuts against "no login,
open editing" being safe to promise.

## Spinning up a new state/client instance

1. **Duplicate the repo.** On GitHub, use "Use this template" (if this
   repo is marked as a template) or just create a new repo and copy these
   files into it.
2. **Edit `config.js`** in the new repo: state name, eyebrow text,
   heading, convene date, countdown label, footer note, .ics file name,
   default calendar month, and theme colors if the client wants a
   different palette. Leave `app.js` and `index.html` untouched.
3. **Create a new Supabase project** for this client (see SETUP_GUIDE.md
   for the detailed steps). Run `supabase/schema.sql` in its SQL Editor.
4. **Write a new seed SQL file** (copy `seed_montana.sql` as a starting
   point) with that state's events, and run it.
5. **Paste the new project's Supabase URL and anon key** into `config.js`.
6. **Import the new repo into Vercel** as a new project and deploy.
7. Share the new Vercel URL with that client.

Because `app.js` never changes between instances, a bug fix or feature
improvement can be copied across every state's repo without re-doing any
of the state-specific work.
