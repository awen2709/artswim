#!/usr/bin/env python3
"""Regenerates the search-data.json-derived parts of the figures/elements
page hierarchy: breadcrumb trails, the figures.html/elements.html category
cards, hub-page count/DD-range lines, and each individual page's "related
tricks" list.

Re-run this whenever search-data.json changes (a page added, removed, or
recategorized) to keep those derived sections in sync — see the
"Regeneration script" section in CLAUDE.md.

Usage:
    python scripts/sync_pages.py [--dry-run]

--dry-run prints what would change without writing any files.

One-time structural upgrades (embedding YouTube video, restructuring
element pages into the code/DD/sequence layout) are NOT re-run by this
script after the initial migration — those are one-off content upgrades,
not data that needs periodic regeneration. See upgrade_figure_page() /
upgrade_element_page(), guarded by ONE_TIME_UPGRADE below.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DRY_RUN = "--dry-run" in sys.argv

# Only re-run the one-time structural upgrade if explicitly requested —
# after the initial migration these pages are hand-edited like any other
# static page, per the site's no-build-system convention.
ONE_TIME_UPGRADE = "--upgrade" in sys.argv

CATEGORIES = {
    "Figures — 10U": {
        "kind": "figure", "hub_url": "figures/10u.html", "name": "10U",
        "blurb": "Figures for swimmers competing in the 10-and-under age category, focusing on foundational body positions and single rotations.",
    },
    "Figures — 12U": {
        "kind": "figure", "hub_url": "figures/12u.html", "name": "12U",
        "blurb": "Figures for the 12-and-under age category, building on 10U fundamentals with more advanced spins and transitions.",
    },
    "Figures — 13 - 15 (Youth)": {
        "kind": "figure", "hub_url": "figures/youth-13-15.html", "name": "13 - 15 (Youth)",
        "blurb": "Figures for swimmers aged 13-15, the most advanced age-group figures before senior-level competition.",
    },
    "Elements — Solo Technical": {
        "kind": "element", "hub_url": "elements/solo-technical.html", "name": "Solo Technical",
        "blurb": "Technical elements performed individually in solo routines, combining spins, twists, and continuous rotations.",
    },
    "Elements — Duet Technical": {
        "kind": "element", "hub_url": "elements/duet-technical.html", "name": "Duet Technical",
        "blurb": "Technical elements performed by two swimmers in synchrony, building on solo skills with shared timing and positioning.",
    },
    "Elements — Mixed Duet Technical": {
        "kind": "element", "hub_url": "elements/mixed-duet-technical.html", "name": "Mixed Duet Technical",
        "blurb": "Technical elements for mixed-gender duet routines, adapting duet technical requirements to partnered choreography.",
    },
    "Elements — Team Technical": {
        "kind": "element", "hub_url": "elements/junior.html", "name": "Team Technical",
        "blurb": "Technical elements for team routines, combining individual skills into larger group formations.",
    },
}

FIGURE_CATEGORY_ORDER = ["Figures — 10U", "Figures — 12U", "Figures — 13 - 15 (Youth)"]
ELEMENT_CATEGORY_ORDER = [
    "Elements — Solo Technical", "Elements — Duet Technical",
    "Elements — Mixed Duet Technical", "Elements — Team Technical",
]


def load_skills():
    with open(ROOT / "search-data.json", encoding="utf-8") as f:
        return json.load(f)


def read(path):
    return path.read_text(encoding="utf-8")


def write(path, text, original):
    if text == original:
        return False
    if not DRY_RUN:
        path.write_text(text, encoding="utf-8", newline="\n")
    return True


# ---------------------------------------------------------------------------
# href depth helper — mirrors the site's existing "../" convention
# ---------------------------------------------------------------------------

def href_from(current_dir, target_root_relative):
    """current_dir: '' for root, 'figures' or 'elements' for one level deep.
    target_root_relative: e.g. 'library.html', 'figures/10u.html'."""
    if current_dir == "":
        return target_root_relative
    prefix = current_dir + "/"
    if target_root_relative.startswith(prefix):
        return target_root_relative[len(prefix):]
    return "../" + target_root_relative


# ---------------------------------------------------------------------------
# Breadcrumbs
# ---------------------------------------------------------------------------

LEGACY_BACKLINK_RE = re.compile(
    r'[ \t]*<p><a href="[^"]+">← Back to [^<]+</a></p>\n'
)
AUTO_BREADCRUMB_RE = re.compile(
    r'[ \t]*<!-- auto:breadcrumbs -->.*?<!-- /auto:breadcrumbs -->\n',
    re.S,
)
FIRST_SECTION_OPEN_RE = re.compile(r'^([ \t]*)<section[^>]*>\n', re.M)


def breadcrumb_block(indent, segments):
    items = []
    for label, href in segments:
        if href:
            items.append(f'{indent}    <li class="breadcrumbs__item"><a href="{href}">{label}</a></li>')
        else:
            items.append(f'{indent}    <li class="breadcrumbs__item breadcrumbs__item--current" aria-current="page">{label}</li>')
    inner = "\n".join(items)
    return (
        f'{indent}<!-- auto:breadcrumbs -->\n'
        f'{indent}<nav class="breadcrumbs" aria-label="Breadcrumb">\n'
        f'{indent}  <ol class="breadcrumbs__list">\n'
        f'{inner}\n'
        f'{indent}  </ol>\n'
        f'{indent}</nav>\n'
        f'{indent}<!-- /auto:breadcrumbs -->\n'
    )


def upsert_breadcrumb_after_section_open(text, path_label, segments):
    """Removes any existing auto:breadcrumbs block and/or legacy back-link
    paragraph, then (re)inserts a freshly-built breadcrumb as the first
    child of the page's outer <section>. Anchored on the <section> open tag
    rather than <h1> deliberately: the one-time figure/element upgrade
    later wraps the <h1> in a <header>, which would shift a "before <h1>"
    anchor to a different (nested) position on re-runs and break
    idempotency — the <section> open tag's position never moves."""
    had_auto = bool(AUTO_BREADCRUMB_RE.search(text))
    had_legacy = bool(LEGACY_BACKLINK_RE.search(text))
    assert had_auto or had_legacy, f"{path_label}: no existing breadcrumb/back-link found to replace"

    text = AUTO_BREADCRUMB_RE.sub("", text, count=1)
    text = LEGACY_BACKLINK_RE.sub("", text, count=1)

    m = FIRST_SECTION_OPEN_RE.search(text)
    assert m, f"{path_label}: could not find outer <section> to place breadcrumb inside"
    indent = m.group(1) + "  "
    block = breadcrumb_block(indent, segments)
    return text[:m.end()] + block + text[m.end():]


def regen_breadcrumb_landing(path, current_label):
    text = read(path)
    segments = [("Library", href_from("", "library.html")), (current_label, None)]
    block = breadcrumb_block("    ", segments)
    if AUTO_BREADCRUMB_RE.search(text):
        new_text, n = AUTO_BREADCRUMB_RE.subn(block, text, count=1)
        assert n == 1, f"{path}: failed to replace existing breadcrumb"
    else:
        # first run: insert right after <main class="site-main"> — landing
        # pages have no back-link to strip, and .search-hero is a centered
        # flex container so the breadcrumb must stay outside it, not just
        # before its <h1>.
        anchor = '<main class="site-main">\n'
        assert anchor in text, f"{path}: could not find <main> anchor"
        new_text = text.replace(anchor, anchor + block + "\n", 1)
    return write(path, new_text, text)


def regen_breadcrumb_hub(path, category_key):
    text = read(path)
    meta = CATEGORIES[category_key]
    kind = meta["kind"]
    current_dir = "figures" if kind == "figure" else "elements"
    top_label = "Figures" if kind == "figure" else "Elements"
    top_href_root = "figures.html" if kind == "figure" else "elements.html"
    segments = [
        ("Library", href_from(current_dir, "library.html")),
        (top_label, href_from(current_dir, top_href_root)),
        (meta["name"], None),
    ]
    new_text = upsert_breadcrumb_after_section_open(text, str(path), segments)
    return write(path, new_text, text)


def regen_breadcrumb_individual(path, entry, current_dir):
    text = read(path)
    meta = CATEGORIES[entry["category"]]
    kind = meta["kind"]
    top_label = "Figures" if kind == "figure" else "Elements"
    top_href_root = "figures.html" if kind == "figure" else "elements.html"
    hub_href = href_from(current_dir, meta["hub_url"])
    current_label = current_page_label(entry, text)
    segments = [
        ("Library", href_from(current_dir, "library.html")),
        (top_label, href_from(current_dir, top_href_root)),
        (meta["name"], hub_href),
        (current_label, None),
    ]
    new_text = upsert_breadcrumb_after_section_open(text, str(path), segments)
    return write(path, new_text, text)


CODE_RE = re.compile(r'^(\d+[A-Z]?)\s*–\s*(.+)$')
DD_RE = re.compile(r'^(.*?)\s*\(DD:\s*([\d.]+)\)\s*$')
CURRENT_CODE_SPAN_RE = re.compile(r'<span class="element-header__code">([^<]+)</span>')
CURRENT_H1_CODE_RE = re.compile(r'<h1>\s*(\d+[A-Z]?)\s*–')


def parse_title(raw_title):
    """Returns (code_or_None, steps_text, dd_or_None). Note: search-data.json
    titles never include the leading code (only the page's own <h1> does),
    so this only recovers a code when called on the page's raw <h1> text."""
    rest = raw_title
    code = None
    m = CODE_RE.match(rest)
    if m:
        code, rest = m.group(1), m.group(2)
    dd = None
    m = DD_RE.match(rest)
    if m:
        rest, dd = m.group(1), m.group(2)
    return code, rest.strip(), dd


def current_element_code(page_text):
    """The skill code ("1A", "3", ...) isn't in search-data.json — recover
    it from the page itself, whether it's still in the old raw-<h1> format
    or has already been migrated to the .element-header__code span."""
    m = CURRENT_CODE_SPAN_RE.search(page_text)
    if m:
        return m.group(1)
    m = CURRENT_H1_CODE_RE.search(page_text)
    if m:
        return m.group(1)
    return None


def current_page_label(entry, page_text):
    """Short breadcrumb label for an individual page: figures keep their
    plain title; elements use their skill code if present (read from the
    page itself), else the first few words of the title + an ellipsis."""
    if entry["category"].startswith("Figures"):
        return entry["title"]
    code = current_element_code(page_text)
    if code:
        return code
    _code, steps_text, _dd = parse_title(entry["title"])
    words = steps_text.split()
    short = " ".join(words[:3])
    return short + ("…" if len(words) > 3 else "")


# ---------------------------------------------------------------------------
# figures.html / elements.html category-card regeneration
# ---------------------------------------------------------------------------

RIPPLE_DEFS = (
    '  <!-- Ripple-ring icon sprite, reused via <use> on every category card below -->\n'
    '  <svg class="pool-sprites" aria-hidden="true" focusable="false">\n'
    '    <defs>\n'
    '      <g id="ripple-rings">\n'
    '        <circle class="r1" cx="50" cy="50" r="14"></circle>\n'
    '        <circle class="r2" cx="50" cy="50" r="14"></circle>\n'
    '        <circle class="r3" cx="50" cy="50" r="14"></circle>\n'
    '      </g>\n'
    '    </defs>\n'
    '  </svg>\n'
)

GRID_RE = re.compile(r'[ \t]*<div class="grid">.*?</div>\n', re.S)
AUTO_GRID_RE = re.compile(
    r'[ \t]*<!-- auto:category-grid -->.*?<!-- /auto:category-grid -->\n', re.S
)


def category_card_html(category_key, skills):
    meta = CATEGORIES[category_key]
    entries = [s for s in skills if s["category"] == category_key]
    unit = "figures" if meta["kind"] == "figure" else "elements"
    items = [
        f'                  <li><a href="{e["url"]}">{e["title"]}</a></li>'
        for e in entries
    ]
    return (
        '        <div class="category-card reveal">\n'
        f'          <a class="category-card__clip" href="{meta["hub_url"]}">\n'
        '            <div class="category-card__face">\n'
        '              <svg class="category-card__icon ripple-icon" viewBox="0 0 100 100"><use href="#ripple-rings"></use></svg>\n'
        f'              <span class="category-card__title">{meta["name"]}</span>\n'
        f'              <span class="category-card__count">{len(entries)} {unit}</span>\n'
        '            </div>\n'
        '          </a>\n'
        '          <ul class="category-card__list">\n'
        f'            <li class="category-card__list-header"><a href="{meta["hub_url"]}">{meta["name"]}</a></li>\n'
        + "\n".join(items) + "\n"
        '          </ul>\n'
        '        </div>\n'
    )


def regen_category_landing(path, category_order, skills):
    text = read(path)
    cards = "".join(category_card_html(key, skills) for key in category_order)
    block = (
        '        <!-- auto:category-grid -->\n'
        '        <div class="category-grid">\n'
        f'{cards}'
        '        </div>\n'
        '        <!-- /auto:category-grid -->\n'
    )

    if AUTO_GRID_RE.search(text):
        new_text, n = AUTO_GRID_RE.subn(block, text, count=1)
        assert n == 1, f"{path}: failed to replace existing category-grid"
    else:
        m = GRID_RE.search(text)
        assert m, f"{path}: could not find .grid block to replace"
        new_text = GRID_RE.sub(block, text, count=1)
        # add heading + sprite defs on first run
        new_text = new_text.replace(
            '<section class="library-links reveal">\n',
            '<section class="library-links reveal">\n          <h2>Browse by category</h2>\n',
            1,
        )
        if 'id="ripple-rings"' not in new_text:
            anchor = '  <header class="site-header" role="banner">'
            assert anchor in new_text, f"{path}: could not find header anchor for sprite defs"
            new_text = new_text.replace(anchor, RIPPLE_DEFS + anchor, 1)

    changed = write(path, new_text, text)

    # verification
    result_text = read(path) if not DRY_RUN and changed else new_text
    card_count = result_text.count('class="category-card reveal"')
    assert card_count == len(category_order), f"{path}: expected {len(category_order)} cards, found {card_count}"
    return changed


# ---------------------------------------------------------------------------
# Hub page meta line (count + DD range)
# ---------------------------------------------------------------------------

AUTO_HUBMETA_RE = re.compile(
    r'[ \t]*<!-- auto:hub-meta -->.*?<!-- /auto:hub-meta -->\n', re.S
)


def hub_meta_html(category_key, skills, indent="      "):
    meta = CATEGORIES[category_key]
    entries = [s for s in skills if s["category"] == category_key]
    unit = "figures" if meta["kind"] == "figure" else "elements"
    text = f"{len(entries)} {unit} in this category"
    if meta["kind"] == "element":
        dds = []
        for e in entries:
            _c, _s, dd = parse_title(e["title"])
            if dd:
                dds.append(float(dd))
        if dds:
            text += f" · DD {min(dds):g}–{max(dds):g}"
    return (
        f'{indent}<!-- auto:hub-meta -->\n'
        f'{indent}<p class="hub-intro__meta">{text}</p>\n'
        f'{indent}<!-- /auto:hub-meta -->\n'
    )


INTRO_PARAGRAPH_RE = re.compile(r'<p>(Skill list for[^<]*)</p>')


def regen_hub_meta(path, category_key, skills):
    text = read(path)
    meta = CATEGORIES[category_key]

    # Append the descriptive blurb to the existing intro sentence, once.
    if meta["blurb"] not in text:
        m = INTRO_PARAGRAPH_RE.search(text)
        assert m, f"{path}: could not find intro paragraph for blurb insertion"
        text = INTRO_PARAGRAPH_RE.sub(
            lambda mm: f'<p>{mm.group(1)} {meta["blurb"]}</p>', text, count=1
        )

    block = hub_meta_html(category_key, skills)
    if AUTO_HUBMETA_RE.search(text):
        new_text, n = AUTO_HUBMETA_RE.subn(block, text, count=1)
        assert n == 1, f"{path}: failed to replace existing hub-meta"
    else:
        m = INTRO_PARAGRAPH_RE.search(text)
        assert m, f"{path}: could not find intro paragraph anchor for hub-meta"
        insert_at = m.end()  # right after the </p> this regex already includes
        new_text = text[:insert_at] + "\n" + block.rstrip("\n") + text[insert_at:]
    return write(path, new_text, text)


# ---------------------------------------------------------------------------
# Related tricks (all 55 individual pages)
# ---------------------------------------------------------------------------

AUTO_RELATED_RE = re.compile(
    r'[ \t]*<!-- auto:related-tricks -->.*?<!-- /auto:related-tricks -->\n', re.S
)
MAX_RELATED = 4


def related_tricks_html(entry, skills, indent="        "):
    meta = CATEGORIES[entry["category"]]
    siblings = [s for s in skills if s["category"] == entry["category"] and s["url"] != entry["url"]]
    siblings = siblings[:MAX_RELATED]
    items = "\n".join(
        f'{indent}    <li><a href="{Path(s["url"]).name}">{s["title"]}</a></li>'
        for s in siblings
    )
    return (
        f'{indent}<!-- auto:related-tricks -->\n'
        f'{indent}<div class="related-tricks">\n'
        f'{indent}  <h3>More in {meta["name"]}</h3>\n'
        f'{indent}  <ul class="skill-list">\n'
        f'{items}\n'
        f'{indent}  </ul>\n'
        f'{indent}</div>\n'
        f'{indent}<!-- /auto:related-tricks -->\n'
    )


def regen_related_tricks(path, entry, skills):
    """Only meaningful after upgrade_figure_page/upgrade_element_page have
    run at least once (they create the initial auto:related-tricks block
    themselves, computed from the same function, so this is what keeps that
    list current on later re-runs as search-data.json changes)."""
    text = read(path)
    if not AUTO_RELATED_RE.search(text):
        return False  # not upgraded yet; upgrade_*_page will create it
    block = related_tricks_html(entry, skills)
    new_text, n = AUTO_RELATED_RE.subn(block, text, count=1)
    assert n == 1, f"{path}: failed to replace existing related-tricks"
    return write(path, new_text, text)


# ---------------------------------------------------------------------------
# One-time structural upgrades (figure media embed, element sequence layout)
# ---------------------------------------------------------------------------

MEDIA_LINKS_BLOCK_RE = re.compile(r'( *)<div class="media-links">.*?</div>\n', re.S)
MEDIA_LI_ITEM_RE = re.compile(r'<li><a href="([^"]+)"[^>]*>([^<]+)</a></li>')
YOUTUBE_URL_RE = re.compile(r'^https://www\.youtube\.com/watch\?v=([\w-]+)$')
VIDEO_ID_RE = re.compile(r'^[\w-]{6,}$')


def upgrade_figure_page(path, entry, skills):
    """Not every figure page has both an Instagram and a YouTube link (3 of
    26 only have Instagram) — embed a YouTube video when one exists, but
    never require it, and always keep every original link verbatim in the
    fallback list regardless of platform."""
    original = read(path)
    if "media-links__fallback" in original:
        return False  # already upgraded

    m = MEDIA_LINKS_BLOCK_RE.search(original)
    assert m, f"{path}: could not find .media-links block"
    indent = m.group(1)
    block_text = m.group(0)

    items = MEDIA_LI_ITEM_RE.findall(block_text)  # [(href, label), ...]
    assert items, f"{path}: no media links found in .media-links"

    video_id = None
    for href, _label in items:
        ytm = YOUTUBE_URL_RE.match(href)
        if ytm:
            video_id = ytm.group(1)
            break
    if video_id:
        assert VIDEO_ID_RE.match(video_id), f"{path}: suspicious YouTube video id {video_id!r}"

    embed_html = ""
    if video_id:
        embed_html = (
            f'{indent}  <div class="media-embed">\n'
            f'{indent}    <div class="media-embed__video">\n'
            f'{indent}      <iframe src="https://www.youtube.com/embed/{video_id}" title="YouTube — {entry["title"]}" loading="lazy" allowfullscreen></iframe>\n'
            f'{indent}    </div>\n'
            f'{indent}  </div>\n'
        )

    fallback_items = "\n".join(
        f'{indent}    <li><a href="{href}" target="_blank" rel="noopener noreferrer">{label}</a></li>'
        for href, label in items
    )

    related_block = related_tricks_html(entry, skills, indent=indent)

    new_block = (
        f'{indent}<div class="media-links">\n'
        f'{indent}  <h3>Related media</h3>\n'
        f'{embed_html}'
        f'{indent}  <ul class="media-links__fallback">\n'
        f'{fallback_items}\n'
        f'{indent}  </ul>\n'
        f'{indent}</div>\n'
        f'{related_block}'
    )

    new_text = original[:m.start()] + new_block + original[m.end():]

    # losslessness check: every original link must survive verbatim
    for href, _label in items:
        assert href in new_text, f"{path}: media URL {href!r} lost during upgrade"

    return write(path, new_text, original)


SECTION_H1_RE = re.compile(r'[ \t]*<h1>(.*?)</h1>\n', re.S)
COMING_SOON_RE = re.compile(
    r'[ \t]*<p>Skill details and information coming soon\.</p>\n'
)


def upgrade_element_page(path, entry, skills):
    original = read(path)
    if "element-split" in original:
        return False  # already upgraded

    assert "<section>\n" in original, f"{path}: expected a bare <section> to upgrade"
    text = original.replace("<section>\n", '<section class="element-split">\n', 1)

    m = SECTION_H1_RE.search(text)
    assert m, f"{path}: could not find <h1>"
    raw_title = m.group(1)
    code, steps_text, dd = parse_title(raw_title)
    steps = [s.strip() for s in steps_text.split(" – ") if s.strip()]
    assert steps, f"{path}: title parsing produced no steps from {raw_title!r}"

    # losslessness check: reconstructing the original title from the parsed
    # parts must reproduce it exactly, proving nothing was dropped
    rebuilt = steps_text
    if dd:
        rebuilt = f"{rebuilt} (DD: {dd})"
    if code:
        rebuilt = f"{code} – {rebuilt}"
    assert rebuilt == raw_title, f"{path}: lossy title parse: {raw_title!r} -> {rebuilt!r}"

    meta_block = ""
    if code or dd:
        spans = []
        if code:
            spans.append(f'          <span class="element-header__code">{code}</span>')
        if dd:
            spans.append(f'          <span class="element-header__dd">DD {dd}</span>')
        meta_block = (
            '        <p class="element-header__meta">\n'
            + "\n".join(spans) + "\n"
            '        </p>\n'
        )

    new_header = (
        '      <header class="element-header">\n'
        f'        <h1>{steps_text}</h1>\n'
        f'{meta_block}'
        '      </header>\n'
    )
    text = SECTION_H1_RE.sub(lambda _m: new_header, text, count=1)

    seq_items = "\n".join(f'          <li>{s}</li>' for s in steps)
    sequence_block = (
        '      <div class="element-sequence">\n'
        '        <h2>Movement sequence</h2>\n'
        '        <ol class="element-sequence__list">\n'
        f'{seq_items}\n'
        '        </ol>\n'
        '      </div>\n'
    )

    related_block = related_tricks_html(entry, skills, indent="        ")

    body_block = (
        '      <div class="element-body">\n'
        '        <div class="tips">\n'
        '          <h2>Tips &amp; Ticks</h2>\n'
        '          <p class="placeholder">Tips placeholder — add coaching points, common mistakes, and cues here.</p>\n'
        '        </div>\n'
        '        <div class="media-links">\n'
        '          <h3>Related media</h3>\n'
        '          <p class="media-links__empty">No media linked yet for this element.</p>\n'
        '        </div>\n'
        f'{related_block}'
        '      </div>\n'
    )

    m2 = COMING_SOON_RE.search(text)
    assert m2, f"{path}: could not find the 'coming soon' paragraph to replace"
    text = text[:m2.start()] + sequence_block + body_block + text[m2.end():]

    return write(path, text, original)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    skills = load_skills()
    assert len(skills) == 54, f"expected 54 search-data.json entries, found {len(skills)}"
    fig_count = sum(1 for s in skills if s["category"].startswith("Figures"))
    elem_count = sum(1 for s in skills if s["category"].startswith("Elements"))
    assert fig_count == 26 and elem_count == 28, f"unexpected split: {fig_count} figures, {elem_count} elements"

    changed_files = []

    # 1. Landing pages
    if regen_breadcrumb_landing(ROOT / "figures.html", "Figures"):
        changed_files.append("figures.html (breadcrumb)")
    if regen_breadcrumb_landing(ROOT / "elements.html", "Elements"):
        changed_files.append("elements.html (breadcrumb)")
    if regen_category_landing(ROOT / "figures.html", FIGURE_CATEGORY_ORDER, skills):
        changed_files.append("figures.html (category grid)")
    if regen_category_landing(ROOT / "elements.html", ELEMENT_CATEGORY_ORDER, skills):
        changed_files.append("elements.html (category grid)")

    # 2. Hub pages
    for category_key, meta in CATEGORIES.items():
        path = ROOT / meta["hub_url"]
        if regen_breadcrumb_hub(path, category_key):
            changed_files.append(f"{meta['hub_url']} (breadcrumb)")
        if regen_hub_meta(path, category_key, skills):
            changed_files.append(f"{meta['hub_url']} (hub meta)")

    # 3. Individual pages
    for entry in skills:
        path = ROOT / entry["url"]
        current_dir = Path(entry["url"]).parent.name
        is_figure = entry["category"].startswith("Figures")

        if regen_breadcrumb_individual(path, entry, current_dir):
            changed_files.append(f"{entry['url']} (breadcrumb)")

        if is_figure:
            if upgrade_figure_page(path, entry, skills):
                changed_files.append(f"{entry['url']} (media embed + layout upgrade)")
        else:
            if upgrade_element_page(path, entry, skills):
                changed_files.append(f"{entry['url']} (sequence + layout upgrade)")

        if regen_related_tricks(path, entry, skills):
            changed_files.append(f"{entry['url']} (related tricks)")

    label = "Would change" if DRY_RUN else "Changed"
    print(f"{label} {len(changed_files)} file-sections:")
    for c in changed_files:
        print(" -", c)


if __name__ == "__main__":
    main()
