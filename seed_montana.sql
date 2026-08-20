-- ============================================================================
-- Seed data — Montana, 2027 session (Sept 2026 – Jan 4, 2027)
-- Run this AFTER schema.sql, in the same Supabase project's SQL Editor.
-- Only run this for the Montana instance — a new state/client instance
-- gets its own seed file with its own events.
-- ============================================================================

insert into events (name, date, end_date, category, status, description, source_link) values
('Governors'' Cup Golf Tournament (MT Chamber)', '2026-07-31', '2026-08-01', 'Networking', 'Confirmed', 'Montana Chamber Foundation''s annual golf tournament in the Flathead Valley — one of the state''s largest business/policy networking events, drawing legislators, lobbyists, cabinet members, and the Governor.', 'https://montanachamber.com/governors-cup-golf-tournament/'),
('Labor Day', '2026-09-07', null, 'Holiday', 'Confirmed', 'State government offices closed.', null),
('Interim committees target completion date', '2026-09-15', null, 'Interim Committee', 'Estimated', 'Legislative Council''s suggested target for 2025-26 interim committees to wrap up studies and finalize bill requests. Actual final meeting dates vary by committee.', 'https://archive.legmt.gov/committees/interim/'),
('MACo Annual Conference', '2026-09-27', '2026-09-30', 'Conference', 'Confirmed', 'Montana Association of Counties'' annual conference, Helena. Policy committees meet and often shape MACo''s 2027 legislative package.', 'https://www.mtcounties.org/events/'),
('Columbus Day', '2026-10-12', null, 'Holiday', 'Confirmed', 'State government offices closed.', null),
('MACo Finance Training', '2026-10-21', '2026-10-22', 'Conference', 'Confirmed', 'MACo finance training, Helena.', 'https://www.mtcounties.org/events/2026-maco-finance-training/'),
('General Election Day', '2026-11-03', null, 'Election', 'Confirmed', 'Determines the makeup of the 70th Montana Legislature, convening January 2027.', null),
('Veterans Day', '2026-11-11', null, 'Holiday', 'Confirmed', 'State government offices closed.', null),
('New legislator orientation window', '2026-11-15', '2026-12-15', 'Session Prep', 'TBD', 'Newly elected legislators typically attend orientation in the weeks after the election. Exact 2026 dates not yet published.', 'https://www.legmt.gov/'),
('Thanksgiving', '2026-11-26', '2026-11-27', 'Holiday', 'Confirmed', 'State government offices closed Thu-Fri.', null),
('Unlimited Bill Draft Request (BDR) deadline', '2026-12-05', null, 'Deadline', 'Confirmed', 'Unlimited BDRs close at 5:00 PM. After this, each legislator is capped at 7 BDRs. Falls on a Saturday — confirm if the practical cutoff shifts to Friday Dec 4.', 'https://www.legmt.gov/lsd/drafting-bills/'),
('Preintroduced bill sponsor sign-off deadline', '2026-12-15', null, 'Deadline', 'Estimated', 'Committee-requested bills must generally be preintroduced and signed so they can be assigned to committee before Day 1. Exact date not yet published.', 'https://www.legmt.gov/'),
('Christmas Day', '2026-12-25', null, 'Holiday', 'Confirmed', 'State government offices closed.', null),
('New Year''s Day', '2027-01-01', null, 'Holiday', 'Confirmed', 'State government offices closed.', null),
('70th Montana Legislature convenes — Session Day 1', '2027-01-04', null, 'Session', 'Confirmed', 'First Monday in January per MCA 5-2-103. Regular session capped at 90 legislative days.', 'https://www.legmt.gov/');
