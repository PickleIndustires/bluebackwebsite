# Analytics Setup

## What was found

No GA4, Universal Analytics, or Google Tag Manager was present on the site before this rebuild — no `gtag.js`, no `dataLayer`, no GTM container. `privacy-policy.html` explicitly stated "Our website does not use tracking cookies or third-party analytics services at this time," which is still accurate after this rebuild: **no analytics is currently sending data anywhere.**

## What was added

A `dataLayer`-based event queue in `js/main.js` (top of the file). It is safe with no tag installed — `window.dataLayer.push()` just appends to an in-memory array that nothing reads yet. No network requests are made, no cookies are set, nothing changes about the site's current "no tracking" status until a GA4 tag is installed.

### Events wired up

| Event | Fires when | Extra params |
|---|---|---|
| `phone_click` | Any `tel:` link is clicked, anywhere on the site (nav, footer, mobile bar, inline) | `cta_location` |
| `email_click` | Any `mailto:` link is clicked | `cta_location` |
| `project_consultation_click` | "Request a Project/Consultation" CTAs (header, hero, footer bar, final CTA, etc.) | `cta_location` |
| `commercial_site_walk_click` | "Request a Commercial Site Walk" CTAs | `cta_location` |
| `quote_form_start` | First interaction with any field in the consultation or commercial form | `form_id` |
| `quote_form_submit` | Successful form submission (either via a real endpoint, once configured, or the current `mailto:` fallback) | `form_id`, `submit_method` |
| `drainage_page_cta` | Drainage & Grading CTAs, incl. the "Learn More" link on the homepage Drainage card | `cta_location` |
| `estate_page_cta` | Estate Grounds Management CTAs | `cta_location` |
| `commercial_page_cta` | Commercial page CTAs (secondary "View Commercial Capabilities" style links) | `cta_location` |

Every event also automatically includes `page_path` (`window.location.pathname`). `cta_location` values are short strings like `home_hero`, `header`, `mobile_bar`, `drainage_final_cta` — grep `data-analytics-location` in the HTML for the full list.

### What is deliberately **not** sent

Per the project's privacy rules, form field values (name, email, phone, project description, property address) are **never** pushed to `dataLayer`. Only the fact that a form was started/submitted and which form is sent — no PII.

## Where to add the GA4 ID

Nowhere yet — on purpose. Adding a fake or placeholder GA4 ID would make the site *look* like it's tracking when it isn't, which the project rules explicitly forbid. To turn analytics on for real:

1. Create (or get access to) a GA4 property and note its Measurement ID (`G-XXXXXXXXXX`).
2. In every page's `<head>`, right after the `<link rel="canonical" ...>` line, add the standard GA4 snippet:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
   (Because `js/main.js` already initializes `window.dataLayer`, order doesn't matter — whichever script runs first creates the array, the other reuses it.)
3. Since all 18 HTML files share this pattern, the fastest safe way to do this across the whole site is a single find-and-replace of the canonical `<link>` line pattern, once, with your real Measurement ID baked in — not a manual per-file edit that risks a typo on one page.
4. Everything in the table above becomes a real, importable GA4 event automatically — no code changes needed, because the events are already firing into `dataLayer`.

## How to verify events after the GA4 tag is added

1. Open the site with `?debug_mode=1` (or use the GA4 DebugView with the [Google Analytics Debugger extension](https://chromewebstore.google.com/) enabled).
2. In GA4, go to **Admin → DebugView**.
3. Click a phone number, submit a test form, click a CTA button — confirm each event listed above appears in DebugView with the expected `cta_location`/`form_id` parameter.
4. Alternatively, open the browser console on any page and run `window.dataLayer` after clicking around — you'll see the raw pushed events even before GA4 is wired up.

## Which events to import as Google Ads conversions

Once GA4 is live and these events are flowing, mark the following as **Key Events** in GA4 (Admin → Events → toggle "Mark as key event"), then import them into Google Ads as conversions:

- `project_consultation_click` (primary residential/project conversion)
- `commercial_site_walk_click` (primary commercial conversion)
- `quote_form_submit` (form completion — the strongest signal of the group)
- `phone_click` (secondary/assist conversion — many local-service customers call instead of filling out a form)

Treat `quote_form_start`, `drainage_page_cta`, `estate_page_cta`, `commercial_page_cta`, and `email_click` as **engagement signals for audience-building and page-level analysis**, not primary conversions — importing every micro-interaction as a conversion tends to dilute Smart Bidding signal quality in Google Ads.

## Form backend note

Both forms now POST to a Formspree endpoint (`https://formspree.io/f/meeyybkv`) configured in `js/main.js` — see `CONTENT-GUIDE.md` → "How to change form destinations." `quote_form_submit`'s `submit_method` parameter reads `endpoint` on a real Formspree submission, or `mailto_fallback` if `FORM_ENDPOINT` is ever reset to the placeholder string. That's a useful GA4 secondary dimension to check while diagnosing whether the real backend is live.
