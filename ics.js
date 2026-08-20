// ============================================================================
// Shared ICS (iCalendar) formatting — used by both the browser app (the
// one-time "Download .ics" button in app.js) and the live serverless feed
// (api/feed.js, for "Subscribe" by URL). Keeping this in one file means the
// two outputs can't drift apart. Pure functions only — no DOM, no Supabase
// client — so it runs unmodified in the browser and in a Vercel function.
// ============================================================================

export function icsEscape(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function toIcsDate(dateStr) {
  return dateStr.replace(/-/g, '');
}

// Date-only arithmetic done in UTC on purpose: this file runs both in the
// browser (local timezone) and in a Vercel function (server timezone). Using
// UTC here means "add one day to 2027-01-04" gives the same answer no matter
// where the code executes, instead of shifting near midnight in timezones
// ahead of UTC.
export function addDaysToDateStr(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// events: array of { id, name, date, endDate, category, status, desc, src }
// — the app's normalized event shape (see rowToEvent() in app.js; the feed
// function maps Supabase's snake_case columns into the same shape before
// calling this).
export function buildIcsString(events, config) {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${config.icsProdId}`,
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${config.icsCalName}`,
    'METHOD:PUBLISH',
    // Hints some clients (notably Outlook) use to decide how often to
    // re-poll a subscribed feed. Most other apps just re-poll on their own
    // fixed schedule regardless, but it doesn't hurt to include these.
    'X-PUBLISHED-TTL:PT12H',
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H'
  ];
  events.forEach(ev => {
    const dtstart = toIcsDate(ev.date);
    const dtendSource = ev.endDate ? addDaysToDateStr(ev.endDate, 1) : addDaysToDateStr(ev.date, 1);
    const dtend = toIcsDate(dtendSource);
    lines.push('BEGIN:VEVENT');
    lines.push('UID:' + ev.id + '@session-calendar');
    lines.push('DTSTAMP:' + stamp);
    lines.push('DTSTART;VALUE=DATE:' + dtstart);
    lines.push('DTEND;VALUE=DATE:' + dtend);
    lines.push('SUMMARY:' + icsEscape('[' + ev.category.toUpperCase() + '] ' + ev.name));
    let desc = ev.desc || '';
    if (ev.status) desc += (desc ? ' ' : '') + '(Status: ' + ev.status + ')';
    if (ev.src) desc += (desc ? ' ' : '') + 'Source: ' + ev.src;
    if (desc) lines.push('DESCRIPTION:' + icsEscape(desc));
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
