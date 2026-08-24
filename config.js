// ============================================================================
// INSTANCE CONFIG — this is the ONLY file you edit to spin up a new
// state/client calendar from this template. Everything else in the app
// (index.html, app.js) is generic and reads from this file.
// ============================================================================

export const CONFIG = {
  // ---- Browser tab title -------------------------------------------------
  pageTitle: "All-In Energy406 — MT Session Calendar",

  // ---- Header copy --------------------------------------------------------
  eyebrow: "Montana · 70th Legislature",
  heading: "All-In Energy406",
  subhead:
    "Session run-up and in-session calendar — every deadline, holiday, and gathering from now through sine die, shared and editable by everyone with this link.",

  // ---- Countdown widget -----------------------------------------------
  // Three phases, switched automatically based on today's date:
  //   1. Before conveneDate      -> counts down to conveneDate, shows countdownLabel
  //   2. conveneDate..sessionEndDate -> counts down to sessionEndDate, shows inSessionCountdownLabel
  //   3. After sessionEndDate    -> shows sessionEndedLabel, no countdown
  // All *Date fields must be ISO dates (YYYY-MM-DD). Labels are the small
  // caption under the number — HTML (e.g. <br>) is allowed. Leave
  // sessionEndDate blank ("") to disable phase 2/3 and always count down
  // to conveneDate (the old single-countdown behavior).
  conveneDate: "2027-01-04",
  countdownLabel: "days to convening<br>Jan 4, 2027",
  sessionEndDate: "2027-04-30",
  inSessionCountdownLabel: "days left in session<br>adjourns ~Apr 30, 2027 (est.)",
  sessionEndedLabel: "session adjourned<br>sine die",

  // ---- Footer note ----------------------------------------------------
  footerNote:
    "All-In Energy406 · data is shared & live for everyone with this link · tracking Montana's 2027 legislative session from run-up through adjournment",

  // ---- .ics export ------------------------------------------------------
  icsCalName: "All-In Energy406 — MT 2027 Legislative Session Calendar",
  icsFileName: "AllInEnergy406_MT_2027_Session.ics",
  icsProdId: "-//All-In Energy406 Session Calendar//EN",

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
