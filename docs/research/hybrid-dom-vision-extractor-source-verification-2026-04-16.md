## Hybrid DOM + Vision Extractor — Source Verification

**Date:** 2026-04-16
**Scope:** Verification pass on high-stakes sources cited in the companion research notes, to check which claims hold up before anyone plans a build against them.

Companion notes:

- [Hybrid DOM + Vision Extractor Deep Dive](./hybrid-dom-vision-extractor-deep-dive-2026-04-16.md)
- [Layout Extraction From Screenshots, Images, and Live Webpages](./layout-extraction-from-screenshots-webpages-2026-04-16.md)
- [Webpage Structure Extraction: Grayscale Shell Pipeline](./webpage-structure-extraction-shell-pipeline.md)

## Method

- Verified each high-stakes source via direct fetch against claimed metadata (existence, topic, rough date, rough star count within ±20%).
- In scope: GitHub repos in the "Direct-Fit Repos" table, arxiv abstract pages for cited papers, product blog posts and vendor pages.
- Out of scope: Reddit and HN threads (already flagged as approximate in the source docs), X/social posts (same), and well-known foundational papers (Pix2Struct, Design2Code, WebSight, DCGen, BigDocs, LayoutParser).
- 26 sources checked. One-shot pass — no follow-ups on near misses beyond the note column.

## Summary

- **19 OK** — match the claim closely enough to cite as-is.
- **6 real-but-misrepresented** — the URL resolves but the doc overstates or mis-describes what is there.
- **1 unverifiable** — returned a 403.

## Results

| Source                                         | Status     | Notes                                                                                                                                                        |
| ---------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| sourjya/viewgraph                              | NASCENT    | Real, matches topic, but 0 stars and created 2026-04-08 — a prototype, not a blueprint.                                                                      |
| udayanwalvekar/clearshot                       | OK         | 125 stars matches. Structured screenshot intelligence for agents.                                                                                            |
| AmirMakir/glimpse-mcp                          | NASCENT    | Real, matches topic, but 1 star — a prototype, not a proven pattern.                                                                                         |
| memvid/design-memory                           | OK         | 121 stars matches. URL-to-design-system extraction.                                                                                                          |
| dembrandt/dembrandt                            | OK         | 1,644 stars matches. Tokens, components, DESIGN.md, DTCG.                                                                                                    |
| kalilfagundes/design-system-extractor-skill    | OK         | Real, matches topic, 5 stars.                                                                                                                                |
| abi/screenshot-to-code                         | OK         | ~72k stars matches. Baseline screenshot-to-code tool.                                                                                                        |
| nebenzu/Blip                                   | NASCENT    | Real but 7 stars and no repo description. Could not verify it does what the doc claims.                                                                      |
| arxiv 2602.14276 (ScreenParse/ScreenVLM)       | OK         | Title, 771K screenshots, and 2026-02-15 date all match.                                                                                                      |
| arxiv 2601.03928 (FocusUI)                     | OK         | Position-preserving token selection for UI grounding, 2026-01-07.                                                                                            |
| arxiv 2604.09442 (UIPress)                     | OK         | Optical token compression for UI-to-code, 2026-04-10.                                                                                                        |
| arxiv 2602.05998 (VisRefiner)                  | OK         | Visual-difference learning for screenshot-to-code, 2026-02-05.                                                                                               |
| arxiv 2603.26648 (Vision2Web)                  | OK         | Hierarchical benchmark, 2026-03-27.                                                                                                                          |
| arxiv 2511.06251 (WebVIA)                      | OK         | Interactive verifiable UI-to-code, 2025-11-09.                                                                                                               |
| arxiv 2507.16704 (Screen2AX)                   | WRONG      | Real paper, but **macOS accessibility tree generation**, not the UI-to-code structural problem the research docs imply.                                      |
| arxiv 2508.03560 (LaTCoder)                    | OK         | Block-wise layout decomposition, 2025-08-05.                                                                                                                 |
| arxiv 2507.22827 (ScreenCoder)                 | OK         | Grounding, planning, and generation agents, 2025-07-30.                                                                                                      |
| arxiv 2511.00678 (ReDeFix)                     | OK         | Responsive layout repair with RAG, 2025-11-01.                                                                                                               |
| arxiv 2505.09904 (UICopilot)                   | OK         | Hierarchical code generation, 2025-05-15.                                                                                                                    |
| arxiv 2502.16161 (OmniParser V2)               | WRONG      | Real paper, but it is a **document parsing** paper (text/tables/KIE) by a different team. Not Microsoft OmniParser V2.                                       |
| blog.google Stitch post                        | OK         | 2026-03-18, "Introducing 'vibe design' with Stitch."                                                                                                         |
| openai.com Figma partnership page              | UNVERIFIED | Returned 403. Claim is plausible but the specific URL did not resolve during this pass.                                                                      |
| replay.build breakpoint post                   | OK         | 2026-02-25, matches claim.                                                                                                                                   |
| design-extractor.com                           | OK         | Live, generates DESIGN.md from public URL.                                                                                                                   |
| stitch.withgoogle.com/docs/design-md/overview/ | WRONG      | Page exists but has no DESIGN.md-specific content. Either the doc moved or the link was wrong at write time.                                                 |
| johanronsse.be Screenshot-to-Layout            | WRONG      | Page exists, but now opens with a correction that the team **reversed course and is continuing the project**. The "shutdown postmortem" framing is outdated. |

## Material Errors To Fix

### 1. Wrong arxiv ID for OmniParser V2

**Where:** [webpage-structure-extraction-shell-pipeline.md:280](./webpage-structure-extraction-shell-pipeline.md) cites `https://arxiv.org/abs/2502.16161` as "Microsoft OmniParser V2."

**Problem:** That ID points to a document-parsing paper by a different team. The real Microsoft OmniParser V2 has a different ID that should be looked up before re-citing.

**Fix:** Either look up and substitute the correct ID, or drop the OmniParser V2 reference and lean on the original OmniParser citation only.

### 2. Screen2AX reframed incorrectly

**Where:**

- [hybrid-dom-vision-extractor-deep-dive-2026-04-16.md:96](./hybrid-dom-vision-extractor-deep-dive-2026-04-16.md) — "Builds hierarchy trees from a screenshot. Very close to DryUI's 'shell tree' problem."
- [layout-extraction-from-screenshots-webpages-2026-04-16.md:39](./layout-extraction-from-screenshots-webpages-2026-04-16.md) — "Builds hierarchical accessibility trees from a single screenshot. Very close to the structural-tree problem DryUI actually cares about."

**Problem:** The paper is about generating **macOS accessibility trees**, not web page structural trees. Adjacent but not transferable in the way the research docs imply.

**Fix:** Either remove the Screen2AX references entirely, or reframe as "accessibility-tree generation from a platform-specific screenshot — suggests the hierarchy-inference approach is tractable, but is not a direct precedent for web layout."

### 3. Screenshot-to-Layout is no longer a shutdown

**Where:** [layout-extraction-from-screenshots-webpages-2026-04-16.md:27](./layout-extraction-from-screenshots-webpages-2026-04-16.md) — "Best cautionary tale in the space."

**Problem:** The post has been updated. The team decided to continue the project, so the "shutdown postmortem" framing is wrong as of 2026-04-16.

**Fix:** Either drop the row, or re-read the current version of the post and summarize what the team is now saying about layout extraction difficulty.

### 4. OpenAI × Figma URL returns 403

**Where:** [hybrid-dom-vision-extractor-deep-dive-2026-04-16.md:81](./hybrid-dom-vision-extractor-deep-dive-2026-04-16.md)

**Problem:** The cited URL did not resolve during verification. The partnership claim may still be accurate, but the specific source cannot be used as-is.

**Fix:** Re-fetch from a different OpenAI or Figma page that confirms the partnership, or drop the row.

### 5. Stitch DESIGN.md docs page is thin

**Where:** [hybrid-dom-vision-extractor-deep-dive-2026-04-16.md:111](./hybrid-dom-vision-extractor-deep-dive-2026-04-16.md) HN row and the URL column in the supporting tables.

**Problem:** The URL resolves but does not contain the DESIGN.md-specific content the doc claims. Either the path changed or the link was always wrong.

**Fix:** Find the actual Stitch DESIGN.md documentation URL, or drop the row.

## Overstated Repo Maturity

The "Direct-Fit Repos" table in the deep-dive presents eight repos as current open-source precedents for a DryUI implementation. Three of them are single-digit-star prototypes:

- **sourjya/viewgraph** — 0 stars, created 8 days before this pass.
- **AmirMakir/glimpse-mcp** — 1 star.
- **nebenzu/Blip** — 7 stars, no repo description (could not verify the claimed functionality).

These may still turn out to be the right architectural shape, but they are currently "things one person built last week," not patterns the field has converged on. The research docs should either demote them to a separate "prototypes to watch" list, or qualify them in place.

The higher-traction repos in the same table — **dembrandt** (1,644 stars), **screenshot-to-code** (~72k), **clearshot** (125), **design-memory** (121) — all check out and can be treated as real precedents.

## What Holds Up

- **All four 2026-dated arxiv papers** (ScreenParse, FocusUI, UIPress, VisRefiner) exist and match their claimed titles, dates, and topics. This is the single most reassuring result: the 2026 research backbone of the deep-dive is real.
- **LaTCoder, ScreenCoder, ReDeFix, UICopilot, WebVIA, Vision2Web** all match as papers, dates, and topics.
- **High-traction repos** (dembrandt, screenshot-to-code, clearshot, design-memory, kalilfagundes/design-system-extractor-skill) all match.
- **Stitch launch blog post**, **Replay breakpoints post**, **design-extractor.com** all match.

## Verdict

The deep-dive's **core argument** — that the field is converging on hybrid DOM + vision pipelines with shell-first artifacts and multi-width breakpoint sweeps — is supported by sources that exist and say roughly what the research docs claim. A build plan can rely on the conclusion.

The deep-dive's **specific evidence** has enough holes that it should not be cited as-is in a build proposal. Two arxiv mis-citations (OmniParser V2, Screen2AX) are load-bearing for specific technical claims. Three "blueprint" repos are nascent and overstated. One cautionary-tale framing is outdated. One URL did not resolve. None of these individually invalidate the research, but together they mean the doc needs a patching pass before it is quoted outside DryUI.

## Action Items

1. Look up the correct Microsoft OmniParser V2 arxiv ID and replace `2502.16161` in [webpage-structure-extraction-shell-pipeline.md:280](./webpage-structure-extraction-shell-pipeline.md).
2. Remove or reframe the Screen2AX row in [hybrid-dom-vision-extractor-deep-dive-2026-04-16.md:96](./hybrid-dom-vision-extractor-deep-dive-2026-04-16.md) and [layout-extraction-from-screenshots-webpages-2026-04-16.md:39](./layout-extraction-from-screenshots-webpages-2026-04-16.md).
3. Re-read the Johan Ronsse post and rewrite the "Screenshot to Layout" row in [layout-extraction-from-screenshots-webpages-2026-04-16.md:27](./layout-extraction-from-screenshots-webpages-2026-04-16.md).
4. Re-fetch an OpenAI × Figma partnership URL that resolves, or drop the row in the deep-dive.
5. Find the current Stitch DESIGN.md docs URL, or drop the row.
6. Move `viewgraph`, `glimpse-mcp`, and `Blip` into a "prototypes to watch" subsection, or annotate them as "&lt;10 stars, included for shape, not traction."
7. Add a `Verified on 2026-04-16` footer to the three research docs so future readers know the metadata is a snapshot.
