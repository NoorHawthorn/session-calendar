// ============================================================================
// Live "subscribe" feed for calendar apps.
//
// Unlike the in-page "Download .ics" button (which exports a one-time
// snapshot at the moment you click it), THIS endpoint can be added to
// Google/Outlook/Apple Calendar as a subscription. Those apps re-fetch this
// URL on their own schedule (typically every several hours to once a day —
// each calendar provider controls that interval, not this app) and pick up
// new, changed, or deleted events automatically, with no re-download needed.
//
// URL once deployed: https://YOUR-SITE.vercel.app/api/calendar.ics
//
// IMPORTANT: SUPABASE_URL / SUPABASE_ANON_KEY below must match the values in
// config.js. Both are meant to be public in client-side code (see the note
// in config.js) so duplicating them here is safe — this is a read-only
// SELECT against a table whose Row Level Security policy already allows
// public reads.
// ============================================================================

const SUPABASE_URL = "https://fhcabftezttecpoekggh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1tux1SjLBZLZJuRrESv8yA_CkK7PeHt";
const ICS_CAL_NAME = "Montana — Notable Events";
const ICS_PROD_ID = "-//Montana Notable Events//EN";

function icsEscape(str) {
  return (str || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
function toIcsDate(dateStr) {
  return dateStr.replace(/-/g, "");
}
function addDaysToDateStr(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function buildIcs(events) {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${ICS_PROD_ID}`,
    "CALSCALE:GREGORIAN",
    // Explicitly marks this as a published/informational calendar (not a
    // scheduling request/invite). Some clients — Outlook in particular —
    // are more likely to reject a feed lacking this line.
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${ICS_CAL_NAME}`,
    // Hints some calendar clients (notably Apple Calendar) use to pace
    // re-checks. Not universally honored — Google/Outlook use their own
    // fixed intervals regardless — but harmless to include.
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H"
  ];
  events.forEach(ev => {
    const dtstart = toIcsDate(ev.date);
    const dtendSource = ev.end_date ? addDaysToDateStr(ev.end_date, 1) : addDaysToDateStr(ev.date, 1);
    const dtend = toIcsDate(dtendSource);
    lines.push("BEGIN:VEVENT");
    lines.push("UID:" + ev.id + "@session-calendar");
    lines.push("DTSTAMP:" + stamp);
    lines.push("DTSTART;VALUE=DATE:" + dtstart);
    lines.push("DTEND;VALUE=DATE:" + dtend);
    lines.push("SUMMARY:" + icsEscape("[" + (ev.category || "").toUpperCase() + "] " + ev.name));
    let desc = ev.description || "";
    if (ev.status) desc += (desc ? " " : "") + "(Status: " + ev.status + ")";
    if (ev.source_link) desc += (desc ? " " : "") + "Source: " + ev.source_link;
    if (desc) lines.push("DESCRIPTION:" + icsEscape(desc));
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

module.exports = async function handler(req, res) {
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/events?select=*&order=date.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    if (!resp.ok) {
      throw new Error(`Supabase responded with ${resp.status}`);
    }
    const events = await resp.json();
    const ics = buildIcs(events);

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    // Edge-cache for 30 minutes so a burst of subscribers re-checking at
    // once doesn't hammer Supabase directly.
    res.setHeader("Cache-Control", "public, max-age=1800");
    res.status(200).send(ics);
  } catch (err) {
    res.status(500).send("Error building calendar feed: " + err.message);
  }
};

module.exports.buildIcs = buildIcs; // exported for local testing only
