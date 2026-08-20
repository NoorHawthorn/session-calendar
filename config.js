// ============================================================================
// INSTANCE CONFIG — this is the ONLY file you edit to spin up a new
// state/client calendar from this template. Everything else in the app
// (index.html, app.js) is generic and reads from this file.
// ============================================================================

export const CONFIG = {
  // ---- Browser tab title -------------------------------------------------
  pageTitle: "MT 2027 Session Run-Up Calendar",

  // ---- Header copy --------------------------------------------------------
  eyebrow: "Montana · 70th Legislature",
  heading: "Session Run-Up Calendar",
  subhead:
    "Every deadline, holiday, and gathering between now and the gavel — shared and editable by everyone with this link.",

  // ---- Countdown widget -----------------------------------------------
  // conveneDate must be an ISO date (YYYY-MM-DD). countdownLabel is the
  // small caption under the number — HTML (e.g. <br>) is allowed.
  conveneDate: "2027-01-04",
  countdownLabel: "days to convening<br>Jan 4, 2027",

  // ---- Footer note ----------------------------------------------------
  footerNote:
    "Data is shared & live for everyone with this link · built for tracking the run-up to the 2027 Montana legislative session",

  // ---- .ics export ------------------------------------------------------
  icsCalName: "MT 2027 Legislative Session Run-Up",
  icsFileName: "MT_2027_Session_Runup.ics",
  icsProdId: "-//MT Session Run-Up Calendar//EN",

  // ---- Calendar view: which month/year to open on first load ----------
  // month is 0-indexed (0 = January, 8 = September).
  defaultCalendarMonth: { year: 2026, month: 8 },

  // ---- Supabase project (fill these in after you create the project) --
  // Settings → API in your Supabase dashboard. The anon/public key is
  // meant to be exposed in client-side code — table-level security is
  // enforced by the Row Level Security policies in supabase/schema.sql,
  // not by hiding this key.
  supabaseUrl: "https://fhcabftezttecpoekggh.supabase.co",
  supabaseAnonKey: "sb_publishable_1tux1SjLBZLZJuRrESv8yA_CkK7PeHt",

  // ---- Visual theme (maps to CSS custom properties) --------------------
  theme: {
    ink: "#22262B",
    paper: "#F5F1E6",
    paperTwo: "#EDE7D8",
    navy: "#1B2A38",
    navyTwo: "#243A4D",
    gold: "#B8862E",
    goldSoft: "#E4C77E",
    sky: "#4A7C9E",
    rule: "#C9C2B0",
    danger: "#9C4634",
    ok: "#3F6B4A"
  },

  // ---- Categories: order here = order in the dropdown & legend --------
  categories: {
    "Deadline": "#B8862E",
    "Election": "#8E4C6B",
    "Holiday": "#9C4634",
    "Session": "#4A7C9E",
    "Interim Committee": "#C9A227",
    "Conference": "#3F6B4A",
    "Networking": "#6B7F8C",
    "Session Prep": "#B06A3A"
  }
};
