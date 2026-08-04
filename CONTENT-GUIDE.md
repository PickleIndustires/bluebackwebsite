# Content Guide

This site is plain static HTML — no CMS, no build step. Every `.html` file is deployed as-is. Header, footer, mobile nav, the seasonal banner, and form behavior are shared through `css/styles.css` and `js/main.js`, but page **content** lives directly in each HTML file. This guide covers the common edits.

## How to add a project (to `projects.html` or the homepage "Recent Landscape Work")

Each project is a `<article class="project-card" data-category="SLUG">` block:

```html
<article class="project-card" data-category="drainage">
  <img src="images/your-photo.jpg" alt="Specific, descriptive alt text" loading="lazy" width="400" height="200" />
  <div class="project-card-body">
    <span class="project-card-cat">Drainage</span>
    <h3>Short Project Title</h3>
    <p class="project-card-meta">General scope description, town if approved</p>
    <a class="project-card-link" href="drainage-grading.html">View Related Service &rarr;</a>
  </div>
</article>
```

Copy this block into the `.project-grid` on `projects.html` (or the homepage). `data-category` must match one of the filter button slugs at the top of `projects.html` (`estate-grounds`, `drainage`, `grading`, `landscape-renovations`, `walkways`, `commercial`, `seasonal`) or the filter buttons won't pick it up — the card will still always be visible, filtering is progressive enhancement only.

**Do not invent project values, client names, or specific addresses.** Use general town names only when the client has approved disclosing them.

## How to add a testimonial

No real, verified reviews were available in the repository when this site was built, so the homepage "What Clients Say" section intentionally does not display any review quotes — see the HTML comment in `index.html` right above that section.

Once the business owner supplies real, verifiable reviews (screenshot or direct export from Google/Facebook), replace the "What Clients Say" paragraph and Facebook link in `index.html` with a `.reviews-grid` containing 2–3 cards in this format:

```html
<div class="reviews-grid">
  <article class="review-card">
    <div class="review-stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
    <p class="review-quote">"Exact quote text, unedited."</p>
    <p class="review-author">First name, Last initial</p>
    <p class="review-source">Google Review</p>
  </article>
</div>
```

Never rewrite a review's wording or invent one — only paste verified quotes.

## How to change the seasonal banner

Everything is controlled from **one place**: the `SEASONAL_BANNER` object near the top of `js/main.js`:

```js
var SEASONAL_BANNER = {
  enabled: true,
  id: 'fall-2026-cleanup',
  message: 'Fall project and seasonal cleanup scheduling is now underway.',
  ctaText: 'Discuss Fall Work',
  ctaHref: 'seasonal-cleanups.html'
};
```

- Set `enabled: false` to turn the banner off everywhere at once.
- Change `message`, `ctaText`, `ctaHref` for a new season.
- **Always change `id` when you change the message** — visitors who dismissed a previous banner won't see the new one unless the `id` is different (dismissal is remembered per `id` in `localStorage`).
- This one edit updates the banner on every page — no per-page changes needed.

## How to replace hero images

- **Homepage hero**: `index.html`, the `.static-hero` section — change the `background-image: url('...')` inline style, and update the matching `<link rel="preload" as="image" href="...">` in the `<head>` to the new file so it stays the LCP-optimized image.
- **Estate page hero**: same pattern in `estate-grounds-management.html`.
- **Interior page heroes**: look for `.page-hero-bg` and change its `background-image` URL.
- If the new photo is a JPG, also generate a WebP sibling (`cwebp -q 80 photo.jpg -o photo.webp`) and, if it's used as an `<img>` tag elsewhere on the page, wrap it in `<picture>` the same way the rest of the site does (see any `<picture>` block for the pattern). CSS background-image heroes don't need `<picture>`.

## How to update team members

Team cards live in `about.html` inside `.team-grid`:

```html
<article class="team-card" aria-labelledby="member-slug">
  <div class="team-avatar" aria-hidden="true">XY</div>
  <h3 class="team-name" id="member-slug">Full Name</h3>
  <p class="team-role">Role / Title</p>
</article>
```

Only list people currently with the company. If a real photo becomes available, replace the `.team-avatar` initials `<div>` with an `<img>` (add `loading="lazy"`, a real width/height, and descriptive alt text) — don't generate a fake portrait.

## How to update service areas

The town list appears in three places and must be kept in sync:

1. `js` — no JS involved, it's static HTML.
2. Footer `.footer-areas-list` (every page, identical markup).
3. Homepage "Serving West Hartford and Greater Hartford" section (`.area-list`).
4. The `areaServed` array inside every page's `LandscapingBusiness` JSON-LD block in `<head>`.

Only add a town Blue Back actually services. Don't create a dedicated page per town — that's deliberately avoided per the site's SEO approach (thin/duplicate city pages hurt more than they help).

## How to change form destinations

Both forms (`contact.html` and `commercial.html`) are wired through one shared handler in `js/main.js`. Near the top:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/meeyybkv';
```

This currently points at a Formspree form. Formspree emails a submission to whoever owns that form ID — to change where submissions go, either update the notification email address in the Formspree dashboard for that form, or replace this with a different endpoint entirely (another Formspree form, Netlify Forms, a custom serverless function, etc.) — the fetch/JSON handling in `js/main.js` doesn't need to change as long as the new endpoint accepts a `POST` with `FormData` and returns a 2xx status on success.

If `FORM_ENDPOINT` is ever reset to the literal string `'REPLACE_WITH_FORM_ENDPOINT'`, submitting either form falls back to opening a pre-filled `mailto:` to `info@bluebacklandscaping.com` instead of silently failing — see `ANALYTICS-SETUP.md`'s form section for that behavior.

**First-submission note:** Formspree requires the form owner to confirm the very first real submission (via a confirmation email) before the form activates. Send a real test submission once and check the inbox tied to that Formspree account.

Both forms also submit a hidden `_gotcha` field (Formspree's built-in honeypot convention — filled-in submissions are silently discarded server-side, in addition to the client-side check already in `js/main.js`) and a hidden `_subject` field so notification emails arrive with a clear subject line per form.

## How to update metadata (title / description / OG / canonical)

Every page's `<head>` has the same block near the top:

```html
<meta name="description" content="..." />
<title>...</title>
...
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://bluebacklandscaping.com/PAGE.html" />
<link rel="canonical" href="https://bluebacklandscaping.com/PAGE.html" />
```

Update `<title>`, `description`, `og:title`, `og:description`, and their Twitter equivalents together — they should all stay consistent, and `og:url`/`canonical` must always be the exact live URL of that page (no trailing slash variance, no `www.` vs bare-domain mismatch — this site's canonical form is `https://bluebacklandscaping.com/...`).

If you add a brand-new page, also add it to `sitemap.xml` and, if it's part of primary navigation, to the shared nav markup (currently duplicated at the top of every page — see the "Technical debt" note below).

## Technical debt worth knowing about

The header and footer are duplicated verbatim across all 18 HTML files (this matches how the site worked before this rebuild — no build step, no templating). A page-generation script used to build this rebuild consistently lives outside the repo (it was an authoring tool only, not a runtime dependency). If the site ever needs a global nav change again across many pages at once, consider introducing a minimal static-site generator (e.g., 11ty) at that point — not before, since it's not needed for the current page count and would be a bigger change than this rebuild's scope.
