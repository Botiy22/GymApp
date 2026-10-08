# Individual recipe images

Each of the 19 current recipes has its own independently generated OpenAI food photograph, created on 2026-10-08. No contact sheet, atlas or tile crops are used. The prompt used each recipe's dish and existing ingredients, one centered serving, natural side light, ivory tableware and a neutral stone surface.

Files use the exact recipe ID: `<id>.webp` is the 1448 × 1086 full image; `<id>-thumb.webp` is a 384 × 288 derivative of that same whole image. Full-resolution detail views load eagerly; list thumbnails load lazily. WebP quality 92 for detail and 90 for thumbnails retains native detail while reducing page transfer. Both versions are bundled and content-hashed for offline use. The prior atlas and flatbread PNG are removed from this release and preserved in the pre-change Git backup.

These are serving ideas, not verified photographs or portion/ingredient measurements. Existing ingredients, quantities, recipe notes and nutrition remain authoritative. Details carry a short AI-generated caption; thumbnails are decorative beside the recipe name and hero images have accessible dish labels. No third-party app images were copied.

Source PNG files were retained unchanged under `/workspace/generated_images` during this task; the app exports above are the durable repository assets. To replace an image later, generate the dish separately and export the whole frame at both sizes. Never crop a new recipe out of a collage.
