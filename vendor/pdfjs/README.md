# PDF.js 5.6.205

Upstream: https://github.com/mozilla/pdf.js
Distribution: npm `pdfjs-dist` 5.6.205, legacy build.
Copied from the execution runtime's installed official npm package.

`pdf.min.mjs` and `pdf.worker.min.mjs` are unmodified distribution files.
Licence: Apache-2.0; see LICENSE and copyright notices in each module.
They are hosted with the app, not fetched from a CDN.

Only text extraction is used. `isEvalSupported:false`, `disableFontFace:true`,
`useSystemFonts:false`, `useWorkerFetch:false` and `enableXfa:false` are set.
No PDF JavaScript/actions, annotations or external document links are executed.
No OCR, image rendering, font package, CMap or WASM decoder is bundled.
Unsupported PDFs can fail and are reported rather than silently filled in.
