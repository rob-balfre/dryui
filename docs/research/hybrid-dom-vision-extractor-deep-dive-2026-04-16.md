# Hybrid DOM + Vision Extractor Deep Dive

**Date:** 2026-04-16  
**Scope:** Deep research into recent repos, papers, launch posts, and community discussion relevant to a DryUI-style extractor that turns a live webpage or screenshot into a structural shell, breakpoint hints, and reusable design metadata.

Companion notes:

- [Layout Extraction From Screenshots, Images, and Live Webpages](./layout-extraction-from-screenshots-webpages-2026-04-16.md)
- [Webpage Structure Extraction: Grayscale Shell Pipeline](./webpage-structure-extraction-shell-pipeline.md)

## Executive Summary

- The strongest recent signal is not a single end-to-end `screenshot -> grid system` model.
- The field is converging on a stack:
  - live browser capture
  - DOM and accessibility-tree context
  - screenshot analysis
  - OCR or structured visual parsing
  - multi-viewport validation
  - markdown or token exports for agents
- The best recent open-source precedents for DryUI are not generic screenshot-to-code tools. They are tools like `ViewGraph`, `Clearshot`, `Glimpse`, `design-memory`, and `dembrandt` that capture structure, styles, and multiple views before asking an LLM to reason.
- HN and Reddit confirm demand, but the discussion is still fragmented. Breakpoint-aware structure extraction is still niche compared with generic screenshot-to-code.
- DryUI’s best wedge remains a **hybrid DOM + vision extractor** that outputs a shell-first artifact:
  - regions
  - hierarchy
  - columns
  - gutters
  - breakpoint events
  - design metadata

## Research Method

I searched for:

- recent GitHub repositories and READMEs
- official product blogs and docs
- HN launch and Show HN posts
- Reddit threads
- X posts where they were indexable and tied to a primary-source announcement

I treated vendor benchmarks as claims unless I could independently verify methodology. X and Reddit indexing was inconsistent, so the social section is intentionally more conservative than the repo and paper sections.

## Direct-Fit Repos

These are the closest current open-source precedents for a DryUI implementation.

| Repo                                                                                                          | Exact recency                              |  Stars | What it does                                                                                                                                                  | Signals used                                                           | Why it matters                                                                  |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [sourjya/viewgraph](https://github.com/sourjya/viewgraph)                                                     | Created `2026-04-08`, updated `2026-04-15` |      0 | Captures structured DOM snapshots and exposes them to coding agents via MCP; includes extension, server, Playwright fixture, annotations, and capture diffing | DOM, selectors, styles, screenshots, accessibility, Playwright         | Best current blueprint for a DryUI shell-capture layer                          |
| [udayanwalvekar/clearshot](https://github.com/udayanwalvekar/clearshot)                                       | Created `2026-03-24`, updated `2026-04-15` |    125 | Runs structured screenshot analysis for coding agents with three levels: `map`, `system`, and `blueprint`                                                     | Screenshot, spatial grid, design-system extraction, responsive context | Very close to “strip to shell, preserve grid, add system metadata”              |
| [AmirMakir/glimpse-mcp](https://github.com/AmirMakir/glimpse-mcp)                                             | Created `2026-03-27`, updated `2026-03-29` |      1 | Visual feedback MCP server with `screenshot_all`, `smart_diff`, `dom_inspect`, and accessibility tools                                                        | DOM, screenshots, multi-viewport, accessibility                        | Strong precedent for validation and breakpoint sweeps                           |
| [memvid/design-memory](https://github.com/memvid/design-memory)                                               | Created `2026-02-14`, updated `2026-04-12` |    121 | Learns a design system from a URL or screenshot, outputs `.design-memory/` markdown and skills                                                                | Playwright, screenshot, computed styles, CSS vars, LLM interpretation  | Shows a practical browser-first + interpretation pipeline                       |
| [dembrandt/dembrandt](https://github.com/dembrandt/dembrandt)                                                 | Created `2025-11-22`, pushed `2026-04-11`  |  1,644 | Extracts tokens, components, icons, and explicit breakpoints; supports mobile and dark mode, DTCG, `DESIGN.md`                                                | Playwright, computed styles, DOM structure, mobile sampling            | Clearest current precedent for breakpoint-aware design-system extraction        |
| [kalilfagundes/design-system-extractor-skill](https://github.com/kalilfagundes/design-system-extractor-skill) | Created `2026-03-19`, updated `2026-04-07` |      5 | Python pre-processor sanitizes HTML, extracts CSS variables and Tailwind tokens, then passes compact JSON to an agent                                         | HTML, CSS vars, Tailwind, component mapping                            | Good example of token-window reduction before LLM reasoning                     |
| [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code)                                           | Updated `2026-04-08`                       | 72,234 | Large screenshot-to-code baseline with experimental video support                                                                                             | Screenshot, video                                                      | Important baseline, but weaker as a shell extractor than the hybrid tools above |
| [nebenzu/Blip](https://github.com/nebenzu/Blip)                                                               | Created `2026-03-19`, updated `2026-04-11` |      7 | Annotation overlay that sends screenshot-plus-markup intent back to Claude Code                                                                               | Annotated screenshots                                                  | Adjacent, but useful for human-in-the-loop shell correction                     |

## What These Repos Suggest

The recent repo pattern is more useful than the recent marketing pattern.

- `ViewGraph` is effectively a UI context layer. It treats structure as something to capture and serialize, not something to hallucinate later.
- `Clearshot` is explicitly trying to make screenshots legible to coding agents by forcing a structured intermediate representation.
- `Glimpse` is not a layout extractor, but it has the right validation primitives: multi-viewport screenshots, structural diffs, accessibility, and DOM inspection.
- `design-memory` splits the workflow correctly:
  - acquire
  - analyze
  - interpret
  - project
- `dembrandt` proves there is real product demand for extracting design-system metadata and breakpoints from live pages.

That combination is closer to DryUI’s problem than classic screenshot-to-code systems.

## Strong Recent Product Signals

These are the most relevant recent primary sources outside GitHub.

| Source                                                                                                                                   | Exact date                                               | What it claims                                                                                              | Why it matters                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [Google Labs: Stitch](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/)                        | `2026-03-18`                                             | Stitch is evolving into an AI-native design canvas with prototypes, an agent, and `DESIGN.md` import/export | Strong mainstream signal that the market wants design context, iteration, and flow-aware structure rather than one-off codegen |
| [OpenAI × Figma partnership](https://openai.com/index/figma-partnership/)                                                                | `2026-02-26`                                             | Codex can generate editable Figma designs from code and implement Figma back into code via MCP              | Strong official round-trip signal for code-design-code workflows                                                               |
| [Replay breakpoint post](https://www.replay.build/blog/stop-guessing-media-queries-automating-responsive-layout-breakpoints-with-replay) | `2026-02-25`                                             | Uses multi-device video capture to infer responsive breakpoints and generate React/Tailwind                 | One of the few recent sources explicitly centered on breakpoint inference                                                      |
| [Design Extractor](https://www.design-extractor.com/)                                                                                    | Live as of `2026-04-16`                                  | Generates `DESIGN.md` from a public URL for coding agents                                                   | Confirms the repo-native markdown artifact is becoming a real distribution format                                              |
| [Figma design-to-code page](https://www.figma.com/solutions/design-to-code/)                                                             | updated in range, surfaced `2026-04-02` via Make updates | Emphasizes kits, attachments, components, and constraints in prompt-to-code flows                           | Strong signal that structured context beats raw pixels                                                                         |

## Strong Recent Research Signals

These matter because they explain where the extractor should borrow ideas from.

| Paper / project                                                                                       | Exact date   | Relevant idea                                                                                                                                    | DryUI implication                                                                      |
| ----------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [ScreenParse / ScreenVLM](https://arxiv.org/abs/2602.14276)                                           | `2026-02-15` | Dense screen parsing across `771K` web screenshots and `21M` UI elements with `55` classes; Webshot uses Playwright and accessibility extraction | Best recent public signal for training or evaluating shell extraction                  |
| [FocusUI](https://arxiv.org/abs/2601.03928)                                                           | `2026-01-07` | Position-preserving token selection for UI grounding                                                                                             | Spatial continuity matters; do not compress away columns and gutters                   |
| [UIPress](https://arxiv.org/abs/2604.09442)                                                           | `2026-04-10` | Encoder-side optical token compression for UI-to-code                                                                                            | Useful if screenshot analysis becomes too expensive at scale                           |
| [VisRefiner](https://arxiv.org/abs/2602.05998)                                                        | `2026-02-05` | Learns from visual differences between generated and target UI                                                                                   | DryUI should use render-and-compare validation instead of trusting one extraction pass |
| [Screen2AX](https://arxiv.org/abs/2507.16704)                                                         | `2025-07-22` | Builds hierarchy trees from a screenshot                                                                                                         | Very close to DryUI’s “shell tree” problem                                             |
| [LaTCoder](https://arxiv.org/abs/2508.03560)                                                          | `2025-08-05` | Block-wise layout decomposition before code generation                                                                                           | Supports a hierarchical extractor over a monolithic one                                |
| [ScreenCoder](https://arxiv.org/abs/2507.22827)                                                       | `2025-07-30` | Splits the task into grounding, planning, and generation agents                                                                                  | DryUI should preserve this decomposition in its architecture                           |
| [ReDeFix](https://arxiv.org/abs/2511.00678)                                                           | `2025-11-01` | Repairs responsive layout failures with RAG and CSS knowledge                                                                                    | Breakpoint repair is an adjacent capability once extraction exists                     |
| [Screenshot Tokenization Guided by User Interface Tree](https://www.tdcommons.org/dpubs_series/9321/) | `2026-02-11` | Tokenizes based on a UI tree rather than uniform patches                                                                                         | Great fit for a DOM+vision merged representation                                       |

## Community Signals

### Hacker News

Recent HN activity is real but still small. That matters.

| Exact date   | Thread                                                                                                          | Signal                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `2026-04-10` | [Show HN: Figma for Coding Agents](https://getdesign.md)                                                        | `DESIGN.md` is becoming a recognizable artifact for agent workflows                              |
| `2026-03-20` | [Design.md](https://stitch.withgoogle.com/docs/design-md/overview/)                                             | Stitch’s markdown design-system format is visible enough to get its own HN link                  |
| `2026-03-02` | [Show HN: Extract design systems, export as Claude skills](https://designskill.co/)                             | People are already trying to package extracted design knowledge as agent-readable skills         |
| `2026-02-19` | [Design-memory: Extract and reproduce design systems from any website](https://github.com/memvid/design-memory) | Live-website extraction is part of the current builder zeitgeist, but still niche                |
| `2026-01-05` | [Show HN: I made a tool that steals any website's UI into .md context](https://www.stealui.xyz/)                | The “steal a site into markdown context” framing resonates with agent users                      |
| `2025-12-29` | [A tool that reconstructs real UIs from screen recording (not screenshot-to-code)](https://www.replay.build/)   | Multi-view or video-based extraction is seen as a distinct step beyond static screenshot-to-code |

**Takeaway:** HN is showing recurring launches but not one breakout consensus tool. This still feels like an early workflow category, not a settled stack.

### Reddit

Reddit is noisier, but the thread themes are useful.

| Exact date   | Thread                                                                                                                                                                        | Signal                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `2026-04-09` | [r/n8n: automate splitting a full-page screenshot into sections](https://www.reddit.com/r/n8n/comments/1sh3ugc/automate_splitting_a_fullpage_screenshot_into/)                | Direct demand for hero/trust/testimonials/footer segmentation                       |
| `2026-04-04` | [r/mcp: AI vision MCP to evaluate UI/UX from screenshots](https://www.reddit.com/r/mcp/comments/1sc813h/i_built_an_ai_vision_mcp_to_evaluate_uiux_from/)                      | Screenshot analysis is already being routed through MCP rather than bespoke UIs     |
| `2026-03-19` | [r/vibecoding: design-system-extractor skill from any URL](https://www.reddit.com/r/vibecoding/comments/1jexe1w/i_built_a_claude_code_antigravityopencode_skill/)             | Community demand is still strongly token-first                                      |
| `2026-03-18` | [r/ClaudeAI: Scout browser extension and editable DESIGN.md](https://www.reddit.com/r/ClaudeAI/comments/1jdair7/i_built_scout_a_browser_extension_that_lets/)                 | “Website-inspired design system extraction” is now a recognizable agent workflow    |
| `2026-03-19` | [r/ClaudeAI: Blip -- Draw on your UI, Claude implements the changes](https://www.reddit.com/r/ClaudeAI/comments/1rytgis/blip_draw_on_your_ui_claude_implements_the_changes/)  | Users value visual correction loops because text-only UI instructions are ambiguous |
| `2025-11-26` | [r/DesignSystems: dissect brand and design tokens from any website](https://www.reddit.com/r/DesignSystems/comments/1p7n9tc/i_built_a_tool_dissects_brand_and_design_tokens/) | Design-system extraction has clear practitioner demand                              |
| `2025-11-22` | [r/javascript: Dembrandt](https://www.reddit.com/r/javascript/comments/1p3xmyj/dembrandt_extract_any_websites_design_system_in/)                                              | Early community validation for live-site extraction                                 |
| `2025-11-18` | [r/SideProject: CaptrIQ full-page website intelligence](https://www.reddit.com/r/SideProject/comments/1p0iwnk/building_captriq_aipowered_fullpage_website/)                   | OCR plus full-page structure extraction is a recurring hobby-builder idea           |

**Takeaway:** Reddit discussion is less about “full automatic conversion” and more about:

- splitting layout from content
- extracting reusable design metadata
- annotating or critiquing screenshots
- keeping a human in the loop

### Detailed Community Takeaways

These were the most useful practitioner-level patterns from the discussion sweep.

- `2026-02-08` [r/ClaudeAI: design system auditing skill](https://www.reddit.com/r/ClaudeAI/comments/1qz3xte/i_made_a_claude_code_skill_for_design_system/)
  The strongest practical hybrid description I found. The author samples a live site at multiple sizes, reads computed styles and layout grammar, captures DOM and accessibility state, and writes screenshots plus JSON plus markdown. The framing is explicitly audit-first, not clone-first.
- `2026-02-19` [r/webdesign: Screenshot breakpoint](https://www.reddit.com/r/webdesign/comments/1r90j5g/screenshot_breakpoint/)
  Small thread, but the heuristic is useful: use a few representative widths rather than many synthetic breakpoints. This lines up with the width-sweep recommendation in the pipeline note.
- `2026-03-15` [r/ClaudeCode: Dashboard build quality](https://www.reddit.com/r/ClaudeCode/comments/1ru0hun/dashboard_build_quality/)
  The advice here is operational rather than theoretical: define stack, components, color, spacing, and typography up front; provide a reference screenshot or Figma file; and break the work into components. This is effectively an argument for explicit structure before generation.
- `2026-04-12` [r/UI_Design: ZipIt extension](https://www.reddit.com/r/UI_Design/comments/1sjgflz/i_built_a_chrome_extension_to_extract_design_code/)
  Mixed reception, but the useful argument is that computed styles from the live DOM are more trustworthy than hallucinated screenshot cloning.
- `2026-04-15` [r/ClaudeAI: extract a site’s full design system](https://www.reddit.com/r/ClaudeAI/comments/1sm23sp/i_built_a_claude_code_plugin_that_extracts_any/)
  Clear signal that users want one URL to produce markdown, Tailwind, CSS variables, React theme output, and Figma variables. The skepticism is also useful: public marketing sites are fair game, but bot detection and paywalls still break the crawl path.

On the HN side, the highest-signal pattern was different:

Dates below are approximate month-level placements based on the thread timestamps surfaced during research.

- `2026-02` [Show HN: Design constraints from Top Companies as AI agent skills](https://news.ycombinator.com/item?id=46759654)
  The key idea is not image parsing. It is turning design rules into explicit `MUST` / `SHOULD` / `NEVER` constraints that agents can follow.
- `2026-01` [Show HN: Open-source Figma design to code](https://news.ycombinator.com/item?id=46741472)
  Skepticism stays consistent: people see value as a kickoff or prototype tool, but they still question fidelity and maintainability.
- `2026-03` [Show HN: Vibma – let agents create professional design system in Figma, directly](https://news.ycombinator.com/item?id=47217411)
  More evidence that the category is shifting toward variables, components, and lint-like design-system enforcement inside tools, not just raw conversion.

### X / Social

X was the hardest source to index reliably. The strongest usable signals were the ones tied to official launches.

| Exact date   | Source                                                                             | Signal                                                                                      |
| ------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `2026-03-30` | [Dembrandt on X](https://x.com/dembrandtcom/status/2038740814361190832)            | Pushes the “steal design tokens from an existing site” framing directly                     |
| `2026-03-24` | [Figma on X](https://x.com/figma/status/2036537173885984975)                       | Publicly frames Claude Code ↔ Figma round-tripping as a first-class workflow                |
| `2026-02-26` | [OpenAI Devs on X](https://x.com/OpenAIDevs/status/2027062351724527723)            | Reinforces code-to-Figma and Figma-to-code roundtrip work                                   |
| `2026-03-18` | [Stitch / Google launch context](https://x.com/dalmaer/status/2034333810163425706) | Community chatter around Stitch centers on `DESIGN.md`, agents, and structured design flows |

**Takeaway:** Social chatter is strongest when tied to a larger workflow shift:

- agents now need design context
- markdown artifacts are replacing bespoke config formats
- round-tripping between code and design is becoming normalized

## Pattern Synthesis

Across repos, papers, HN, Reddit, and social launch posts, the same pattern keeps showing up:

1. **Structure first**
   Systems that capture DOM, selectors, styles, or accessibility outperform pure pixel-only approaches for real work.

2. **Vision still matters**
   Screenshots are still needed because the DOM lies, design intent is visual, and screenshots work even when no live page exists.

3. **One screenshot is not enough**
   Multi-viewport sweeps, video, or render-compare loops are becoming more common because breakpoint behavior is invisible in a single frame.

4. **Agent-readable markdown is winning**
   `DESIGN.md`, `.design-memory/`, and similar artifacts are showing up everywhere because they are cheap to generate and easy for agents to consume.

5. **Human correction is still necessary**
   Annotation tools like Blip and review-oriented tools like ViewGraph exist because extraction is still ambiguous.

## Recommended DryUI Architecture

DryUI should build the extractor in five stages.

### 1. Capture

- Playwright capture at `375`, `768`, `1024`, `1440`
- full-page screenshots
- serialized DOM
- computed styles
- CSS variables
- accessibility tree
- console and network metadata when useful

### 2. Vision Shelling

- grayscale conversion
- OCR text box detection
- text masking or inpainting
- whitespace and edge-density projection
- region segmentation
- candidate column and gutter extraction

### 3. DOM + Vision Merge

- align DOM nodes to visual regions
- keep DOM semantics where confidence is high
- prefer vision for visible grouping and spacing truth
- emit a merged layout tree with confidence scores

### 4. Breakpoint Inference

- compare layout signatures across captured widths
- detect events:
  - column count changes
  - nav collapse
  - sidebar to drawer
  - stacked cards
  - reordered regions

### 5. Projection

Project the result into two outputs:

- a DryUI shell artifact:
  - regions
  - grid
  - areas
  - breakpoints
  - constraints
- an agent artifact:
  - `DESIGN.md`
  - token summary
  - layout principles
  - notes and confidence warnings

## What DryUI Should Build First

The shortest useful prototype is:

1. Browser capture service.
2. Screenshot shell pass.
3. DOM + screenshot merger.
4. Width-sweep breakpoint detector.
5. JSON shell exporter.

That is enough to test the core product question:

> Does the output save enough manual grid reconstruction work to be worth using?

Do not start with full code generation. The repo and community evidence both suggest that shell extraction is the real missing layer.

## Watch List

Projects or ideas worth revisiting in the next pass:

- [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)  
  Huge adoption signal for the `DESIGN.md` format, even though it is a curation repo rather than an extractor.
- [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills)  
  Useful if DryUI later wants to export shell knowledge into a Stitch-compatible agent workflow.
- [screenshot-to-code](https://github.com/abi/screenshot-to-code) video mode  
  Worth mining for evaluation baselines and examples, even if it is not the architecture DryUI should copy.

## Bottom Line

The evidence is consistent.

DryUI should not build “another screenshot-to-code tool.”

DryUI should build a **hybrid structure extractor**:

- browser-first when a live page exists
- screenshot-capable when it does not
- shell-first rather than code-first
- multi-viewport rather than single-frame
- markdown and JSON outputs rather than opaque blobs

That is the clearest gap left by both the repo landscape and the community discussion.
