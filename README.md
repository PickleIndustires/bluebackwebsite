# Blue Back Landscaping LLC — Website

Static marketing website for **Blue Back Landscaping LLC**, a landscape improvement, estate grounds management, and commercial property care company serving West Hartford and Greater Hartford, CT.

Live site: [bluebacklandscaping.com](https://www.bluebacklandscaping.com/)

---

## Pages

| File | URL | Description |
|------|-----|-------------|
| `index.html` | `/` | Homepage — estate hero, positioning, estate feature, project proof, process, commercial, service area |
| `services.html` | `/services.html` | Services hub — links out to every service page |
| `drainage-grading.html` | `/drainage-grading.html` | Drainage & grading |
| `landscape-renovations.html` | `/landscape-renovations.html` | Landscape renovations & planting |
| `walkways-hardscapes.html` | `/walkways-hardscapes.html` | Walkways & hardscapes |
| `seasonal-cleanups.html` | `/seasonal-cleanups.html` | Seasonal cleanups |
| `grounds-maintenance.html` | `/grounds-maintenance.html` | Recurring grounds maintenance |
| `snow-ice-management.html` | `/snow-ice-management.html` | Commercial snow & ice management |
| `estate-grounds-management.html` | `/estate-grounds-management.html` | Flagship estate grounds management page |
| `commercial.html` | `/commercial.html` | Commercial & HOA services + inquiry form |
| `projects.html` | `/projects.html` | Project/property portfolio |
| `about.html` | `/about.html` | Company background & team |
| `contact.html` | `/contact.html` | Project consultation request form |
| `thank-you.html` | `/thank-you.html` | Post-submission confirmation (noindex) |
| `404.html` | `/404.html` | Custom not-found page |
| `privacy-policy.html` | `/privacy-policy.html` | Privacy Policy |
| `accessibility.html` | `/accessibility.html` | Accessibility Statement (WCAG 2.1 AA) |
| `terms.html` | `/terms.html` | Terms & Conditions |

See `CONTENT-GUIDE.md` for how to edit projects, testimonials, the seasonal banner, hero images, team members, service areas, form destinations, and metadata. See `ANALYTICS-SETUP.md` for the analytics event model and how to turn on GA4. See `IMAGE-MANIFEST.md` for image sourcing/optimization notes.

## Tech Stack

- Plain HTML5, CSS3, vanilla JavaScript — no build step, no frameworks
- WCAG 2.1 AA accessible (skip link, ARIA landmarks, keyboard nav, focus styles, accessible dropdown/accordion/lightbox)
- Responsive down to 320px, with a sticky mobile call/consultation bar
- `dataLayer`-based analytics event hooks, ready for a GA4 tag (none installed yet — see `ANALYTICS-SETUP.md`)
- Forms work today via a documented `mailto:` fallback and upgrade automatically once a real form endpoint is configured (see `CONTENT-GUIDE.md`)

## Project Structure

```
bluebackwebsite/
├── index.html, services.html, drainage-grading.html, landscape-renovations.html,
│   walkways-hardscapes.html, seasonal-cleanups.html, grounds-maintenance.html,
│   snow-ice-management.html, estate-grounds-management.html, commercial.html,
│   projects.html, about.html, contact.html, thank-you.html, 404.html,
│   privacy-policy.html, accessibility.html, terms.html
├── css/
│   └── styles.css        # Design system + all component styles
├── js/
│   └── main.js           # Nav, seasonal banner, forms, analytics, gallery lightbox
├── images/                # Photos (JPG + WebP siblings) and PNG logos
├── videos/                # Hero/gallery video + poster images
├── sitemap.xml, robots.txt
├── CONTENT-GUIDE.md
├── ANALYTICS-SETUP.md
└── IMAGE-MANIFEST.md
```

## Contact

- Email: info@bluebacklandscaping.com
- Phone: (860) 735-4145
- Service area: West Hartford and Greater Hartford, CT
