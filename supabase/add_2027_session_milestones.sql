-- ============================================================================
-- Addendum — extends the Montana calendar through the end of the 2027 session.
-- Run this ONCE in your existing Supabase project's SQL Editor (Database >
-- SQL Editor > New query). It only adds 3 new rows — it does NOT touch or
-- duplicate the original seed data, so it's safe to run on the already-live
-- database.
--
-- These three dates are ESTIMATES, not official — Montana's legislative
-- leadership doesn't publish the actual 2027 session calendar until shortly
-- after the Legislature convenes on Jan 4, 2027 (the 2025 calendar, for
-- comparison, was adopted January 20, 2025 — two weeks into that session).
-- Each row's description explains exactly how the estimate was derived and
-- links a source. Swap "Estimated" to "Confirmed" (by editing the event in
-- the app) once the real calendar is published.
-- ============================================================================

insert into events (name, date, end_date, category, status, description, source_link) values
('General bill transmittal deadline (estimated)', '2027-03-05', null, 'Deadline', 'Estimated', 'Estimated date by which general bills must pass their chamber of origin and transmit to the other chamber. Based on the 69th Legislature''s 2025 session, where this deadline fell on March 7 — the 70th Legislature convenes two days earlier, so this is a same-offset estimate. Leadership will not adopt the actual 2027 session calendar until shortly after convening (the 2025 calendar was adopted January 20, 2025), so treat this as directional until confirmed.', 'https://www.mtcounties.org/wp-content/uploads/publications/legislative/updates/2025/2025-01-20-session-calendar.pdf'),
('Appropriations & revenue bill transmittal deadline (estimated)', '2027-04-05', null, 'Deadline', 'Estimated', 'Estimated date by which appropriations and revenue bills must transmit to the other chamber. Based on the 2025 session''s April 7 appropriations transmittal deadline, offset for the 70th Legislature''s two-days-earlier convening date. Confirm against the official 2027 session calendar once leadership adopts it.', 'https://www.mtcounties.org/wp-content/uploads/publications/legislative/updates/2025/2025-01-20-session-calendar.pdf'),
('70th Montana Legislature adjourns sine die (estimated)', '2027-04-30', null, 'Session', 'Estimated', 'Projected final day of the session (Legislative Day 90 cap). The 69th Legislature''s 2025 session adjourned sine die on this same calendar date; MultiState''s legislative session tracker independently projects April 30, 2027 for the 70th Legislature. Treat as an estimate until the Legislature actually adjourns.', 'https://www.multistate.us/resources/2027-legislative-session-dates');
