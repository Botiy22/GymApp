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
