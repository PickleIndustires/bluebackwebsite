# Image Manifest

This documents every image asset used on the rebuilt site: what it is, where it's used, its alt text pattern, and what optimization was applied. Filenames were **not** renamed in this pass (see "Naming" note at the bottom) — every `images/*.jpg` and `videos/*-poster.jpg` file was optimized **in place**.

## What was done to every JPG

1. **Metadata check** — every JPG in `images/` and `videos/` was checked for embedded GPS/EXIF location data with `magick identify`. **None had GPS metadata** (the client-supplied estate photos were already clean). Every file was still run through `magick -strip` to remove all EXIF/IPTC/XMP metadata defensively.
2. **Compression** — files over 150KB were re-encoded at quality 82 with 4:2:0 chroma subsampling (no visible quality loss at web display sizes); smaller files were stripped only. This cut the `images/` folder from ~12MB to ~9.9MB.
3. **WebP siblings** — a `.webp` version (quality 80) was generated next to every `.jpg`. Every `<img>` tag referencing a JPG with a WebP sibling was wrapped in `<picture><source type="image/webp">…</picture>`, so modern browsers fetch the smaller WebP and everything else falls back to the JPG automatically. This does **not** apply to CSS `background-image` heroes (browser support for CSS `image-set()` fallbacks is inconsistent) — those still load the JPG directly, and the homepage and estate-page hero images are preloaded with `<link rel="preload" as="image">` to protect LCP.
4. **Originals** — the pre-optimization originals are recoverable from git history (the commit before this rebuild branch). No separate "originals" folder was added to the repo since this is a flat static site with no build/output split — adding one would just publish a second, larger copy of every photo on the live host.

## Estate photo privacy review

- No GPS/EXIF data found (see above).
- No street address, owner name, or exact location appears in any filename, alt text, or caption.
- `hero-5.jpg` (used only on the pre-existing homepage carousel, not reused anywhere in this rebuild) shows a legible **"Cheney Brothers National Historic Landmark District"** sign — a specific, named landmark. This was **flagged, not fixed**: it's a live asset outside this rebuild's page set. See the final report for a recommendation.
- Two of the truck photos (`gallery-truck-2-poster.jpg`, `gallery-truck-3-poster.jpg`) already had a redaction bar over part of the frame from before this project — left as-is.
- No license plates were legible at the resolution these images are displayed on the site.

## Images in active use

| File | Optimized? | Used on | Alt text (representative) |
|---|---|---|---|
| `images/gallery-estate-aerial.jpg` | stripped, recompressed, WebP | Homepage hero (preloaded), Commercial, Estate case study, Projects | "Aerial view of a large private estate with expansive striped lawn and circular drive" |
| `images/hero-8.jpg` | stripped, recompressed, WebP | Estate page hero (preloaded), homepage estate feature | "Wide front lawn with even mowing stripes leading to a large brick and stone manor home" |
| `images/gallery-garden-fountain.jpg` | stripped, recompressed, WebP | Homepage estate feature, Estate case study, Landscape Renovations, Projects | "Formal garden with a stone fountain, statuary, and manicured hedges" |
| `images/hero-6.jpg` | stripped, recompressed, WebP | Homepage (Grading card), Estate gallery | "Evenly striped estate lawn with mature trees under a blue sky" |
| `images/hero-7.jpg` | stripped, recompressed, WebP | Homepage (Estate card), Services, Walkways & Hardscapes | "Large stone and shingle home with a manicured, striped lawn" |
| `images/hero-1.jpg` | stripped, recompressed, WebP | Drainage & Grading, Grounds Maintenance, Homepage, Projects | "Evenly mowed, well-drained lawn behind a large home" |
| `images/hero-2.jpg` | stripped, recompressed, WebP | Grounds Maintenance (hero), Services | "Striped lawn maintenance behind a fenced residential yard" |
| `images/hero-3.jpg` | stripped, recompressed, WebP | Commercial, Homepage, Projects, Seasonal Cleanups | "Clean, evenly mowed residential lawn" |
| `images/hero-4.jpg` | stripped, recompressed, WebP | Projects, Seasonal Cleanups | "Cleared lawn edge along a wooded property line" |
| `images/about-hero-bg.jpg` | stripped, WebP | About (hero background) | "Blue Back Landscaping property at work" |
| `images/services-hero-bg.jpg` | stripped, recompressed, WebP | Services (hero background) | "Maintained lawn and trees" |
| `images/service-drainage.jpg` | stripped, WebP | Drainage & Grading, Homepage, Projects, Services | "French drain trench lined with fabric and gravel during a drainage installation" |
| `images/service-grading-hardscaping.jpg` | stripped, WebP | Drainage & Grading, Homepage, Projects, Services, Walkways & Hardscapes | "Stone steps and river-rock drainage border installed at a residential entrance" |
| `images/service-seasonal-decor.jpg` | stripped, WebP | Homepage, Landscape Renovations, Projects, Services | "Home entrance with newly installed seasonal plantings and clean bed edging" |
| `images/service-seasonal-maintenance.jpg` | stripped, WebP | Homepage, Landscape Renovations, Projects, Seasonal Cleanups, Services | "Newly mulched planting bed with fresh edging around a shade tree" |
| `images/service-snow-management.jpg` | stripped, WebP | Commercial, Projects, Services, Snow & Ice Management (hero) | "Truck with plow clearing a driveway after a winter storm" |
| `images/logo.png` | unchanged (transparency) | Header/footer on every page | "Blue Back Landscaping logo mark" |
| `images/logo-full.png` | unchanged (transparency) | About | "Blue Back Landscaping full company logo" |
| `videos/gallery-estate-aerial... (drone/truck posters)` | stripped, recompressed, WebP | Homepage, Estate page, Commercial, Projects | See individual `alt` text per page |
| `videos/hero-video-poster.jpg` | stripped, WebP | Estate page gallery | "Aerial view of a hedge-lined formal garden path" |
| `images/social-preview.jpg` | stripped | `og:image`/`twitter:image` fallback on every page | n/a (meta only) |

## Images no longer referenced

These were real (non-stock) assets on the previous site but didn't fit the new page set. They were **not deleted** — they remain in `images/` for future use:

- `images/why-background.jpg` — real work photo, duplicate framing of `hero-2.jpg`.
- `images/service-shrub-maintenance.jpg` — real work photo, not needed once card assignments were finalized.

## Stock photos removed from active use

Per the "no stock photos when real photos are available" rule, these three **generic stock images** (no Blue Back branding, not real company work) were identified and removed from the rebuilt `commercial.html`. They are still present in `images/` but are not linked from any page:

- `images/commercial-pricing.jpg` — a generic "SALE" price-tag stock photo.
- `images/commercial-site-upkeep.jpg` — generic gloved-hands-with-trash-bag stock photo.
- `images/commercial-snow.jpg` — generic red-snowblower stock photo.

They were replaced with real Blue Back assets: `hero-3.jpg` (real maintained lawn), `videos/gallery-truck-1-poster.jpg` (real branded truck), and `images/service-snow-management.jpg` (real truck-and-plow photo).

## Naming

Files were **not renamed** in this pass. The existing `hero-N.jpg` / `service-*.jpg` naming is not fully descriptive, but 20+ HTML files and this manifest already reference the current names consistently, and a rename pass touches every reference at once — worth doing as a deliberate follow-up (with a redirect-free, single-commit rename + find/replace) rather than folded into this content rebuild, where it would have added risk without a functional benefit.
