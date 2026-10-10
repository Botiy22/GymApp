# Reppsy

(Working name; availability has not been checked. Formerly "Setora", "Otisport", "Tungsten", "GymApp", "Súlypont" and "Rep Riot". The folder and the web address keep the old name on purpose: the address is what the
installed app and its saved data are tied to.)

A workout tracker and calorie diary that installs on a phone from the browser, with no App Store and no
developer account. It is a web app (PWA): plain HTML, CSS and JavaScript, no build step. Your data stays
on the device; if you set up accounts (optional, see below) it is also kept in your own database, so
you can reach it from any device after signing in.

Branding assets and installed-icon refresh guidance: [BRANDING.md](BRANDING.md).

Otisport 2.7 uses a shared graphite, apricot and lavender design with a matching warm light theme. Saved custom colors and accessibility preferences remain available. Scope, review notes and the pre-change restoration backup: [DESIGN_REFRESH.md](DESIGN_REFRESH.md).

## Personalized registration

Register starts with your goal, sex, age, height, weight and activity, then previews a calculated daily calorie target before creating the account. Your initial target appears in the food diary and profile after sign-in. Existing personal targets are retained. Exercise details have the previous detailed front/back muscle drawing with primary and secondary highlights; Movement keeps the drawings/photos and zoom. [PERSONALIZATION.md](PERSONALIZATION.md) describes account persistence, review limits and the verified backup.

## Navigation and profiles

The bottom bar is **Workout · Food · Goals · Settings**. Exercises are inside Workout; Habits and Progress are inside Goals. Profile shows your lift rank, a clock-style daily calorie meter, workout totals and earned achievements. A circular photo shortcut at the top right opens your profile. Customize its photo, short bio and public cover color, then select up to four earned badges individually. A live editor preview adds personal cover designs, photo shapes and an option to follow your app accent; the active cover design/photo can be shared with accepted friends after the latest migration. New badges are announced when you finish a qualifying workout.

Usernames, friend requests, friend profiles and weekly competition use the additive migrations in [SOCIAL.md](SOCIAL.md). **Run them in order in your existing Supabase SQL Editor to activate friends.** The migration is prepared and tested, but is not installed on the live project from this environment. [SOCIAL.md](SOCIAL.md) explains activation, points, milestones and sharing rules. Local customization works without a social connection.

## What is in it

- **Workout**: optional editable starter splits, live logging of kg and reps per set, previous
  session shown next to each set, automatic rest timer, warm-up sets, add/remove/reorder exercises.
  **Free workout**: tick the exercises you want and start; at the end it can be saved as a routine.
  **Your own routines**: tick the exercises in one go, then name the routine and set sets/reps/rest.
  Any routine can be saved as a copy and changed, the built-in ones stay as they are.
  Routines show as tiles, two next to each other, each with an icon chosen from its muscles (or by hand
  in the editor). The date and the days of the week strip open a **calendar**: tap any past day to see
  its workouts, meals and steps.
- **A plan you only tick off**: a plan file (Settings → Data → Restore) brings a coach's plan into the
  app without touching the log: its workout days take the place of the built-in routines (sets, rep
  ranges, RIR, rest, notes; optional days are marked and never offered as "next"), and its **meal plan**
  shows each weekday's meals with the exact foods, grams, kcal and macros. One tap ticks a meal and
  logs it with the plan's numbers; the day's calorie and macro target is the plan's total for that
  weekday. The next workout has two buttons: **start** (track every set as usual) or **"done, just
  tick it"** (counts for the week, the calendar and the muscle chart with its planned sets). The plan
  file itself is personal and is **not** part of this repository.
- **Your own database**: add **own exercises** (name, muscles, equipment, steps, a photo, a video
  link) — they join the library, the search, routines and workouts — and **own foods** (per 100 g or 100 ml from
  the label, with a portion). Any built-in exercise can get your own picture and video link, with a
  way back to the original. Own pictures are shrunk to about 480 px (at most 30 of them); videos are
  links that open in the browser, nothing is downloaded. All of it syncs with the account and is in
  the backup.
- **Warm-up and stretching**: every routine and every running workout offers a short **warm-up**
  (moving exercises, 20 s each) and **stretching after the workout** (held stretches; 20, 30 or 45 s,
  per side where there are two). The moves are picked from the muscles of that workout, out of the
  exercise library, so each has photos and instructions. A guided timer walks through them, with a
  cue to change sides at half time; or tick "I did it". Whether it was done is saved with the
  workout. Can be switched off in Settings. General fitness guidance, not medical advice: go only to
  a mild pull, never into pain.
- **Exercises**: 876 exercises shown as tiles, two next to each other. 873 have start/end photos (the
  original 850 px pictures in the detail view, small ones in lists); 182 also have line drawings, shown
  as start and end position side by side. Every exercise has an anatomical body map (front and back)
  with the worked muscles filled in, your record and a progress chart. Names and instructions are in Hungarian and English. Filters without sideways
  scrolling: body part → muscle → equipment. A star marks **favourites** (exercises and foods).
- **Progress**: weekly sets per muscle group against the 10–20 target zone, body weight, records,
  full workout history, weekly workout goal.
- **Habits**: a daily checklist for your own habits, with weekday schedules, streaks, and past check-ins.
  Completed habits also appear in the calendar and day view; habit data is included in backups and account sync.
- **Food**: calorie and macro targets (Mifflin–St Jeor; see "Calorie calculator" below) and a daily diary with three ways to add a meal:
  **search** the built-in food database (8,257 foods, fast food included; type the name, enter grams or dl for supported liquids,
  the values are calculated), **AI** estimate from a photo or a description, or **your own values**
  from a label. **Ideas**: 19 meal ideas with individual serving images. Missing nutrition is completed before logging a serving.
- **Steps and calories burned**: per day, typed in or pasted (see "Fitness data" below); the burned
  calories can be added to the day's calorie budget.
- **AI coach**: a chat bubble; ask about food or training and it answers from your targets, today's
  meals and your recent workouts (needs the API key; estimates, not medical advice). Conversations are
  saved: **History** lists them (newest 40), any of them can be reopened, continued or deleted, and the
  coach is given the gist of the last five so it can pick up where you left off.
- **Settings**: language, accent colour (a colour scale: any hue, same brightness), background
  (colourful, dark, plain or **bright**), fewer animations, reduce transparency, rest timer
  options, weekly goal, first day of week, backup/restore, CSV export, delete all data, update button.
- Hungarian and English, switchable in Settings.

## Put it on your iPhone

The phone needs to load the app once from an `https://` address. After that it runs offline.

**GitHub Pages (free)**

1. Create a free account at github.com and install GitHub Desktop on this PC.
2. GitHub Desktop: File → Add local repository → choose this `GymApp` folder → "create a repository".
3. Publish repository, and untick "Keep this code private" (free accounts can only publish Pages
   from a public repository). Nothing personal is in these files; your logs and API key live only
   on the phone.
4. On github.com open the repository → Settings → Pages → Source "Deploy from a branch",
   branch `main`, folder `/ (root)` → Save. A minute later the address is
   `https://YOUR-NAME.github.io/GymApp/`.
5. On the iPhone open that address **in Safari** → Share button → "Add to Home Screen" → Add.
6. Start it from the Home Screen icon and log there. Safari and the installed app keep separate
   data, so do not start logging in the Safari tab.

Any other static host with https works the same way (Netlify, Cloudflare Pages, your own server).
The folder has about 3,000 files (about 115 MB), nearly all of them exercise photos and drawings.

## Workout navigation and lift ranks

The Workout page has **Train**, **Plans**, **Exercises** and **History** sections. Lift ranks are in Profile. Train starts/resumes a session; Plans selects or edits a routine; History opens previous sessions and expands their working-set volume. During a workout, use the exercise selector to jump directly to a lift. Tap the volume total after finishing to see the recorded weights, reps and exercise subtotals.

Ranks use actual logged working-set weights for four barbell lifts. Existing history counts automatically. Spark → Ember → Steel → Sentinel → Titan → Apex each has a lift-specific target; a 100 kg flat barbell bench working set earns Titan. Warm-ups, tick-only workouts and estimated 1RM do not count. See [RANKS.md](RANKS.md) for every threshold and qualification rule.

Plan upload is available through the compact file button beside Settings on every main page. Weekly meal-plan days are collapsible, with the current scheduled day expanded; the daily plan in the Food diary can also be folded.

## Updating the app

Change the files, update `js/release.js`, then run `python3 tools/build_release.py` before publishing the complete checkout. The generated `release-manifest.json` lists the SHA-256 hash of every app-shell file. The service worker rejects incomplete or stale deployments and activates one verified release. Never upload only the new version metadata. Add new offline app files to `CORE` in `sw.js` before generating the manifest.

On the phone, the **Update app / App frissítése** button appears in the Settings header only when a newer release is detected. It downloads the verified release, shows a restart animation and preserves saved data. After restarting, a brief success message appears only when the loaded build matches the requested update. An open preview or editor is not discarded automatically. The installed version/build stays in the Settings footer.

Exercise drawings remain the first choice. Missing or broken drawings use the exact existing start/end photo pair; previously viewed images and built-in workout photos are cached for offline use. See [MEDIA_WORKFLOW.md](MEDIA_WORKFLOW.md) for the prioritized batch-production process and `python3 tools/audit_media.py` for current coverage.

## Food database and recipes

`data/foods.js` is built by a script from the **USDA National Nutrient Database for Standard
Reference, Release 28** (US Department of Agriculture, public domain): kcal, protein, carbohydrate
and fat per 100 g, plus household portions. No number in it was typed by hand. Things to know:

- It is US data from 2015. Raw foods (meat, rice, fruit, vegetables) are the same everywhere; **branded
  and fast-food items are the US versions**, so the recipe and portion size in Hungary can differ.
  When the label or the restaurant publishes its own values, those are more exact: use "Saját értékek".
- 241 common foods have Hungarian names (search finds them first when the app is in Hungarian);
  everything else is searchable by its English name. Entries marked ≈ are the closest match, not the
  same product (for example túró).
- Hungarian packaged products (Túró Rudi and so on) are not in it. Use the label or the AI estimate.

`data/recipes.js` holds the original meal ideas, calculated from USDA raw-ingredient data.
`data/additions.js` adds four recipes transcribed from supplied recordings. Their nutrition is
creator-reported and not independently verified. Missing values remain null and must be entered
before logging. Batch quantities and logged servings are separate; pancakes are logged per piece.
Original videos are not bundled. Uncertain quantities and app adaptations are labelled in the recipes.
Every idea has a separately generated serving image, a lightweight thumbnail and a sharp offline detail view; [image notes](img/recipes/README.md).

The video combinations are under Workout → Exercises → Exercise complexes. Centr guides ten rounds in exercise order. Zero rest disables the automatic
timer. The three-grip pulldown routine records one demonstrated sequence, without assuming total
sets or rest from the source. Existing plans and diaries are retained.

Momentum preserves old habit checkmarks and adds counters, diary-driven steps/protein/workout
goals, a weekly strip and 28-day progress. Muscle names describe the map's anatomical groups;
they do not represent measured activation percentages or fibre-specific loading.

## AI food recognition

Settings → AI food recognition → paste an Anthropic API key (console.anthropic.com) → Save key.
The app asks the API whether the key is accepted (a free request, no tokens used). Once it is, the
key field disappears and Settings only shows "AI is switched on". The field comes back by itself if
the API ever rejects the key, or when you tap "Remove the key from this device".

The key is stored only in the browser storage of the device where you entered it, and is never
written into a backup file. So each device (phone, PC) needs the same key entered once. Do not put
the key into any file in this folder: the folder is published publicly.

Photos are shrunk to 1568 px on the phone (the largest size the model looks at) and sent straight to
the Claude API; usage is billed to your account. What is done for accuracy:

- up to two photos of the same meal (from above and from the side); a dark or very small photo is
  pointed out before it is sent;
- quick detail chips (fried in oil, baked, large portion, restaurant, "I ate half"…) that go to the
  model as facts to trust over what it sees;
- the model has to show its working for every weight (pieces × piece weight, or area × height against
  the scale reference) and give a plausible range; the range becomes two buttons, "less" and "more";
- **labels**: when a nutrition table or packaging is readable, the values are copied from it instead
  of estimated (marked on the result) and are not replaced from the database;
- the model may ask **one question** when a single missing fact would change the total by more than
  about 15%; tapping an answer runs one more request with that fact (at most twice per scan);
- a separate **model for photos** can be set, so photos can use a stronger model while text estimates
  and the coach stay on the cheaper one;
- the instruction makes the model find a size reference first, list hidden fat and sauces, and give
  values **per 100 g**; the app multiplies by the grams itself;
- when the food database has an entry under the name the model gave and its energy agrees within 15%,
  the measured USDA values replace the model's (marked on the result);
- **the model does not learn from use.** The app remembers how you corrected earlier estimates (grams,
  kcal per 100 g, renamed or removed items; the last 60) and sends the latest 25 along with each new
  request. Settings shows the count and can forget them. How much this improves the estimates has not
  been measured.

Haiku is the default model (fastest, cheapest); Sonnet and Opus can be chosen in Settings. Before other people use the app, this call has to move to a server of yours so no key
is ever on a user's device.

## Accounts and syncing (optional)

Without setup the app has no sign-in and keeps everything on the device. To require an account and
keep the data in a database (free Supabase project):

1. supabase.com → New project. Wait until it is ready.
2. SQL Editor → New query → paste the contents of `supabase.sql` from this folder → Run. This creates
   the table `userdata` (one row per user) with row level security: a signed-in user can only read and
   write their own row, and people who are not signed in get nothing.
3. Authentication → Sign In / Providers → Email: switch **Confirm email** off for now. (With it on,
   every new account must click a link in an e-mail first, and the built-in mail sender of a free
   project only sends a couple of mails per hour.)
4. Authentication → URL Configuration → **Site URL**: the address of the app
   (`https://YOUR-NAME.github.io/GymApp/`). The "forgot password" mail links back to it.
5. Project Settings → API (or "API Keys"): copy the **Project URL** and the **publishable** key
   (`sb_publishable_…`; on older projects the **anon public** key) into `js/config.js`. Both are meant
   to be public. **Never** put the `service_role` / secret key into any file here.
6. Commit and push. The app now opens on a sign-in screen. Register your account; the data already on
   that device is uploaded into it. After that, on Supabase: Authentication → Sign In / Providers →
   switch **Allow new users to sign up** off, unless you want strangers to be able to register.

How syncing works: the whole diary is one JSON document per user. A device first asks whether the
row changed; if it did, it downloads it and **merges** (workouts and meals from both sides are kept,
deletions are remembered, settings/routines/favourites follow whichever side changed last), then
uploads the result. It syncs at start, a few seconds after each change, and when the app comes back
to the foreground. Logging works offline; changes upload later. Signing out removes the account's
data from the device. The AI key is not uploaded unless you switch that on in Settings → Account.

This part was tested only against a stand-in server that imitates Supabase's documented requests and
answers, **not against the real service**. Try it with a test account before relying on it, and keep
making backups (Settings → Data) for the first weeks.

## Calorie calculator

Resting energy is the Mifflin–St Jeor equation (10 × kg + 6.25 × cm − 5 × years, +5 for men, −161 for
women), multiplied by the activity factor (1.2 to 1.9), then −18% for fat loss or +10% for muscle gain.
The tests compare it with cases worked out by hand. Safeguards built in:

- ages 14–100, heights 120–230 cm and weights 30–300 kg only; anything else gives no numbers;
- under 18 no deficit is suggested;
- a deficit never goes under 1,500 kcal (men) or 1,200 kcal (women); if maintenance itself is lower,
  maintenance is used;
- protein (1.8 g/kg, 2.0 g/kg when losing fat) and the minimum fat (0.8 g/kg) are counted on at most
  the weight at BMI 27, so they do not grow without limit at a high body weight; carbohydrate is what
  is left of the calories.

It is an estimate for healthy adults, not medical advice; the numbers can always be overwritten.

## Fitness data (steps, calories burned)

A web app cannot read Apple Health, Health Connect or any watch directly; only an app installed from a
store can. What the app offers instead: type the two numbers in, or paste a text such as
`steps=8432;kcal=412` (most shapes are understood). On iPhone a Shortcut can produce that text with one
tap: Find Health Samples (Steps, today) → Calculate Statistics (Sum) → the same for Active Energy →
Text `steps=…;kcal=…` → Copy to Clipboard; then "Paste from clipboard" in the app. The shortcut was not
tried on a real iPhone. On Android and with other watches the daily figures are copied by hand from the
maker's app.

## Look

Glass style: a colourful "wallpaper" of soft colour fields behind everything, translucent cards with a
light edge, and frosted blur on the things that float over moving content (tab bar, panels, workout
header, rest timer). It is all in the "glass" block of `css/app.css`; the wallpaper is the `--ambient`
line. In Settings → Megjelenés you can pick the accent colour on a colour scale (the colour is computed in
OKLCH so every hue has the same lightness and dark text stays readable on it) and the background, and switch
transparency or animations down. With "Reduce Transparency" switched on in iOS the surfaces turn solid
by themselves where the browser reports that setting.

## Animations

Buttons give way when pressed, panels slide up and down, and screens cross-fade when you switch tabs
(View Transitions where the browser has them, iOS 18 and newer; older ones get the earlier fade-in).
All of it is in the last block of `css/app.css`. If "Reduce Motion" is switched on in iOS
(Settings → Accessibility → Motion), none of it runs.

## Your data

Everything is stored in the browser storage of the installed app on the phone. Deleting the app
from the Home Screen deletes the data. Settings → Data → Back up saves a JSON file; Restore loads
it again. The data belongs to the address the app was installed from, so moving to a different
address means backing up first and restoring after.

## Safety notes

- Needs iOS 15.4 or newer.
- `index.html` carries a Content-Security-Policy: scripts only from this folder, network calls only
  to this site, `api.anthropic.com` and `*.supabase.co`, photos only from this site and the dataset's GitHub address.
  If you add another service later, add its address there too.
- Whatever is read from storage or from a backup file is rebuilt field by field with fixed types
  (`clean()` in `js/store.js`), and every piece of text is escaped before it is shown.
- A save that fails (storage full or blocked) is announced on screen instead of passing silently.

## Files

| Path | What |
|---|---|
| `index.html`, `css/app.css` | page shell and styles |
| `js/app.js` | screens and logic |
| `js/plan.js` | the built-in ULPPL routines and coaching notes (edit here) |
| `js/i18n.js` | all Hungarian and English text |
| `js/ai.js` | the Claude API calls (food estimation, coach chat) |
| `js/config.js`, `js/cloud.js`, `supabase.sql` | accounts and syncing: your project's address and public key, the sign-in/sync code, the database setup |
| `js/store.js`, `js/charts.js`, `js/musclemap.js` | storage, charts, body map |
| `data/exercises.js` | the exercise library |
| `data/exercises.hu.js` | Hungarian names and instructions for the library (machine-assisted translation) |
| `data/foods.js`, `data/recipes.js` | food database (USDA SR28) and meal ideas |
| `img/ex/<id>/0.jpg, 1.jpg, t.jpg` | start and end photo of each exercise, and a small one for lists |
| `data/figures.js`, `img/fig/` | which exercises have a line drawing, and the drawings (two frames each) |
| `data/body.js`, `js/musclemap.js` | the body outline with its muscle shapes, and the code that fills in the worked muscles |
| `sw.js`, `manifest.webmanifest`, `icons/` | what makes it installable and offline |

## Sources

Exercise data and photos: [free-exercise-db](https://github.com/yuhonas/free-exercise-db), published
under the Unlicense (public domain dedication). The photos are the originals; only the small list
pictures were made from them. The
repository states the licence but does not document where each photo originally came from, so check
that before selling a product built on them.

Food values: US Department of Agriculture, Agricultural Research Service, Nutrient Data Laboratory.
USDA National Nutrient Database for Standard Reference, Release 28 (2015). Public domain.

Exercise drawings: [Everkinetic](https://github.com/everkinetic/data), licensed
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The SVG files in `img/fig/` are used
unchanged. The licence requires this credit to stay, and anyone who changes the drawings must share
the changed drawings under the same licence.

Body map drawing: [react-native-body-highlighter](https://github.com/HichamELBSI/react-native-body-highlighter)
by ELABBASSI Hicham, MIT licence (the notice is kept at the top of `data/body.js`). The paths are used
unchanged.

Detailed movement boards `img/fig/press.webp`, `row.webp`, `lat-wide.webp` and
`lat-medium.webp` are AI-generated GymApp illustrations, separate from the CC BY-SA
Everkinetic SVGs. The medium-grip board was edited to restore normal human faces while
preserving the two positions and shoulder-width overhand grip.


## Document plan import (no API key)

Use **Add a plan** on Workout, Food, or Settings → Data. Choose one or two XLSX, PDF or DOCX files; the preview opens automatically. Review the detected workouts and meals, complete highlighted fields, then tap **Add plans**. The success screen opens the saved workouts or Food → **Meal plan**, where all seven weekdays are visible. A plan imports schedules; it does not log meals as eaten. Tick eaten meals in the Diary.

Excel sheets retain their column structure. Hungarian and English headers are recognized, including:

| Workout columns | Meal columns |
| --- | --- |
| Day / Nap or Routine / Edzés | Weekday / Nap, Meal / Étkezés |
| Exercise / Gyakorlat | Food / Étel, Grams / Gramm |
| Sets / Sorozat, Reps / Ismétlés | kcal, Protein / Fehérje, Carbs / Szénhidrát, Fat / Zsír |
| Rest (sec) / Pihenő (mp), RIR | Explicit `kcal/100g` and macro `/100g` columns are scaled by the stated grams |

A sheet name can provide the workout name or a written weekday. Adjacent blank day/meal cells and merged grouping cells retain their groups. Missing weekdays require a selection. Unrecognized sheets offer column mapping. Food-row nutrients are summed only when every row supplies that nutrient; explicit meal totals take precedence. Missing nutrition, quantities, sets and exercise variants require completion. Missing rest can use your configured default only after you choose **My default**. No nutrition or exercise variant is invented.

New workouts append to the current routines. Meals append to the current weekly plan by default; choosing replacement requires confirmation. Limits are checked before saving (100 routines, 10 meals per weekday, 12 sets per exercise). A storage failure shows an error and restores the previous in-memory plan. Diaries, active workouts and account settings stay in place. JSON plan export is available under Details and more options, alongside extracted source text.

Reading is local: PDF.js 5.6.205 (Apache-2.0) and JSZip 3.10.1 (MIT) are bundled and cached for offline use. Maximum: two files / 12 MB combined, 60 PDF pages, 200,000 characters, 24 MB expanded OOXML / 8 MB per part / 2,000 ZIP entries, 30 sheets / 10,000 rows / 256 columns. Macros, links and spreadsheet formulas are not executed. Formula cells use cached values; missing caches require completion. General Excel formatting, dates, images and external links are not interpreted. PDF/DOCX recognition still uses explicit text patterns; scanned PDFs have no OCR. Legacy DOC/XLS must be saved as DOCX/XLSX first. Raw source files/text are not stored in the diary or account; the approved saved plan follows the existing account-sync behavior.

Release history is visible in Settings → **What's new** and recorded in `RELEASES.md`. The public version, build and offline cache ID come from `js/release.js`.

Browser regression checks and their actual results are documented in [tests/README.md](tests/README.md). The user's original XLSX and earlier private PDFs were not supplied. Chromium checks use generated XLSX/DOCX/PDF fixtures and isolated browser data; they do not access a live user account. Safari/WebKit installation was blocked by the environment's network allowlist, so no physical iPhone/Safari behavior or live Supabase/AI requests are claimed as tested.

Workout/cardio energy estimates and optional daily calorie budgets are documented in [WORKOUT_ENERGY.md](WORKOUT_ENERGY.md).

Editable starter workout splits, previews, grouping and removal are documented in [ROUTINE_TEMPLATES.md](ROUTINE_TEMPLATES.md). They are optional additions under Workout → Plans.


Reppsy 2.19 adds profile color wheels, Glass/Normal/Matte surfaces, plan export and top-right photo navigation. Username registration and friend photo likes, reviews and explicitly shared routine copies need the new Supabase migration; see [SOCIAL.md](SOCIAL.md). The coding environment has not applied that migration to the live database.

## Original personal routine file

[Download the original five-day split](exports/reppsy-original-five-day.json). Import it in **Settings → Data → Import JSON** to add Upper, Lower, Push, Pull and Legs with the original 35 exercises, sets, reps and rests. It appends editable copies and does not replace your diary. This personal split is no longer automatically added for everyone; only unchanged automatic copies are retired when clients update. Edited copies and history stay.
