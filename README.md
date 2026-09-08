# Paradise Matrix

Corporate website for **Paradise Matrix Pte. Ltd.**, a Singapore company building and
commercialising agentic AI for organisations that must account for what their systems do.

Static HTML. No build step, no dependencies, no third-party requests at runtime.
Served by GitHub Pages from the repository root.

## Structure

```
index.html            Home
who-we-are.html       Company, story, market, principles, partners
what-we-do.html       Cybersecurity, education and fintech domains, go-to-market
realrelay.html        Platform capabilities, architecture, deployment, governance
newsroom.html         Updates and media contacts
careers.html          Why join, open roles, hiring process
contact.html          Enquiry form and contact routes
assets/css/site.css   Design system (single stylesheet)
assets/js/site.js     Navigation, scroll reveals, counters, forms
assets/fonts/         Self-hosted Instrument Serif and Archivo (woff2, OFL)
assets/img/           Photography, partner logos and the Open Graph card
llms.txt              Plain-text site summary for language models
robots.txt            Crawler policy
sitemap.xml           Generated on each build
```

Each page is self-contained. Header and footer markup is duplicated across the seven
pages, so navigation and footer edits must be applied to all of them.

## Design system

The layout and typographic grammar follows the institutional-investor convention: a
12-column grid inset by one column, 120px section rhythm, flat surfaces with hairline
rules, serif statements against a grotesque for everything else, and alternating white,
off-white and deep brand bands. There are no cards, pills, shadows or gradients on
components.

Colour is the only thing drawn from the CWG palette. Tokens live in one `:root` block at
the top of `assets/css/site.css`; nothing else references a raw colour, so the site
re-skins from that block alone.

| Token | Value | Role |
| --- | --- | --- |
| `--deep` | `#002060` | Dominant brand colour: dark bands, statements, buttons |
| `--deep-ink` | `#001233` | Deepest ground, footer |
| `--accent` | `#ce00a5` | Labels, links, rules, arrows |
| `--logo-ink` / `--logo-pink` | `#002060` / `#dd00b0` | Logo artwork only |
| `--wash-*` | raw RGB channels | Hero photography wash, so it re-tints with the palette |
| `--offwhite` | `#f2f2f2` | Alternating section band |
| `--ink` / `--grey` | `#101010` / `#676767` | Body text |
| `--rule` | `#e0e0e0` | Hairlines |

Type: **Instrument Serif** for statements, **Archivo** for everything else. Both are
self-hosted in `assets/fonts/` (latin and latin-ext subsets, ~150KB total).

Scale: statements 52 / 38 / 31 / 24px, body 17.5px, lede 19px, supporting copy 15.5px,
labels 12.5px. Sized for sustained reading rather than for the smallest defensible text.

## SEO and generative-engine discovery

- Per-page `<title>`, meta description, canonical, Open Graph and Twitter card tags,
  generated in `build.py` so they cannot drift from the page list.
- JSON-LD `@graph` on every page: `Organization`, `WebSite`, `WebPage`, and
  `BreadcrumbList` on inner pages. The platform page adds `SoftwareApplication`; the home
  page adds `FAQPage`.
- The visible FAQ on the home page is generated from the same `FAQ` list that produces the
  `FAQPage` schema, so the markup and the structured data always match. Edit `FAQ` in
  `build.py`, never the rendered HTML.
- `sitemap.xml` is regenerated with the build date on every run.
- `robots.txt` explicitly admits the major AI and search crawlers.
- `llms.txt` gives language models a plain-text summary of the company, the platform, the
  domains, the ecosystem and the limits the company states about itself.
- `assets/img/og-card.png` (1200×630) is the social preview image.

## Local preview

```sh
python3 -m http.server 8000
# http://127.0.0.1:8000
```

## Notes

- Contact and subscribe forms are static and open the visitor's mail client. Point them
  at a form backend if server-side handling is wanted.
- Partner logos in `assets/img/` are third-party marks used to identify the companies
  they belong to.
- `.nojekyll` stops GitHub Pages running the files through Jekyll.
