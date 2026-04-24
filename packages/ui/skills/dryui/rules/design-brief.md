# Design Brief Pipeline

Use this rule before building or materially changing a UI. It keeps intent, component contracts, and polish review in the same visible loop.

## Pipeline

1. **User brief** — capture the audience, primary job, product/domain, density, tone, constraints, and success criteria. Ask only for missing information that changes the implementation.
2. **DESIGN.md identity** — read the project `DESIGN.md` if present. If the project lacks one and the UI has meaningful visual direction, draft the identity in the working notes or create the file when the user asks for durable design guidance. Google-style `DESIGN.md` is an optional supported format, not a dependency.
3. **DryUI lookup/plan** — use `dryui info`, `dryui compose`, or MCP `ask` before selecting components or recipes. Plan around confirmed component contracts, accessibility, tokens, and grid layout.
4. **make-interfaces-feel-better polish intent pass** — explicitly list the polish details that apply before implementation. This is a planning step, not hidden preference.
5. **Implementation** — build with DryUI components, Svelte 5, scoped grid CSS, tokenized styling, and accessible composition.
6. **Deterministic check** — run `dryui check [path]` or MCP `check` against edited files or the workspace.
7. **Visual review** — run `dryui check --visual <url>` or MCP `check` with `visualUrl`. Name the user brief and the polish intent in the review prompt when possible.
8. **Repair loop** — fix issues in priority order, then repeat deterministic check and visual review until the screen satisfies the brief.

## Precedence

When guidance conflicts, use this order:

1. User intent and explicit task constraints.
2. Local `DESIGN.md` identity.
3. DryUI component contracts, accessibility rules, and token/theming discipline.
4. Official Svelte MCP guidance for Svelte and SvelteKit syntax/framework decisions.
5. make-interfaces-feel-better polish rubric.

## Brief Shape

Keep the brief short and implementation-oriented:

- Who is using this?
- What are they trying to do?
- What information or action must be visible first?
- How dense should the interface be?
- What brand, product, or domain cues should shape the identity?
- What constraints are fixed by the user, existing code, or platform?

## DESIGN.md Identity

Use `DESIGN.md` to preserve durable identity decisions: product personality, visual tone, density, navigation model, content hierarchy, color/token direction, motion posture, and examples of what to avoid.

Do not treat `DESIGN.md` as more important than the user's current request. If the user changes direction, follow the user and update the identity only when the change is meant to persist.

## Polish Intent

The make-interfaces-feel-better pass should be explicit in planning and visual review. Check the applicable details:

- balanced headings and pretty body wrapping
- concentric radius for nested surfaces
- icon swaps that crossfade without jitter
- tabular numbers for counters, prices, clocks, and scores
- transitions for interactive state, not keyframe-only state changes
- staggered entrances when groups appear
- smaller exits than entrances
- shadow treatment for raised surfaces
- optical icon alignment inside buttons
- adaptive image edges for media and avatars
- token consistency across color, radius, shadow, spacing, duration, and easing

If a detail does not apply, skip it deliberately. Polish is a review rubric, not decoration.
