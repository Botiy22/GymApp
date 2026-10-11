# Reppsy — logo refinement, 2.23.0

The v2 mark keeps the two angular apricot/coral links, with warmer gradients, cleaner separation and balanced padding. Built-in imagegen refined the original raster mark; the generated master is preserved in `icons/reppsy-source-v2.png`. Deployment exports use versioned `-v2.png` paths so cached icon URLs are distinct. The transparent `reppsy-mark-v2.png` is centered on a square canvas for update rotation; install icons use graphite backgrounds, with extra maskable padding. Previous assets remain available.

Final image prompt: “Keep exactly this two-link shape, geometry, gradients and diagonal placement. Remove red and yellow speckles and stray fragments around the outside and inside every hole and seam. Only the large solid smooth logo bands remain. Clean antialiased edges; no texture, grain, shadow, glow or text. Center on a square transparent canvas with equal margins.” Exports resize the generated alpha and composite install icons onto graphite.

Local Chromium checks verified mobile/desktop HU/EN layouts, offline assets, logo spin, upright settling and reduced motion. Restart now waits for the settling animation. Physical OS icon refresh remains unverified.

# Reppsy — working name, 2.16.0

The user selected Reppsy as the current app name. The new custom AI-generated logo uses two interlocking angular apricot/coral motion links on graphite, expressing repetitions, strength and momentum. It contains no letter R, monogram or wordmark. No third-party logo was supplied or copied; name/trademark availability remains unverified.

The unmodified generated master is `icons/reppsy-source.png` (1254 × 1254); the original also remains under `/workspace/generated_images`. ImageMagick exports supply `reppsy-apple-180.png`, `reppsy-192.png`, `reppsy-512.png` and `reppsy-maskable-512.png`. The centered mark is contained within the maskable central safe area; both 512 versions retain the full square graphite background. Old icon assets remain for cached-shell compatibility.

Reppsy appears in HU/EN labels, headers with the small symbol, login/onboarding, HTML/browser/Apple titles and manifest name/short name. Runtime metadata refresh uses the new icon URLs for old cached HTML. All four deployed icons are verified offline CORE assets. Exports use `reppsy-backup-` and `reppsy-workouts-`; the backup schema is unchanged.

App URL, manifest ID/start URL/scope, storage keys, private account configuration, diary/plan/history records and theme preferences are preserved. Existing iOS Home Screen shortcuts may retain their original name/icon even after the app updates. Settings → App → Update name and icon explains exporting before re-adding; keep the old installation until the new one contains your data. Physical OS icon refresh is not verified.

Focused local Chromium checks at 320px HU/390px EN verified names, wordmark image loading, install icon dimensions, cached-metadata refresh, backup filename and diary persistence. Sign-in icon/name and a real verified service-worker offline reload also passed; no live account calls or hosting deployment were verified.

---

# Setora — working name, 2.9.0

Setora replaces the visible Otisport name in the app, signup, manifest and browser/Home Screen metadata. Availability and trademarks have not been checked. The existing abstract mint icon assets remain. Paths, manifest identity/scope, `gymapp.v1` data keys, private onboarding metadata, account project and import schemas retain compatibility. New data exports use the `setora-` prefix. Existing iOS shortcuts can retain their original name; the Settings guide explains backup and re-adding limitations.

The earlier icon provenance and brand history follow.

---

# Otisport

The name comes from the user's suggested **Otisport** direction: a personal, sport-focused name that fits workouts, meals, goals and friends. It replaces Tungsten without changing the app URL, manifest scope, account project or `gymapp.v1` storage keys.

The new AI-generated icon is a mint/seafoam open O with a forward-slanting accent on a dark petrol background. It contains no lettering, stock dumbbell or borrowed source logo. The generated master is preserved as `icons/otisport-source.png`; the original generation output also remains outside the repository in `/workspace/generated_images`.

| Asset | Use |
| --- | --- |
| `icons/otisport-apple-180.png` | Apple touch icon, 180 × 180 |
| `icons/otisport-192.png` | Browser favicon, sign-in logo and PWA icon, 192 × 192 |
| `icons/otisport-512.png` | PWA icon, 512 × 512 |
| `icons/otisport-maskable-512.png` | Android maskable icon, 512 × 512, artwork inset for the central safe circle |

ImageMagick resized the master for deployment. The maskable version centers a 448 × 448 copy on a matching dark 512 × 512 canvas. All four deployed assets are included in the verified offline shell. New asset names prevent ordinary browsers from confusing them with the previous icon URLs. Previous icon files remain for compatibility with old installed shells.

Visible names are updated in the web manifest, HTML title, Apple home-screen title, both languages' app labels and the sign-in screen. Export filenames now begin with `otisport-`; existing backups still restore through the same schema.

An installed iPhone shortcut can retain the name/icon from its original installation. Updating app files does not guarantee iOS will replace that OS-managed shortcut metadata. If it remains old, export a data backup from Settings before re-adding the Home Screen app. Keep the old installation until the new one shows your data; restore the export if needed. Physical iOS shortcut refresh is not verified in this environment.

Since 2.8.0, runtime title/icon/manifest references are refreshed for older cached HTML and the manifest has an explicit ID matching its previous start_url identity. Settings → App → Update name and icon explains installed PWA versus bookmark behavior and offers a backup export. These changes do not force iOS to rewrite existing shortcut names/icons.
