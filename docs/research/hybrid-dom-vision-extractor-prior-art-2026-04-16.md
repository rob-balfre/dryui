# Hybrid DOM + Vision Extractor: Prior Art And Architecture Patterns

**Date:** 2026-04-16  
**Scope:** Practical prior art and implementation patterns for extracting page shells, layout trees, and breakpoint hints from live webpages, screenshots, and design images.

Companion notes:

- [Layout Extraction From Screenshots, Images, and Live Webpages](./layout-extraction-from-screenshots-webpages-2026-04-16.md)
- [Webpage Structure Extraction: Grayscale Shell Pipeline](./webpage-structure-extraction-shell-pipeline.md)

## Bottom Line

DryUI should not build a pure screenshot-to-code system. The strongest architecture pattern in 2025-2026 is a **hybrid DOM + vision extractor**:

1. Capture DOM, accessibility tree, and bounding boxes when a live page exists.
2. Use OCR, layout parsing, and whitespace segmentation to recover the shell from screenshots.
3. Reconcile DOM and vision into a merged layout tree with confidence scores.
4. Sweep multiple viewport widths to detect breakpoint events from topology changes.
5. Evaluate with render-compare loops and structural metrics, not only code generation success.

That is the direction that aligns with recent research and the product signals around `Stitch`, `Replay`, `dembrandt`, and `Screenshot to Code`.

## What To Borrow

| Component                            | Best recent signal                                                                                                                                                                                                                                                       | What to copy for DryUI                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| DOM capture                          | [Playwright MCP](https://playwright.dev/docs/next/getting-started-mcp), [Playwright locators](https://playwright.dev/docs/locators), [Locator boundingBox](https://playwright.dev/docs/api/class-locator)                                                                | Use accessibility snapshots, role locators, and bounding boxes as the primary structure hypothesis when a live page exists |
| Accessibility tree use               | [Playwright ARIA snapshots](https://playwright.dev/docs/aria-snapshots), [Screen2AX](https://arxiv.org/abs/2507.16704)                                                                                                                                                   | Treat the accessibility tree as a first-class structural representation, not just a test artifact                          |
| OCR and layout parsing               | [PaddleOCR 3.x](https://www.paddleocr.ai/v3.3.2/en/index.html), [PP-StructureV3](https://www.paddleocr.ai/v3.1.1/en/version3.x/pipeline_usage/PP-StructureV3.html), [Docling](https://www.docling.ai/), [Layout Parser](https://layout-parser.readthedocs.io/en/stable/) | Use OCR/layout parsing to detect text blocks, tables, reading order, and region boundaries before vision reconciliation    |
| Dense screen parsing                 | [ScreenParse](https://saidgurbuz.github.io/screenparse/), [ScreenParse paper](https://arxiv.org/abs/2602.14276)                                                                                                                                                          | Train or fine-tune on dense UI element annotations instead of sparse grounding only                                        |
| Token compression                    | [FocusUI](https://arxiv.org/abs/2601.03928), [UIPress](https://arxiv.org/abs/2604.09442)                                                                                                                                                                                 | Reduce screenshot token cost while preserving positional continuity and layout signal                                      |
| Modular UI-to-code pipelines         | [ScreenCoder](https://arxiv.org/abs/2507.22827), [WebVIA](https://arxiv.org/abs/2511.06251), [VisRefiner](https://arxiv.org/abs/2602.05998)                                                                                                                              | Use a staged pipeline: grounding, planning, generation, then visual refinement                                             |
| Responsive repair / breakpoint logic | [Replay breakpoint post](https://www.replay.build/blog/stop-guessing-media-queries-automating-responsive-layout-breakpoints-with-replay), [ReDeFix](https://arxiv.org/abs/2511.00678), [dembrandt](https://github.com/thevangelist/dembrandt)                            | Infer breakpoints from width sweeps and structural deltas, not from a single image                                         |

## Architecture Pattern

### 1. Capture Layer

Use Playwright as the browser capture front end.

- Screenshot at a canonical set of widths such as `375`, `768`, `1024`, and `1440`
- Capture the accessibility tree and role/text structure
- Capture element bounding boxes for key nodes
- Persist DOM, CSS, and screenshot artifacts together so later stages can reconcile them

Why this matters:

- `Playwright MCP` explicitly operates on accessibility snapshots rather than pixels.
- `locator.boundingBox()` gives stable geometry for DOM elements.
- `getByRole()` and ARIA snapshots bias the extractor toward user-perceived structure instead of raw DOM noise.

### 2. Vision Shelling

For screenshots or design images, strip content noise before trying to infer layout.

Recommended passes:

- grayscale conversion
- OCR detection and masking
- edge-map recomputation on the residual image
- vertical and horizontal projection profiles
- whitespace band detection
- recursive connected-component segmentation

Practical libraries:

- `PaddleOCR` or `PP-StructureV3` for text and region parsing
- `Docling` when you want reading order and structured region traversal
- `Layout Parser` when you need a classical layout-detection baseline with OCR hooks

The goal is not pixel fidelity. The goal is a **shell image** that exposes gutters, bands, columns, and region boundaries.

### 3. DOM + Vision Reconciliation

Merge the two hypotheses into one layout tree.

Useful matching rules:

- align OCR boxes with DOM text nodes
- match large DOM containers to vision regions using IoU and center distance
- treat unmatched vision regions as decoration, background art, or non-semantic containers
- treat unmatched DOM nodes as hidden, offscreen, or low-visibility content

Store a confidence score per node and preserve source provenance:

- `dom`
- `a11y`
- `ocr`
- `vision`
- `sweep`

This makes the extractor debuggable and lets DryUI explain why a shell was inferred.

### 4. Breakpoint Detection

Do not infer responsive behavior from a single viewport.

Run a width sweep and compare layout signatures across widths:

- region count
- column count
- ordering changes
- sidebar collapse or expansion
- nav condensation
- card stacking transitions
- span changes in hero, aside, or media blocks

The breakpoint candidate is the narrowest width interval where the structural signature changes.

This is the same practical lesson that shows up in recent breakpoint discussions and repair work:

- `Replay` uses multi-device/video capture to reason about responsive behavior
- `dembrandt` explicitly exposes breakpoint extraction
- `ReDeFix` repairs responsive failures instead of guessing them

### 5. Render-Compare Evaluation

Use a refinement loop instead of one-shot generation.

Recommended evaluation loop:

1. Generate a shell or scaffold.
2. Render it at the same width.
3. Compare against the source screenshot.
4. Score structural deltas, not just image similarity.
5. Feed back the differences to improve the next pass.

Strong recent precedents:

- `VisRefiner` trains on visual differences between rendered predictions and target designs
- `WebVIA` adds multi-state capture and validation
- `screenshot-to-code` now includes video/screen-recording support as an experimental path

## Recommended DryUI Prototype

Build the prototype as five small services instead of one model:

1. **Capture service**
   Accepts a URL or image and returns screenshot, DOM snapshot, accessibility snapshot, and bounding boxes.

2. **Vision shell service**
   Runs OCR, masking, edge analysis, whitespace segmentation, and region clustering.

3. **Merge service**
   Combines DOM and vision into a merged layout tree with confidence and provenance.

4. **Breakpoint sweep service**
   Replays the same page at multiple widths and records topology deltas.

5. **Renderer / exporter**
   Emits DryUI grid tokens, `grid-template-areas`, `grid-template-columns`, and breakpoint overrides.

Suggested output shape:

```json
{
	"viewport": 1440,
	"regions": [
		{
			"id": "hero",
			"kind": "section",
			"box": [0, 96, 1440, 640],
			"columns": 2,
			"confidence": 0.83,
			"evidence": ["dom", "vision"]
		}
	],
	"breakpoints": [
		{
			"when": "(min-width: 48rem)",
			"change": "aside collapses into stacked cards"
		}
	]
}
```

## Community Signal

I looked for discussion on HN, Reddit, and X.

- HN has recurring threads on responsive testing and visual regression, which supports the width-sweep and render-compare approach:
  - [Stop resizing the browser: improve testing for responsiveness](https://news.ycombinator.com/item?id=40606116)
  - [Visual Regression Testing](https://news.ycombinator.com/item?id=21812532)
  - [The anti-pattern of responsive design](https://news.ycombinator.com/item?id=26900755)
- HN also has product discussion around screenshot-based UI tooling and LLM-friendly text-based prototypes:
  - [Ask HN: Low-Code Interactive UI Prototypes/Mocks Powered by TailwindCSS](https://news.ycombinator.com/item?id=42098510)
- Reddit shows the same shape of demand:
  - [How do you design responsive and breakpoints and hand it over to devs?](https://www.reddit.com/r/FigmaDesign/comments/1fqu4r9)
  - [How do you design responsive and explain it to devs?](https://www.reddit.com/r/FigmaDesign/comments/18prl23)
  - [How to do responsive design?](https://www.reddit.com/r/webdev/comments/j2lbda)
  - [When building a responsive layout, do you work on all screen sizes at once?](https://www.reddit.com/r/webdev/comments/120im4v)
  - [VISUAL TESTING USING PLAYWRIGHT](https://www.reddit.com/r/QualityAssurance/comments/140n5mz)
  - [Screen Shot Bot](https://developers.reddit.com/apps/screen-shot-bot), a recent Reddit Devvit app that extracts text from screenshots using vision

I did not find a high-signal X thread worth citing. Search results were dominated by unrelated or noisy pages, so I would not use X as a primary source stream for this topic.

## What DryUI Should Optimize For

- Explainable layout-tree extraction, not opaque screenshot cloning
- Responsive topology changes, not static desktop-only shells
- Structural fidelity, not pixel-perfect rendering
- Small, inspectable artifacts that can be reused by the rest of the system

## Sources

### Browser Capture And Structure

- [Playwright MCP](https://playwright.dev/docs/next/getting-started-mcp)
- [Playwright aria snapshots](https://playwright.dev/docs/aria-snapshots)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright locator.boundingBox](https://playwright.dev/docs/api/class-locator)

### Layout Parsing And OCR

- [PaddleOCR 3.3.2](https://www.paddleocr.ai/v3.3.2/en/index.html)
- [PP-StructureV3](https://www.paddleocr.ai/v3.1.1/en/version3.x/pipeline_usage/PP-StructureV3.html)
- [PaddleOCR layout detection](https://www.paddleocr.ai/main/en/version3.x/module_usage/layout_detection.html)
- [Docling](https://www.docling.ai/)
- [Layout Parser](https://layout-parser.readthedocs.io/en/stable/)

### Recent Research

- [ScreenParse project page](https://saidgurbuz.github.io/screenparse/)
- [ScreenParse paper](https://arxiv.org/abs/2602.14276)
- [FocusUI](https://arxiv.org/abs/2601.03928)
- [UIPress](https://arxiv.org/abs/2604.09442)
- [VisRefiner](https://arxiv.org/abs/2602.05998)
- [ScreenCoder](https://arxiv.org/abs/2507.22827)
- [WebVIA](https://arxiv.org/abs/2511.06251)
- [Screen2AX](https://arxiv.org/abs/2507.16704)
- [ReDeFix](https://arxiv.org/abs/2511.00678)

### Product And Repo Signals

- [Stitch](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/)
- [Replay breakpoint extraction post](https://www.replay.build/blog/stop-guessing-media-queries-automating-responsive-layout-breakpoints-with-replay)
- [dembrandt](https://github.com/thevangelist/dembrandt)
- [Design Token Extractor](https://chromewebstore.google.com/detail/design-token-extractor/iibemocnockckccgcihcmjkciicfoclh)
- [screenshot-to-code](https://github.com/abi/screenshot-to-code)
