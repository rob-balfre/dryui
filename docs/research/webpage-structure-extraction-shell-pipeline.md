# Webpage Structure Extraction: Grayscale Shell Pipeline

**Date:** April 2026  
**Scope:** Practical algorithmic approaches for turning a webpage screenshot, or a live rendered page, into a grayscale structural shell that DryUI can use to scaffold grid layout, region hierarchy, and breakpoint hints.

Companion note: [Layout Extraction From Screenshots, Images, and Live Webpages](./layout-extraction-from-screenshots-webpages-2026-04-16.md)

## TL;DR

DryUI should prototype a **hybrid DOM + vision pipeline**. Pure vision is useful as a fallback, but the highest-signal path is:

1. Capture the page at a small set of canonical widths.
2. Use the browser DOM and accessibility tree as the first structural hypothesis.
3. Use OCR, edge density, and whitespace projection on screenshots to recover the visual shell.
4. Align DOM boxes with vision regions.
5. Infer columns, gutters, and breakpoints from layout changes across widths.
6. Emit a normalized grid schema that DryUI can map to `grid-template-areas`, `grid-template-columns`, and breakpoint overrides.

The important product decision is not "can we detect a button?" It is "can we recover the page's stable layout skeleton with enough confidence to scaffold a real grid system?"

## What The Shell Should Contain

The shell should preserve:

- page frame
- major regions
- columns and gutters
- top-level stacking order
- sticky/navigation bands
- media containers
- content blocks
- breakpoints where the layout topology changes

The shell should intentionally drop or down-weight:

- text content
- icon glyph detail
- image pixels
- decorative strokes
- internal component chrome unless it affects structure

That distinction matters because DryUI wants **layout truth**, not pixel fidelity.

## Recommended Prototype

Build the first prototype as a **three-stage extractor**.

### Stage 1: DOM-first capture

When a live page is available:

- capture screenshot(s) at a fixed width set, for example `375`, `768`, `1024`, `1440`
- capture the DOM, accessibility tree, and bounding boxes from Playwright or the browser
- extract semantic hints from tags, roles, and text clustering
- keep the DOM as the primary source of hierarchy

This gives you the cheapest and most reliable structure signal. Vision should correct and enrich it, not replace it.

### Stage 2: Vision shell extraction

For the screenshot path:

- convert to grayscale
- detect text regions with OCR
- detect edges with Canny or Sobel
- compute horizontal and vertical projection profiles
- identify low-density gutters and whitespace bands
- segment connected regions recursively
- inpaint or mask OCR regions to expose the underlying container structure

Use the vision pass to answer:

- where are the large containers?
- how many columns are stable?
- where does vertical rhythm repeat?
- where are the likely gutters and section boundaries?

### Stage 3: DOM + vision reconciliation

Fuse the two hypotheses with box matching:

- align OCR boxes with DOM text nodes
- align large DOM containers with vision regions using IoU and center-distance scoring
- treat unmatched vision regions as likely canvas, background art, or non-semantic layout containers
- treat unmatched DOM nodes as hidden, overflowed, or low-visibility content

The output should be a merged layout tree with a confidence score per node.

## Core Algorithmic Building Blocks

### 1. Grayscale shelling

Convert the screenshot to grayscale, then remove text and image detail to get a structural underlay.

Practical sequence:

1. OCR all text blocks.
2. Mask text boxes with inpainting or a neutral fill.
3. Optionally mask logos, photos, and illustrative images using object detection or simple saliency thresholds.
4. Recompute an edge map on the residual image.

This yields a "shell image" where page structure is easier to detect than content.

### 2. White-space analysis

Use whitespace as a first-class signal.

Heuristics that work well in practice:

- vertical gutters show up as persistent low-density columns in the edge and mask projections
- section breaks show up as horizontal low-density bands
- repeated card decks show aligned whitespace intervals between elements
- asymmetrical layouts are easier to detect after text removal

This is cheap, explainable, and usually beats trying to segment everything with a monolithic model.

### 3. Column inference

Infer columns with a mix of projection profiles and clustering.

Useful signals:

- peaks and troughs in the x-projection of edges and OCR masks
- alignment stability of left and right edges across nodes
- modal content widths
- repeated x-start positions across sibling blocks

Implementation approach:

- generate candidate gutters from low-density x-ranges
- cluster blocks by x-start and x-center
- fit a small set of candidate column counts
- score each candidate by alignment consistency and uncovered area

This is a constrained optimization problem, not just a detection task.

### 4. Grid fitting

After block clustering, fit the page to a small grid basis.

For each candidate grid:

- estimate row bands from horizontal whitespace cuts
- estimate column tracks from x-clusters
- allow some items to span tracks
- penalize grids that force too many irregular spans

The best grid is the one that explains the most page real estate with the fewest exceptions.

### 5. Breakpoint detection

Do not infer breakpoints from one screenshot. Infer them from a **width sweep**.

At each viewport width:

- run the same segmentation pipeline
- record column count, region order, nav state, and major span changes
- compare the layout signature to the previous width

Then detect layout events:

- one column to two columns
- sidebar collapse to drawer
- reordering of aside and content
- switch from multi-card row to stacked cards
- header condensation

The breakpoint should be the smallest width interval where the layout signature changes.

### 6. Semantic stripping

When the goal is a shell, not a render clone, strip inner detail aggressively:

- replace paragraphs with text placeholders
- replace button labels with pill boxes
- replace images with neutral rectangles or aspect-ratio placeholders
- keep only the structural containers and their spatial relationships

This is useful for generating DryUI scaffolds because it preserves the page's grid grammar while dropping content noise.

## Why A Hybrid Pipeline Wins

Pure vision is attractive, but it is weaker in exactly the cases DryUI cares about:

- repeated components
- nested layouts
- hidden text and overflow
- sticky headers and sidebars
- responsive reflow across breakpoints

Pure DOM is stronger when you have a live page, but it fails on screenshots, marketing images, and exports from design tools.

The hybrid path gives you:

- DOM semantics when available
- screenshot truth when the DOM lies or is unavailable
- OCR to recover textual anchors
- vision segmentation to recover hierarchy and whitespace

That is the right division of labor.

## Concrete DryUI Output Schema

Prototype the extractor to emit a simple JSON object:

```json
{
	"viewport": 1440,
	"regions": [
		{
			"id": "header",
			"kind": "nav",
			"box": [0, 0, 1440, 96],
			"columns": 1,
			"confidence": 0.94
		},
		{
			"id": "hero",
			"kind": "section",
			"box": [0, 96, 1440, 640],
			"columns": 2,
			"confidence": 0.81
		}
	],
	"grid": {
		"columns": "minmax(0, 1fr) 18rem",
		"areas": ["header header", "hero hero"]
	},
	"breakpoints": [
		{
			"when": "(min-width: 48rem)",
			"change": "nav collapses to sidebar"
		}
	]
}
```

This is enough for DryUI to scaffold a page layout without pretending the problem is solved at pixel level.

## Practical Recommendation For DryUI

If we prototype only one thing, build this:

1. A browser-based capture service that returns screenshot, DOM boxes, and accessibility tree.
2. A vision fallback that does OCR, edge maps, whitespace projection, and region clustering.
3. A merger that emits a small structural JSON schema.
4. A breakpoint sweep that compares layout signatures across widths.
5. A renderer that converts the result into DryUI grid tokens and `breakpoints`.

That gives DryUI a useful "structure compiler" rather than another screenshot-to-code demo.

## Evaluation Plan

Measure the extractor against manually labeled reference pages.

Useful metrics:

- region IoU
- column count accuracy
- gutter detection F1
- breakpoint event precision/recall
- text-block removal quality
- shell edit distance against a human-labeled grid tree

Also track a human metric:

- how often a DryUI scaffold produced from the shell is good enough to start implementation without manual grid repair

That last metric is the one that matters product-wise.

## Prior Art And Sources

### 2025-2026 references worth reading first

These are the most useful direct or near-direct references for the prototype. Some are screenshot/UI systems, while others are adjacent document-parsing or evaluation stacks that are useful building blocks rather than exact matches.

- [OmniParser project page](https://microsoft.github.io/OmniParser/) and [OmniParser V2 paper](https://arxiv.org/abs/2502.16161): strong example of turning screenshots into structured elements for agent use.
- [ScreenCoder paper](https://arxiv.org/abs/2507.22827): modular multimodal agents for visual-to-code generation.
- [VisRefiner paper](https://arxiv.org/abs/2602.05998): self-refinement from visual differences.
- [UICopilot paper](https://arxiv.org/abs/2505.09904): hierarchical code generation from webpage designs.
- [WebVIA paper](https://arxiv.org/abs/2511.06251): interactive and verifiable UI-to-code generation.
- [Vision2Web paper](https://arxiv.org/abs/2603.26648): hierarchical benchmark across static, interactive, and full-stack website development.
- [UIOrchestra paper](https://aclanthology.org/2025.findings-emnlp.150.pdf): multi-agent code generation from UI designs.
- [Interaction2Code repo](https://github.com/WebPAI/Interaction2Code): interactive webpage generation benchmark with multi-step interactions.
- [OmniDocBench repo](https://github.com/opendatalab/OmniDocBench): document parsing benchmark with real-world annotations.
- [PaddleOCR docs](https://www.paddleocr.ai/v3.3.1/en/index.html) and [PaddleOCR releases](https://github.com/PaddlePaddle/PaddleOCR/releases): current OCR and layout parsing stack, including PP-StructureV3.
- [Docling site](https://www.docling.ai/): practical structured document parsing with OCR, table detection, and reading order.
- [BigDocs paper](https://arxiv.org/abs/2412.04626) and [project page](https://bigdocs.github.io/): large benchmark with Screenshot2HTML and other image-to-code tasks.
- [screenshot-to-code repo](https://github.com/abi/screenshot-to-code): practical open-source screenshot-to-code tool with video support.

### Foundational references

- [Design2Code paper](https://arxiv.org/abs/2403.03163): real-world benchmark for screenshot-to-code generation.
- [Web2Code paper](https://arxiv.org/abs/2406.20098): large-scale webpage-to-code dataset and evaluation framework.
- [WebSight paper](https://arxiv.org/abs/2403.09029): 2 million screenshot/HTML pairs.
- [DCGen paper](https://arxiv.org/abs/2406.16386): divide-and-conquer screenshot-to-code generation.
- [Pix2Struct paper](https://arxiv.org/abs/2210.03347): screenshot parsing as pretraining.
- [LayoutParser project](https://layout-parser.github.io/) and [LayoutParser GitHub](https://github.com/Layout-Parser/layout-parser): practical document layout analysis toolkit.

## Bottom Line

The best DryUI prototype is a **hybrid structure extractor**, not a pure screenshot-to-code model.

Use DOM when you have it. Use vision when you do not. Use OCR and whitespace to remove content noise. Use multi-width sweeps to infer breakpoints. Emit a small grid-focused structural schema, not a full HTML clone.

That will get DryUI to a real "layout shell from screenshot" workflow faster than trying to solve full design reconstruction in one step.
