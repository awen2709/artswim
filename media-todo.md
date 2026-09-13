# Media backfill — remaining gaps

This is the deliverable from a best-effort media search pass (see the homepage redesign work). Everything embedded directly into a page HTML was a high-confidence match — exact or near-exact name match, usually from the same "Artistic Swimming Figures" YouTube channel already used throughout the site (Swim England's official figure/element demonstration series), sometimes corroborated by the element's own code (e.g. "2B", "4A") or DD value.

Everything listed below was **not** confidently matched, so nothing was embedded — either no candidate was found, or a candidate existed but didn't clearly cover the whole named skill. Status column explains which.

## What got embedded this pass (for reference — not part of the backlog)

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

## Figures

| Skill | File | Needed | Status |
|---|---|---|---|
| Blossom Walkout | `figures/blossom-walkout.html` | video | Candidate found but incomplete: "Blossom \| Artistic Swimming Figures" — https://www.youtube.com/watch?v=HxGgAPUgizk — only demonstrates the "Blossom" half of the name; no video found covering the "Walkout" continuation as one clip. Needs manual verification before embedding, or search for a coach's combined demo specifically titled "Blossom Walkout". |

### Figures with video but no still image (11)

These already have a working YouTube embed; only the image panel is empty. A screenshot/frame-grab from the existing video, or an official figure description-sheet scan (matching the style of the `assets/*.png` files already in the repo), would fill the gap. No image search was run for these this pass — flagged here per the plan's lower-priority ranking.

| Skill | File | Suggested search |
|---|---|---|
| Ballet Leg Single | `figures/ballet-leg-single.html` | "ballet leg single figure description sheet" |
| Barracuda | `figures/barracuda-12u.html` | "barracuda figure description sheet artistic swimming" |
| Barracuda | `figures/barracuda.html` | (same as above) |
| Front Ariana | `figures/front-ariana.html` | "front ariana figure description sheet" |
| Kip | `figures/kip.html` | "kip figure description sheet artistic swimming" |
| Neptunus | `figures/neptunus.html` | "neptunus figure description sheet" |
| Swanita Spinning 180° | `figures/swanita-spinning-180.html` | "swanita spinning figure description sheet" |
| Swordfish | `figures/swordfish.html` | "swordfish figure description sheet artistic swimming" |
| Tower | `figures/tower.html` | "tower figure description sheet artistic swimming" |
| Water Drop | `figures/water-drop.html` | "water drop figure description sheet artistic swimming" |
| Straight Ballet Leg | `figures/straight-ballet-leg.html` | "straight ballet leg figure description sheet" |

## Elements (18 of 28 remaining)

| Skill | File | Needed | Status |
|---|---|---|---|
| Beginning from a Ballet Leg Position – Flamingo Bent Knee rollback – Join to VP – Half Twist – 360° Open to Split – Walkout | `elements/ballet-leg-flamingo.html` | video | None found — long compound sequence, no single matching demo located. |
| Combined Spin 1080° – Continuous Spin 1080° | `elements/combined-spin-1080.html` | video | Solo Element 2A (DD 3.0) confirmed by name via text sources; the channel's video for this slot ("Solo element 2A") was not found — only its 2B sibling (already embedded on `combined-spin-720.html`) turned up. |
| Fishtail – Continuous Spin 720° | `elements/fishtail-continuous-spin.html` | video | Identified as "Solo Element 4B" by description, but no direct YouTube link found under that title. |
| Fishtail – Knight – Continuous Spin 1080° | `elements/fishtail-knight-duet-1080.html` | video | Duet Element 4A (DD 3.2) confirmed by name; only its 4B sibling (already embedded on `fishtail-knight-duet-720.html`) had a locatable video. |
| Front Pike – Vertical 180° Rotation – 1/2 Twist to Bent Knee – Continuous Spin 720° | `elements/front-pike-vertical-180.html` | video | Not searched this pass — deprioritized behind Team Technical sweep. Try "front pike vertical 180 artistic swimming figures youtube". |
| Front Pike – Vertical 360° Rotation – Full Twist to Bent Knee – Continuous Spin 720° | `elements/front-pike-vertical-360.html` | video | Not searched this pass. Try "front pike vertical 360 artistic swimming figures youtube". |
| Manta Ray Half Twist | `elements/manta-ray-half-twist.html` | video | Searched — official text description found (Mixed Duet Technical Required Element), no matching video located. |
| Rocket Split Alternating Legs – Spinning 180° | `elements/rocket-split-alternating.html` | video | Not searched this pass. Try "rocket split alternating legs spinning 180 artistic swimming". |
| Rocket Split Bent Knee | `elements/rocket-split-bent-knee.html` | video | Not searched this pass. |
| Rocket Split – Spinning 180° | `elements/rocket-split-duet.html` | video | Not searched this pass. |
| Rocket Split Bent Knee Joining 360° | `elements/rocket-split-joining.html` | video | Not searched this pass. |
| Rocket Split Twirl | `elements/rocket-split-twirl-mixed.html` | video | Not searched this pass. |
| Rocket Split Twirl Spin 180° | `elements/rocket-split-twirl-spin.html` | video | Not searched this pass. |
| Thrust Bent Knee Twirl Spin 360° | `elements/thrust-bent-knee-twirl-spin.html` | video | Not searched this pass. |
| Thrust Bent Knee Twirl | `elements/thrust-bent-knee-twirl.html` | video | Not searched this pass. |
| Thrust Continuous Spin 360° | `elements/thrust-continuous-spin-360.html` | video | Not searched this pass. |
| Thrust Continuous Spin 720° | `elements/thrust-continuous-spin-720.html` | video | Not searched this pass. |
| Walkover Back Closing 360° – Continuous Spin 1080° | `elements/walkover-back-closing-duet-360.html` | video | Duet Element 1A (DD 3.0) confirmed by name; only its 1B sibling (already embedded on `walkover-back-closing-duet-180.html`) had a locatable video. |

The "Artistic Swimming Figures" YouTube channel (Swim England's official series) is the single best lead for the untried rows above — it systematically covers "Team/Duet/Solo element N" for most of this catalog's names, so the same search pattern used for the embedded set (`"<element name>" "Artistic Swimming Figures" youtube`) is worth running on the remaining rows before trying anything else.
