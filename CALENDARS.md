# Daily routine and calendars (2.29)

Routine replaces the Goals landing page. The Schedule has a day/week timetable, tap-to-add time slots, activity categories, daily/weekday/weekly repeats, completion and editable notes. Habits and Progress remain as secondary tabs; existing data is retained. Planner events are private: they are not workout/food logs and do not add competition points or calories.

## Available immediately

Create, edit, complete and remove your own activities offline. Import an `.ics` file from Apple/iCloud, Google, Outlook or another RFC 5545 calendar. Re-import the same filename to replace its snapshot; deleted external events disappear and retained events keep their done status. The current import window covers the past 90 days and next 366 days. Calendar files are a snapshot; they do not refresh automatically. Saved events and source names join account sync and JSON backups. URLs stay only on the current device, never in userdata, profile sharing or export.

ICAL.js 2.2.1 is vendored unchanged at `vendor/ical/ical.min.js` (upstream `dist/ical.es5.min.cjs`, UMD distribution, MPL-2.0). npm verified SHA-512 integrity: `yK/UlPbEs316igb/tjRgbFA8ZV75rCsBJp/hWOatpyaPNlgw0dGDmU+FoicOcwX4xXkeXOkYiOmCqNPFpNPkQg==`. It handles recurrence rules, exceptions, exclusions, all-day events and embedded VTIMEZONE/DST definitions. Missing named-timezone definitions and high-frequency recurrences are rejected with actionable feedback, never guessed. Event limits bound parsing. Calendar values render as escaped text.

## Enable subscription-link refresh

A browser cannot read the iPhone Calendar database or silently connect an Apple/Google account. No EventKit/native permission is available to this PWA. The initial integration is **one-way iCalendar subscriptions**, with `.ics` import as an always-working local alternative. Full private OAuth/CalDAV access and background syncing are separate work, not claimed here. iCloud public subscriptions make that source calendar public; use an export instead if that is unsuitable.

Deploy the included authenticated Supabase Edge Function (no SQL migration):

```sh
supabase functions deploy calendar-feed --project-ref YOUR_PROJECT_REF
supabase secrets set --project-ref YOUR_PROJECT_REF CALENDAR_ALLOWED_ORIGINS=https://YOUR_APP_HOST
```

For multiple app origins, use a comma-separated value, with scheme and port if applicable, no trailing slash. Supabase supplies SUPABASE_URL and SUPABASE_ANON_KEY; do not add a service-role key. Keep function JWT verification enabled. The function verifies the user through Auth, enforces exact allowed origins, HTTPS, provider host allowlisting, redirects, byte/time limits and an instance-local rate limit. It never forwards user authorization to calendar hosts and never logs or stores URLs or bodies. For high traffic, add a project-level distributed rate limit at the gateway.

Default hosts: calendar.google.com, outlook.live.com, outlook.office365.com, outlook.office.com, caldav.icloud.com pNN-caldav.icloud.com and neptun.bme.hu. For another provider, add its exact trusted public hostname using CALENDAR_FEED_HOSTS. Do not add internal hosts/IPs. URL credentials and non-HTTPS destinations are refused. All redirect destinations undergo the same validation.

Then open Routine → Calendars → Connect a calendar, paste the subscription link and connect. A feed is saved as connected only after a successful authenticated fetch and parse. Feed events refresh on opening Routine, returning to the visible page, or after 15 minutes with Schedule visible. “Sync now” forces refresh. Failed refresh retains old events and shows feedback. A different device requires re-entering the link; no URL is included in sync/backups. Removing a source removes its Reppsy events, never the upstream calendar. Two-way edits are not supported.

The function and its deployment are **not applied to a live project by this change**. Until deployed, the UI explains the missing service and offers file import. Do not claim an Apple account is connected or that an exported file is automatically syncing.

## Data compatibility

`planner` is a new field in the existing private userdata JSON. Records merge individually by update timestamp; completion flags merge by date/timestamp, including explicit undo. Source and event deletions use the existing tombstones. New helpers are included in the verified service-worker shell, with stale-shell capability checks. Other devices should update before editing or syncing this new field. Existing storage keys, workouts, food, habits and plans are unchanged.

## BME Neptun timetable links (2.29.1)

The BME Neptun host is included in the default allowed hosts. In Routine → Calendars → Connect a calendar, paste the full timetable synchronization URL, including its query parameter. The calendar download endpoint can put `.ics` in the query rather than the URL path; the relay checks the actual iCalendar payload, not the filename. Existing IDs/query parameters pass through unchanged. An empty calendar name defaults to BME Neptun. No individual subscription URL is embedded in the repository.

Deploy or redeploy the updated `calendar-feed` function before trying link sync. If the function is not deployed, open the Neptun link in a browser, save the resulting .ics file, then use Import a calendar file. The supplied live link could not be retrieved from the cloud environment (network request unavailable); validation used invented timetable fixtures with the same endpoint shape.
