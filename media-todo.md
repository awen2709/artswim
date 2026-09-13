# Media backfill — remaining gaps

This is the deliverable from a best-effort media search pass (see the homepage redesign work). Everything embedded directly into a page HTML was a high-confidence match — exact or near-exact name match, usually from the same "Artistic Swimming Figures" YouTube channel already used throughout the site (Swim England's official figure/element demonstration series), sometimes corroborated by the element's own code (e.g. "2B", "4A") or DD value.

Everything listed below was **not** confidently matched, so nothing was embedded — either no candidate was found, or a candidate existed but didn't clearly cover the whole named skill. Status column explains which.

## What got embedded/added across all passes (for reference — not part of the backlog)

Video embeds:
- `figures/kipnus.html` — YouTube `0t25UK_885o` ("SwimRVA Artistic Swimming KIPNUS")
- `figures/surface-prawn.html` — YouTube `mzQY6oPvIU4` ("FINA 12&Under Group 1 Figure - Surface Prawn")
- `elements/butterfly-hybrid.html` — YouTube `35Bu04Ijj_0`
- `elements/two-fouette-rotations.html` — YouTube `QKHlRBSdiiE`
- `elements/flying-fish-hybrid-spinning.html` — YouTube `cFAdbUkorFw`
- `elements/vertical-full-twist.html` — YouTube `oVuipt2OXxs`
- `elements/rocket-split-twirl-hybrid.html` — YouTube `wZ-_K6bXpdE`
- `elements/combined-spin-720.html` — YouTube `Zii-D8ImbmE`
- `elements/fishtail-knight-duet-720.html` — YouTube `0AodvkHYCfc`
- `elements/fishtail-half-twist.html` — YouTube `Xwyp_0L3Y3k`
- `elements/walkover-back-closing-duet-180.html` — YouTube `aE8wNOVBzZA`
- `elements/swordfish-knight-solo.html` — YouTube `yQ1CpBrkmOw`

Still images added from the official World Aquatics Figures Manual (see below for the full story): `figures/ballet-leg-single.html`, `figures/barracuda.html`, `figures/barracuda-12u.html`, `figures/front-ariana.html`, `figures/kip.html`, `figures/neptunus.html`, `figures/swanita-spinning-180.html`, `figures/swordfish.html`, `figures/tower.html`, `figures/water-drop.html`, `figures/straight-ballet-leg.html`, `figures/blossom-walkout.html`.

## Figures — still images: RESOLVED

The 11-figure still-image gap below is now closed. The actual fix: the official **World Aquatics (FINA) Artistic Swimming Figures Manual 2022-2025** (`resources.fina.org/fina/document/2023/01/12/38c73e1c-6dfa-4919-bf64-328e4260aff8/Figures-Manual-2022-2025-ALL.pdf`, 477 pages, publicly downloadable) contains an official diagram+scoring-table sheet for every compulsory figure — including every one of these. It was downloaded, searched page-by-page for each figure's exact "Figure – ### NAME" header (via PyMuPDF, installed for this purpose), the matching page rendered to PNG (cropping out any adjacent unrelated figure sharing the page), and saved into `assets/`. Confirmed correct in every case by cross-checking the figure number/difficulty against the existing YouTube video's own on-screen title card (e.g. Kip's video literally reads "Kip (Fig 311 DD 1.6)," matching the extracted sheet exactly).

| Skill | File | Asset added |
|---|---|---|
| Ballet Leg Single | `figures/ballet-leg-single.html` | `assets/Ballet Leg Single.png` (Figure 101) |
| Barracuda | `figures/barracuda-12u.html`, `figures/barracuda.html` | `assets/Barracuda.png` (Figure 301, shared by both pages) |
| Front Ariana | `figures/front-ariana.html` | `assets/Front Ariana.png` (Figure 359) |
| Kip | `figures/kip.html` | `assets/Kip.png` (Figure 311) |
| Neptunus | `figures/neptunus.html` | `assets/Neptunus.png` (Figure 344) |
| Swanita Spinning 180° | `figures/swanita-spinning-180.html` | `assets/Swanita Spinning 180.png` (Figure 227, "Swanita" in the manual) |
| Swordfish | `figures/swordfish.html` | `assets/Swordfish.png` (Figure 401) |
| Tower | `figures/tower.html` | `assets/Tower.png` (Figure 348 — not to be confused with the manual's separate "Eiffel Tower" Fig 125 or "Hightower" Fig 410) |
| Water Drop | `figures/water-drop.html` | `assets/Water Drop.png` (Figure 363) |
| Straight Ballet Leg | `figures/straight-ballet-leg.html` | `assets/Straight Ballet Leg.png` (Figure 106) |

**Bonus:** this also gave `figures/blossom-walkout.html` a real image (`assets/Blossom.png`, Figure 302 "Blossom") where it previously had neither video nor image. One honest caveat: the manual's official "Blossom" figure ends in a plain Vertical Descent — the "Walkout" half of this page's name isn't a distinct figure in the manual at all. Searching Front Ariana's own official description confirms why: it separately ends with "A Walkout Front is executed," i.e. "Walkout Front" is Basic Movement 6a, a generic exit used across many different figures, not a standalone figure with its own sheet. So this image covers the "Blossom" portion only — same partial-match caveat as the video candidate below.

| Skill | File | Needed | Status |
|---|---|---|---|
| Blossom Walkout | `figures/blossom-walkout.html` | video | Still open. Candidate found but incomplete: "Blossom \| Artistic Swimming Figures" — https://www.youtube.com/watch?v=HxGgAPUgizk — only demonstrates the "Blossom" half of the name; no video found covering the "Walkout" continuation as one clip (consistent with "Walkout Front" being a generic exit movement, not its own figure — see above). |

## Elements — still images: RESOLVED for 16 of the 18 that had no video

None of these had a matching YouTube video from the "Artistic Swimming Figures" channel (the earlier search notes for each are preserved in git history if needed). But the same trick that closed the figures gap above applies here too: World Aquatics publishes an official, compact **Technical Required Elements sheet** per category — `2024_AQUA_TRE_SHEETS_v2.pdf` (`resources.fina.org/fina/document/2024/01/30/ea4f5385-fef5-4a27-96a9-1b6a73e75846/2024_AQUA_TRE_SHEETS_v2.pdf`, 8 pages: Solo/Duet/Mixed Duet/Team, "As per AS rules released 1 January 2024") — with a small diagram + DD + full description for every lettered element variant (1A/1B, 2A/2B, etc.). Downloaded, each element's header located precisely via PyMuPDF text-position search, cropped to its own cell (two elements share each page row), and saved into `assets/`. Every match below was confirmed against this site's own already-recorded DD and/or element code (e.g. this page's "2A" badge matching the sheet's "2A" cell) — not just the name.

| Skill | File | Asset added |
|---|---|---|
| Combined Spin 1080° – Continuous Spin 1080° | `elements/combined-spin-1080.html` | `assets/Combined Spin 1080.png` (Solo 2A, DD 3.0) **+ video**: a follow-up precise-wording search (using the sheet's exact name) turned up YouTube `2dlEX_MDA78`, titled exactly "Combined Spin 1080° – Continuous Spin 1080° - Solo Technical Required Element (TRE)" — now embedded too |
| Fishtail – Continuous Spin 720° | `elements/fishtail-continuous-spin.html` | `assets/Fishtail Continuous Spin 720.png` (Solo 4B, DD 2.6) |
| Rocket Split Bent Knee Joining 360° | `elements/rocket-split-joining.html` | `assets/Rocket Split Bent Knee Joining 360.png` (Solo 5A, DD 2.4) |
| Rocket Split Bent Knee | `elements/rocket-split-bent-knee.html` | `assets/Rocket Split Bent Knee.png` (Solo 5B, DD 2.1) |
| Thrust Continuous Spin 720° | `elements/thrust-continuous-spin-720.html` | `assets/Thrust Continuous Spin 720.png` (Solo 1A, DD 2.7) |
| Walkover Back Closing 360° – Continuous Spin 1080° | `elements/walkover-back-closing-duet-360.html` | `assets/Walkover Back Closing 360 Duet.png` (Duet 1A, DD 3.0) |
| Rocket Split Alternating Legs – Spinning 180° | `elements/rocket-split-alternating.html` | `assets/Rocket Split Alternating Legs Spinning 180.png` (Duet 2A, DD 2.8) |
| Rocket Split – Spinning 180° | `elements/rocket-split-duet.html` | `assets/Rocket Split Spinning 180 Duet.png` (Duet 2B, DD 2.4) |
| Fishtail – Knight – Continuous Spin 1080° | `elements/fishtail-knight-duet-1080.html` | `assets/Fishtail Knight Continuous Spin 1080.png` (Duet 4A, DD 3.2) |
| Thrust Bent Knee Twirl Spin 360° | `elements/thrust-bent-knee-twirl-spin.html` | `assets/Thrust Bent Knee Twirl Spin 360.png` (Duet 5A, DD 2.3) |
| Thrust Bent Knee Twirl | `elements/thrust-bent-knee-twirl.html` | `assets/Thrust Bent Knee Twirl.png` (Duet 5B, DD 2.1) |
| Rocket Split Twirl Spin 180° | `elements/rocket-split-twirl-spin.html` | `assets/Rocket Split Twirl Spin 180.png` (Mixed Duet 1A, DD 2.7) |
| Rocket Split Twirl | `elements/rocket-split-twirl-mixed.html` | `assets/Rocket Split Twirl.png` (Mixed Duet 1B, DD 2.5) |
| Front Pike – Vertical 360° Rotation – Full Twist to Bent Knee – Continuous Spin 720° | `elements/front-pike-vertical-360.html` | `assets/Front Pike Vertical 360.png` (Mixed Duet 2A, DD 2.4) |
| Front Pike – Vertical 180° Rotation – 1/2 Twist to Bent Knee – Continuous Spin 720° | `elements/front-pike-vertical-180.html` | `assets/Front Pike Vertical 180.png` (Mixed Duet 2B, DD 2.2) |

The same 8-page document also confirmed (with matching diagrams) all 5 Team Technical elements that already had video from the earlier YouTube pass — Flying Fish Hybrid Spinning 180° (1A), Vertical Full Twist… (2A), Two Fouetté Rotations… (3A), Butterfly Hybrid (4), Rocket Split Bent Knee Twirl Hybrid (5A) — so those were left as video-only rather than duplicating media.

**Update:** `Thrust Continuous Spin 360°` is resolved too — this page's own badges read "1B / DD 2.1," an exact code+DD match to the Solo sheet's "1B – Thrust Spinning 360° / DD 2.1," confirming it's the same element under a more generic site label. Image added (`assets/Thrust Continuous Spin 360.png`); no video found under either name.

### Still open (2 of 28)

| Skill | File | Status |
|---|---|---|
| Beginning from a Ballet Leg Position – Flamingo Bent Knee rollback – Join to VP – Half Twist – 360° Open to Split – Walkout | `elements/ballet-leg-flamingo.html` | No match in either source. Long compound sequence; the TRE sheet's closest same-slot entries ("Flamingo Full/Half Twist Hybrid," Duet 3A/3B) describe a different, shorter movement — not this one. |
| Manta Ray Half Twist | `elements/manta-ray-half-twist.html` | No match in either source. Text descriptions from older rule-cycle sources call it a Mixed Duet Technical Required Element, but the *current* (2024) Mixed Duet sheet's slot 3 is "London Hybrid" instead — a clearly different move — so this element appears to have been superseded/renamed/dropped in the current rules edition, with no current official sheet to pull from. |

If someone wants to keep pushing on the Ballet Leg Flamingo / Manta Ray Half Twist gap specifically, the next-best lead is an older (pre-2024) rules-cycle TRE document, since Manta Ray Half Twist's text description reads as authentic but absent from the current sheet.
