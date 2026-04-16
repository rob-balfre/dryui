# Layout Extraction From Screenshots, Images, and Live Webpages

**Date:** 2026-04-16
**Scope:** Work published or updated between January 1, 2026 and April 16, 2026, plus late-2025 adjacent work, on extracting page shells, design systems, or responsive signals from screenshots, images, video, or live webpages.

Companion note: [Webpage Structure Extraction: Grayscale Shell Pipeline](./webpage-structure-extraction-shell-pipeline.md)

## Executive Summary

- 2026 has real movement, but it is not a solved product category.
- Token extraction is now relatively common. Explainable layout-shell extraction and reliable breakpoint inference are still thin.
- The strongest product signals are `Stitch`, `Replay`, `dembrandt`, and browser-native token extractors.
- The strongest research signals are `ScreenParse`, `UIPress`, `FocusUI`, `VisRefiner`, `LaTCoder`, `ScreenCoder`, `Screen2AX`, and `ReDeFix`.
- DryUI’s clearest wedge is a **hybrid DOM + vision pipeline** that emits a compact grid schema, breakpoint hints, and agent-friendly design metadata rather than trying to clone full HTML in one step.

## What Exists Now

### Product And Tool Landscape

| Project / tool             | Exact date                                    | Input                                            | Output                                                                                | What it really gives you                                                                                                                                | Why it matters for DryUI                                                                              |
| -------------------------- | --------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Stitch**                 | **2026-03-18**                                | Prompt, image, code context, project context     | High-fidelity UI, interactive prototypes, design-system import/export via `DESIGN.md` | Strongest mainstream signal that the market wants "reference in, scaffold out" workflows, not just codegen                                              | Useful benchmark for agent-friendly design metadata and fast structural scaffolding                   |
| **Replay**                 | **2026-02-25**                                | Multi-device video capture of a UI               | React code, design system, component library, breakpoint extraction claims            | Interesting because it uses temporal context rather than a single screenshot; still mostly vendor-claimed                                               | Reinforces that breakpoint inference is easier from **width sweeps/video** than from one static image |
| **Design Token Extractor** | **Updated 2026-04-08**                        | Live webpage in Chrome                           | Colors, spacing, typography, exports to JSON, CSS vars, TypeScript, Tailwind          | Good baseline for DOM/computed-style token mining; not a layout-shell tool                                                                              | Confirms tokens are the commodity layer now                                                           |
| **dembrandt**              | **Created 2025-11-22**, **pushed 2026-04-11** | URL, multi-page crawl, mobile/dark-mode sampling | Tokens, component styles, breakpoints, icons, frameworks, `DESIGN.md`, DTCG export    | Clearest direct precedent for extracting **breakpoints** alongside tokens                                                                               | Best current signal that responsive extraction is a real product need, not just a research idea       |
| **Design Extractor**       | **Live as of 2026-04-16**                     | Public URL                                       | Structured `DESIGN.md` for AI coding agents                                           | Strong signal around markdown-based design transfer, weak on explicit structure and breakpoints                                                         | Relevant if DryUI wants a repo-native artifact rather than an opaque binary export                    |
| **Screenshot to Layout**   | **2025-09-30**                                | Screenshot to Figma plugin workflow              | Layout extraction attempt, then public shutdown note                                  | Best cautionary tale in the space: OCR/document APIs were not enough, and the author says early LLM-based layout extraction was too slow and unreliable | Important reminder that page-shell extraction is still the hard part                                  |

### Technical And Research Signals

| Paper / project             | Exact date     | Core signal                                                                                                                      | Why it matters for DryUI                                                                               |
| --------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **UIPress**                 | **2026-04-10** | Learns to compress UI screenshots from thousands of visual tokens to a small fixed budget while improving UI-to-code performance | Useful if DryUI wants screenshot analysis without paying full-image inference cost every time          |
| **VisRefiner**              | **2026-02-05** | Trains screenshot-to-code systems to improve by comparing rendered output with the target design                                 | Strong precedent for a render-and-compare refinement loop instead of one-shot extraction               |
| **ScreenParse / ScreenVLM** | **2026-02-15** | Dense screen parsing dataset and model for web screenshots with millions of UI elements                                          | Probably the best current source for learning page-shell structure, region grouping, and layout priors |
| **FocusUI**                 | **2026-01-07** | Efficient UI grounding with position-preserving visual token selection                                                           | Relevant because preserving spatial continuity is exactly what column and gutter inference need        |
| **LaTCoder**                | **2025-08-05** | Splits webpage designs into image blocks, generates code per block, then assembles                                               | Strong precedent for hierarchical layout reasoning instead of monolithic screenshot-to-code            |
| **ScreenCoder**             | **2025-07-30** | Decomposes visual-to-code into grounding, planning, and generation agents                                                        | Supports a pipeline architecture rather than a single giant model                                      |
| **Screen2AX**               | **2025-07-22** | Builds hierarchical accessibility trees from a single screenshot                                                                 | Very close to the structural-tree problem DryUI actually cares about                                   |
| **ReDeFix**                 | **2025-11-01** | Repairs responsive layout failures with RAG over CSS knowledge                                                                   | Useful on the breakpoint-repair side even though it is not a breakpoint-discovery system               |

## What The Field Still Does Not Solve

- No verified 2025-2026 system cleanly solves `single screenshot -> stable layout shell -> explicit breakpoint rules` end to end.
- Most product surfaces stop at colors, typography, spacing, and component styling.
- Most research papers optimize for render fidelity or code correctness, not explainable grid grammar.
- Breakpoint inference is usually either a vendor claim or a post-hoc repair problem.
- Screenshot-only systems still struggle with nested hierarchy, hidden content, sticky regions, and responsive topology changes.

## Implications For DryUI

DryUI should not compete on raw token scraping. That layer is already filling up.

The stronger wedge is:

1. Accept a screenshot, design image, video, or live URL.
2. Recover a **layout shell** rather than a full HTML clone.
3. Infer **columns, gutters, section bands, and breakpoint events**.
4. Export the result as:
   - a compact JSON layout schema
   - `DESIGN.md`-style design metadata
   - a DryUI-ready scaffold using grid rules and container queries

This aligns with DryUI’s constraints better than generic screenshot-to-code products because DryUI cares about:

- grid truth over pixel truth
- explainable structure over opaque generation
- container-query breakpoints over arbitrary media-query cargo culting
- reusable shell scaffolds over one-off copied pages

## Suggested DryUI Experiments

1. **Grayscale shelling**
   Strip screenshots down to structure by OCR-masking text, saliency-masking media, and recomputing edges on the residual image.

2. **Whitespace-first segmentation**
   Treat horizontal and vertical low-density bands as first-class signals for section boundaries, gutters, and card decks.

3. **Multi-width signature extraction**
   Run the extractor at `375`, `768`, `1024`, and `1440` widths and compare structural deltas instead of guessing breakpoints from one image.

4. **DOM + vision box reconciliation**
   When a live page exists, use DOM and accessibility boxes as the first structural hypothesis and let the screenshot correct it.

5. **Grid fitting by minimum complexity**
   Fit candidate track systems and prefer the smallest grid that explains the page with the fewest irregular spans.

6. **Shell-first output**
   Emit a normalized shell artifact before any code generation step:
   - regions
   - hierarchy
   - columns
   - gutters
   - breakpoint events
   - confidence scores

## Recommended Direction

The most pragmatic next step is not a full product. It is a research prototype with one clear success condition:

> Can DryUI turn a screenshot or live page into a scaffold that is good enough to start implementation without manually rebuilding the entire grid from scratch?

If the answer is yes often enough, the rest of the pipeline can stay modular:

- token extraction
- shell extraction
- breakpoint detection
- DryUI scaffold generation
- optional code refinement

That architecture is much more defensible than trying to beat the field on generic screenshot-to-code.

## Sources

### Products And Tools

- Stitch: https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/
- Replay breakpoint post: https://www.replay.build/blog/stop-guessing-media-queries-automating-responsive-layout-breakpoints-with-replay
- Design Token Extractor: https://chromewebstore.google.com/detail/design-token-extractor/iibemocnockckccgcihcmjkciicfoclh
- dembrandt: https://github.com/dembrandt/dembrandt
- Design Extractor: https://www.design-extractor.com/
- Screenshot to Layout shutdown note: https://johanronsse.be/2025/09/30/closing-down-screenshot-to-layout/

### Research

- UIPress: https://arxiv.org/abs/2604.09442
- VisRefiner: https://arxiv.org/abs/2602.05998
- ScreenParse / ScreenVLM: https://arxiv.org/abs/2602.14276
- FocusUI: https://arxiv.org/abs/2601.03928
- LaTCoder: https://arxiv.org/abs/2508.03560
- ScreenCoder: https://arxiv.org/abs/2507.22827
- Screen2AX: https://arxiv.org/abs/2507.16704
- ReDeFix: https://arxiv.org/abs/2511.00678
