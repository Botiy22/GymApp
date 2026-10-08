# Profiles and friends

The bottom bar is **Workout · Food · Goals · Settings · Profile**. Workout contains Train, Plans, Exercises and History. Goals contains Habits and Progress. Lift ranks, earned badges and friend competition are in Profile.

## Activate friends in Supabase

You do not need to upgrade Supabase itself. Install these two additive SQL migrations in the same project the app already uses:

1. Open [Supabase Dashboard](https://supabase.com/dashboard), select your existing app project, and choose **SQL Editor → New query**.
2. Open [20261008_social.sql](https://github.com/Botiy22/GymApp/blob/main/migrations/20261008_social.sql), copy the **entire file**, paste it into the query and click **Run**. Wait for success.
3. Create another new query. Copy and run the entire [20261008_social_contacts.sql](https://github.com/Botiy22/GymApp/blob/main/migrations/20261008_social_contacts.sql) file. Run this one after the first.
4. Keep the existing public project URL/key in `js/config.js`; the existing `supabase.sql` private account table must already be installed. These migrations can be rerun and preserve private account data.
5. In the app, use **Settings → App → Check for update**, then **Profile → Edit profile**. Save a unique username (3–24 letters, numbers or underscores). Both people need to be signed in and to save a username.
6. Under **Profile → Friends & competition**, choose Username and enter the friend's exact username. The other person accepts the incoming request in that same section. Refresh the section to load changes; accepted friends can open each other's profiles and appear in the weekly leaderboard.
7. To use email search, each person must have a confirmed account email and enable **How friends can find you → Let friends find me by email**, then save. Exact email lookup works only for opted-in accounts.
8. Phone lookup is optional: configure an SMS provider in **Supabase Authentication → Providers → Phone**, verify the number in the app, and enable phone discovery. SMS providers may charge for messages; username and email requests do not require SMS.

The app shows connected friends, rather than a publicly browsable directory of all accounts. Only chosen public profile details and gym aggregates are shared after acceptance. No service-role/admin secret belongs in the app. If a query fails, keep the error message and resolve that step before running the next file; do not reset tables or your project.

The cloud coding environment cannot reach the configured Supabase project (proxy 403) and has no database admin connection. The migration has been tested on disposable PostgreSQL, but **has not been applied to the live project**. The UI reports an unavailable backend/missing migration without fabricating friends, points or claimed usernames. Profile edits remain on the device after a network or username error; saving again retries publication.

## Email and phone discovery (2.9.0)

The contact migration is additive and idempotent; run it after the original social migration. Both still require activation in your live Supabase SQL Editor. This environment has no database admin connection, so the new migration has **not been applied or executed**. No tests were run for 2.9.0.

In Profile → Friends & competition, choose Username, Email, or Phone. Username lookup remains compatible with the original migration. Contact lookup matches exact details of users who have published a username and explicitly enabled that discovery option. Missing, opted-out and unverified contacts receive the same unavailable-account message. Lookup is limited to 20 attempts per account per hour, including unsuccessful contact matches. Existing requests remain idempotent and require acceptance; accepted friends can view each other's public profile and aggregate statistics.

Profile → How friends can find you controls email and phone discovery independently. Both default to off and are saved server-side in a private table. Only the owner's contact settings RPC returns their own verified phone; contact details are never added to public profiles, requests, leaderboards or friends' responses. Email must be confirmed by Supabase Auth. Phones use international `+` country-code format and must be confirmed in Auth; unverified profile text cannot impersonate a number.

To enable SMS verification, configure your own supported SMS provider in Supabase Authentication → Providers → Phone. This app does not create a provider, incur SMS charges or claim SMS was sent when the API fails. The app uses the authenticated phone-change request and SMS verification endpoints; existing-number changes follow your Supabase phone-change/security configuration. SMS delivery, live email, actual accounts and server-side permissions remain unverified in this release. Do not put a service-role/admin secret in the browser.

## Profile customization

Choose a display name, a 160-character bio, a photo and Mint/Violet/Amber/Slate cover color. Photos are resized and saved as JPEG, under 90 kB; arbitrary external image URLs and SVG uploads are not stored. Changes follow the existing private account sync and JSON backup.

Choose up to four earned badges individually, in selection order. Finishing a qualifying workout announces new badges. Existing history qualifies automatically. Deleting qualifying logs recalculates milestones and removes unearned badges from display.

| Badge | Requirement |
| --- | --- |
| First rep | First workout containing working sets |
| Finding rhythm | 10 logged workouts |
| Built to last | 50 logged workouts |
| Showing up | Train on 7 different UTC dates |
| Hundred-ton club | 100,000 kg of working-set volume |
| Triple digits | A 100 kg working set on the tracked barbell bench press |
| Four foundations | Earn at least Spark on all four tracked barbell lifts |

Ranks retain the rules in [RANKS.md](RANKS.md). The calorie clock has 60 line indicators and uses today's logged meals, the applicable plan/manual calorie target, and activity calories when that budget setting is enabled. Unknown targets are shown explicitly; excess intake is displayed as a number above target. The dial fills at 100% rather than wrapping around.

## Weekly competition

All friends use **Monday 00:00 through Sunday 23:59 UTC**, independent of each device's language, timezone or configured diary week start. Points reset by querying the current week; no destructive reset job is needed.

- 100 points per distinct training date.
- 5 points per completed working set, capped at 20 sets per date.
- Maximum 200 points per day / 1,400 per week.
- Bodyweight sets qualify. Warm-ups, unfinished/future workouts and workouts marked done without logged sets do not.
- Multiple workouts on one date share the same cap. Ties share a position.

Consistency and working sets determine points; absolute weight and calories do not. Scores are derived from the account's private saved logs by PostgreSQL, rather than accepted from a client score field. Logs remain self-reported and editable; this is a friendly comparison, not a verified athletic leaderboard. Refresh syncs the current user's logs before reading scores; friends' scores reflect their latest synced logs.

## Sharing and permissions

The existing private `userdata` row-level policies stay unchanged. No friend can read meals, body measurements, API keys or individual workout entries through these features. The new tables have row-level security and no direct anonymous/authenticated table grants. Authenticated RPCs control publication, requests, acceptance, removal and profile reads.

Accepted friends can see the chosen display name, username, photo, bio, cover color, selected earned badges, highest rank, and aggregate gym statistics. Pending requests expose only identification; bio, badges and statistics stay hidden until acceptance. Unrelated users cannot browse another person's profile or private data. Either person can remove an accepted friendship. A maximum of 50 accepted friends and 100 total connections per account keeps the dashboard bounded. Sending the same request twice is idempotent; sending a reverse request does not silently accept it.

The backend independently recomputes milestones and filters selected badges, so unsupported or unearned client selections never appear on a friend's profile. Publish jobs are serialized to preserve individual badge-selection order.

## Development checks

The normal Chromium suite includes profile persistence, photo selection, calorie targets, badges, mobile layouts, and authenticated social UI with synthetic HTTP fixtures:

```sh
python3 -m unittest discover -s tests -v
```

For an actual disposable PostgreSQL permissions/scoring check, no live account or credentials are needed:

```sh
python3 -m pip install --target /tmp/gymapp-pg-tools pgserver==0.1.4 psycopg2-binary==2.9.13
PYTHONPATH=/tmp/gymapp-pg-tools python3 tools/check_social.py -v
```

The checker creates the Supabase auth roles/UID boundary and original private table, applies the migration twice, and exercises authenticated and denied queries. It stops and deletes its temporary database afterward. It does not validate a live Supabase project's deployment, PostgREST configuration or physical iOS behavior.
