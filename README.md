# Súlypont

(Formerly "GymApp". The folder and the web address keep the old name on purpose: the address is what the
installed app and its saved data are tied to.)

A workout tracker and calorie diary that installs on a phone from the browser, with no App Store and no
developer account. It is a web app (PWA): plain HTML, CSS and JavaScript, no build step. All your data
stays on the device.

## What is in it

- **Workout**: the five ULPPL routines (35 exercises), live logging of kg and reps per set, previous
  session shown next to each set, automatic rest timer, warm-up sets, add/remove/reorder exercises.
  **Free workout**: tick the exercises you want and start; at the end it can be saved as a routine.
  **Your own routines**: tick the exercises in one go, then name the routine and set sets/reps/rest.
  Any routine can be saved as a copy and changed, the built-in ones stay as they are.
- **Exercises**: 876 exercises, 873 of them with start/end photos, muscle map, instructions, your record and
  progress chart per exercise.
- **Progress**: weekly sets per muscle group against the 10–20 target zone, body weight, records,
  full workout history, weekly workout goal.
- **Food**: calorie and macro targets (Mifflin–St Jeor) and a daily diary with three ways to add a meal:
  **search** the built-in food database (8,257 foods, fast food included; type the name, enter grams,
  the values are calculated), **AI** estimate from a photo or a description, or **your own values**
  from a label. **Ideas**: 15 recipes with calculated macros, one tap adds a serving to the diary.
- **Settings**: language, accent colour, background, fewer animations, reduce transparency, rest timer
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
The folder has about 1,760 files (43 MB), nearly all of them exercise photos.

## Updating the app

Change the files and publish again. On the phone: Settings → Alkalmazás → **Frissítés keresése**
downloads the new version and restarts the app. Without pressing it, the installed app picks the new
version up by itself from the second start. Raise `VERSION` in `sw.js` only when you rename or delete
files, so the old copies are cleared from phones; when you add a new file the app must work offline
with, add it to the `CORE` list in `sw.js`.

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

`data/recipes.js` holds the meal ideas. The recipes are the app's own; their calories and macros are
computed by the same script from the food data, using raw ingredient weights. The "videos" list only
links to the creator's own TikTok videos (title and link); the recipes shown in those videos are not
copied into the app. Before offering the app to other people, ask the creator before using his name.

## AI food recognition

Settings → AI food recognition → paste an Anthropic API key (console.anthropic.com) → Save key.
The app asks the API whether the key is accepted (a free request, no tokens used). Once it is, the
key field disappears and Settings only shows "AI is switched on". The field comes back by itself if
the API ever rejects the key, or when you tap "Remove the key from this device".

The key is stored only in the browser storage of the device where you entered it, and is never
written into a backup file. So each device (phone, PC) needs the same key entered once. Do not put
the key into any file in this folder: the folder is published publicly.

The photo is shrunk to 1024 px on the phone and sent straight to the Claude API; usage is billed to
your account. Before other people use the app, this call has to move to a server of yours so no key
is ever on a user's device.

## Look

Glass style: a colourful "wallpaper" of soft colour fields behind everything, translucent cards with a
light edge, and frosted blur on the things that float over moving content (tab bar, panels, workout
header, rest timer). It is all in the "glass" block of `css/app.css`; the wallpaper is the `--ambient`
line. In Settings → Megjelenés you can change the accent colour and the background, and switch
transparency or animations down. With "Reduce Transparency" switched on in iOS the surfaces turn solid
by themselves where the browser reports that setting.

## Animations

Buttons give way when pressed, panels slide up and down, screens fade in when you switch tabs.
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
  to this site and `api.anthropic.com`, photos only from this site and the dataset's GitHub address.
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
| `js/ai.js` | the Claude API call for food estimation |
| `js/store.js`, `js/charts.js`, `js/musclemap.js` | storage, charts, body map |
| `data/exercises.js` | the exercise library |
| `data/foods.js`, `data/recipes.js` | food database (USDA SR28) and meal ideas |
| `img/ex/<id>/0.jpg, 1.jpg` | start and end photo of each exercise |
| `sw.js`, `manifest.webmanifest`, `icons/` | what makes it installable and offline |

## Sources

Exercise data and photos: [free-exercise-db](https://github.com/yuhonas/free-exercise-db), published
under the Unlicense (public domain dedication). The photos were resized for phone screens. The
repository states the licence but does not document where each photo originally came from, so check
that before selling a product built on them.

Food values: US Department of Agriculture, Agricultural Research Service, Nutrient Data Laboratory.
USDA National Nutrient Database for Standard Reference, Release 28 (2015). Public domain.
