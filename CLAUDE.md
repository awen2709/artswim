# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"Sway" is a static HTML/CSS/JS site cataloguing artistic swimming figures and elements by age/discipline category. There is no build system, package manager, or test suite — it's plain HTML files with one shared `style.css` and one shared `script.js`, meant to be opened directly or served as static files (e.g. `python -m http.server` from the repo root).

## Site structure

- `index.html`, `library.html`, `search.html`, `figures.html`, `elements.html`, `contact.html` — top-level pages, root-relative links (`style.css`, `figures/...`).
- `figures/` — one hub page per age category (`10u.html`, `12u.html`, `youth-13-15.html`) plus one page per individual figure.
- `elements/` — one hub page per discipline category (`solo-technical.html`, `duet-technical.html`, `mixed-duet-technical.html`, `junior.html` = Team Technical) plus one page per individual element.
- `assets/` — placeholder images for a handful of figures, named after the figure (e.g. `Saturn.png`, `Venus.png`). Most figure/element pages do not yet have a real image.
- `search-data.json` — hand-maintained flat index (`title`, `url`, `category`) of every figure/element page, powering both the header/hero autocomplete and the `search.html` results page. **Any new or renamed skill page must be added/updated here too**, or it won't be searchable.
- `script.js` — vanilla JS, no framework, no modules. Independent IIFEs, each a no-op if its target element is missing: scroll-reveal via `IntersectionObserver`; the mobile `.nav-toggle` hamburger (toggles `.nav--open` + `aria-expanded`, closes on link click); making the header `Library ▾` button itself navigate; header scroll-state toggling; a shared `fetch('search-data.json')` loader (paths in the index are root-relative, so code running from inside `figures/`/`elements/` prefixes `../`); an autocomplete dropdown that attaches to every `.search-form__field` (currently only the library/search hero search bars — the compact header `nav-search` box uses a different class and does *not* get autocomplete, it only full-submits to `search.html`) and shows up to 6 matches; the `search.html`-only results-page renderer (reads `?q=`); the `library.html`-only media-strip drag (single rAF loop owns the track's transform so drag and idle auto-drift never fight over it); and (index.html only) the pool water simulation described below. Every page includes `[../]script.js` now (see header note below), so none of this can assume it's running on a "special" page — always check for the target element.
- `.github/workflows/deploy.yaml` — deploys the repo root straight to GitHub Pages on every push to `master` (no build step). `.github/copilot-instructions.md` exists but is stale (it describes an old layout where `index.html` lived under `.github/workflows/`; ignore its file-location claims).

## Header — identical on every page, at two path depths

Every page in the site — top-level pages, the 7 category hub pages, and every individual figure/element page — shares **one** header markup: brand link, mobile `.nav-toggle` hamburger, `nav#site-nav`, the `Library ▾` mega-menu dropdown (`<li class="dropdown dropdown--mega">` → `<div class="dropdown__mega">` with a `.dropdown__col` per Figures/Elements), a Contact link, and the `nav-search` box (submits to `search.html`). Every page also includes `<script src="[../]script.js" defer>` right before `</body>` (needed for the hamburger, the dropdown-button-click-to-`library.html` fallback, and — on pages that have `.reveal` elements — the scroll-reveal). The only difference between pages is path depth:
- **Root-level pages** (`index.html`, `library.html`, `search.html`, `figures.html`, `elements.html`, `contact.html`) use bare relative hrefs (`figures/10u.html`, `contact.html`, `search.html`, …).
- **Everything under `figures/` and `elements/`** (both the 7 category hubs and every individual skill page) uses the identical markup with every href/`action` prefixed `../` (`../figures/10u.html`, `../contact.html`, `../search.html`, …).

When adding a new page, copy the header verbatim from an existing sibling **at the same depth** — don't hand-roll it, and don't copy a root-level header into `figures/`/`elements/` (or vice versa) without redoing every `../` prefix. This wasn't always one template — root pages, category hubs, and individual pages each used to have their own divergent header (a flat single-column dropdown, no mobile toggle, no search box, or a bare Home/Library/Contact nav with no dropdown at all) until they were synchronized into the single mega-menu version described above.

The footer follows the same two-depth pattern and was synchronized the same way: every page now uses the full three-column `.site-footer__cols` footer (brand/tagline, Explore links, Contact link — with `.reveal` on each column), root-relative on root pages and `../`-prefixed everywhere under `figures/`/`elements/`. It used to be a bare `<p>© Sway</p>` everywhere except `index.html`/`library.html`/`search.html`.

**Known-fixed bug, worth remembering the shape of:** `.dropdown__col .dropdown__menu` (the actual link list nested inside each mega-menu column) needs its own explicit `opacity:1;visibility:visible;pointer-events:auto` in `style.css`. The base `.dropdown__menu` rule defaults those to `0`/`hidden`, and the reveal rule (`.dropdown:hover > .dropdown__menu`) only matches a *direct child* of `.dropdown` — a menu nested inside `.dropdown__mega > .dropdown__col` doesn't qualify, so without that override the mega panel opens as a blank white box (headings visible, links invisible). If the dropdown ever regresses to a "white square" again, check that override first.

### Figure hub card grid (`figures/10u.html`, `figures/12u.html`, `figures/youth-13-15.html`)

These three were redesigned from a plain `<ul class="skill-list">` into an animated `.figure-grid` of `.figure-card` links. Each page inlines its own copy of a 7-pose swimmer SVG sprite sheet (`<svg class="pool-sprites"><defs><g id="swim-star">…</g>…</defs></svg>` — same pose set as `index.html`'s pool background) and each card is either:
- an `<img>` thumbnail (only where a real asset exists in `assets/` — currently 9 of the 12 `youth-13-15.html` figures), or
- an inline `<svg class="figure-card__icon"><use href="#swim-…"></use></svg>` fallback (10U and 12U have no real assets yet, so every card there uses a pose icon).

Card color/animation-delay variety comes from `nth-child` CSS rules in `style.css` (`.figure-grid > .figure-card:nth-child(4n+1)` etc.), not per-card inline styles — adding/removing cards shifts which rule each one gets, which is fine (it's just visual variety, not meaningful state). Because these pages use `.reveal`, they **must** keep the `../script.js` include (now present on every page, see the header note above) or every card silently stays invisible (`.reveal` starts at `opacity:0` until the `IntersectionObserver` in `script.js` adds `.is-visible`).
`elements/*.html` hubs still use the old plain `skill-list` and haven't been redone this way.

Within individual skill pages there are two content layouts:
- **Figure pages**: use the `.figure-split` layout — a top image area (`.figure-image`, either a literal "Image placeholder" div or an `<img>` from `assets/`) and a bottom `.tips` + `.media-links` split (coaching tips placeholder + Instagram/YouTube links). All 26 figure pages follow this layout.
- **Element pages**: currently all just a heading (title includes the DD — difficulty — value in parens, e.g. `(DD: 2.7)`) and a "Skill details and information coming soon" placeholder — no image/tips/media sections yet.

All internal links from within `figures/*.html` and `elements/*.html` use `../` to reach root assets (`../style.css`, `../index.html`).

## Pool background system

- `index.html` has a full interactive water simulation: `<canvas id="pool-water">` inside `#pool-bg`, driven entirely by the last IIFE in `script.js` (classic two-buffer ripple/wave algorithm, procedural caustic + tile-grid floor texture with real refraction displacement, cursor and right-click splashes). It's the only page with this canvas.
- Every *other* page gets a matching but static, non-interactive ambient version for free: `body::before` in `style.css` paints a quieter tile-grid + corner vignette using pure CSS, no JS, no markup changes needed on any page. On `index.html` this same `body::before` still exists but is fully hidden — it's the first thing painted inside `body`, so the opaque canvas (a later, real DOM child) always paints over it.
- Swimmer pose SVGs (`swim-star`, `swim-streamline`, `swim-ballet`, `swim-tuck`, `swim-split`, `swim-flamingo`, `swim-vertical`) are defined inline per-page wherever they're used (`index.html`'s `.pool-bg`, and the `figures/10u.html`/`12u.html`/`youth-13-15.html` card grids) — there's no shared sprite file, so keep copies in sync if a pose changes.

## Adding a new figure or element page

1. Copy the closest existing sibling page in `figures/` or `elements/` (matching layout — figure-split vs. plain placeholder) as a starting template, not a hub page.
2. Link it from the relevant category hub page. For `elements/*.html` hubs this is a `<li>` in the `skill-list`; for the three `figures/*.html` hubs it's a new `.figure-card` in the `.figure-grid` (copy an existing card — see the card-grid pattern above for the image-vs-icon rule).
3. Add a matching entry to `search-data.json` (`title`, `url` relative to repo root, `category` matching the hub's display name, e.g. `"Figures — 10U"`).
4. If it's a figure with real artwork, drop the image in `assets/` and use it as the card's `<img>` (figure hubs) and/or swap the individual page's `.figure-image` placeholder div for an `<img>` (see `figures/saturn.html` for the pattern).
