# Layout And Design Agent Skills Deep Dive

Date: 2026-05-11, Australia/Sydney. Sources were checked live through GitHub, skills registries, and project docs. GitHub star and push counts are point-in-time signals, not durable rankings.

## Why This Matters For DryUI

DryUI's `dryui-build` skill is already stronger than most public skills on enforceable structure: lint-first, `data-layout` hooks, `src/layout.css`, token discipline, Svelte 5 rules, and validation commands. The gap is not "more CSS rules." The gap is a small design-planning contract that makes the agent choose layout intent, density, hierarchy, and resilience before it starts producing markup.

## Popular Current Sources

| Source                                                                                                                                                        | Popularity / recency                                                                                                                                            | How it tells the model to handle layout                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Anthropic `frontend-design`](https://github.com/anthropics/skills/tree/main/skills/frontend-design)                                                          | `anthropics/skills`: 131.6k stars, pushed 2026-05-09; [skills.sh lists `frontend-design` at 390.5k installs](https://skills.sh/anthropics/skills).              | Start with purpose, user, tone, constraints, and differentiation. Then commit to a strong aesthetic direction. Layout guidance is taste-led: asymmetry, overlap, diagonal flow, grid-breaking, negative space, or controlled density.                                                        |
| [Anthropic Claude Code plugin `frontend-design`](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md) | `anthropics/claude-code`: 122.3k stars, pushed 2026-05-09.                                                                                                      | Same core pattern as the public skill, optimized for code generation: avoid generic card layouts, vary visual direction, make the implementation complexity match the aesthetic ambition.                                                                                                    |
| [Leonxlnx `taste-skill`](https://github.com/Leonxlnx/taste-skill)                                                                                             | 16.6k stars, pushed 2026-05-06; skills.sh search lists `design-taste-frontend` around 48k installs.                                                             | Uses explicit control dials: design variance, motion intensity, visual density. It turns those dials into hard rules: ban centered default heroes at higher variance, use grid over flex math, collapse asymmetric desktop layouts to strict mobile columns, and run a pre-flight checklist. |
| [Taste Skill `redesign-existing-projects`](https://github.com/Leonxlnx/taste-skill/tree/main/skills/redesign-skill)                                           | Same repo.                                                                                                                                                      | Starts by scanning the stack, diagnosing generic patterns, then fixing in priority order. Its layout audit is useful: centered symmetry, 3-column feature rows, `100vh`, forced equal-height cards, weak max-width, missing whitespace, and misaligned baselines.                            |
| [pbakaus `impeccable`](https://github.com/pbakaus/impeccable)                                                                                                 | 26.7k stars, pushed 2026-05-04; [skills.sh lists 1.6M total installs and a dedicated `layout` skill](https://skills.sh/pbakaus/impeccable).                     | Gates design work on `PRODUCT.md` / `DESIGN.md`, then separates brand surfaces from product surfaces. Its layout reference uses squint-test hierarchy, rhythm, density, "cards only when needed," and explicit responsive checks.                                                            |
| [nextlevelbuilder `ui-ux-pro-max`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)                                                                   | 76.4k stars, pushed 2026-04-03; [skills.sh lists `ui-ux-pro-max` at 154.7k installs](https://skills.sh/nextlevelbuilder/ui-ux-pro-max-skill).                   | Broad UX checklist. Strong on responsive basics: mobile-first, no horizontal scroll, viewport meta, line length, touch target sizing, `min-h-dvh`, semantic color tokens, skeleton loading, and one primary action per screen.                                                               |
| [shadcn/ui `shadcn` skill](https://github.com/shadcn-ui/ui/tree/main/skills/shadcn)                                                                           | 114.0k stars, pushed 2026-05-10.                                                                                                                                | Component-composition discipline: use existing components first, semantic colors, `gap-*` over `space-*`, `FieldGroup` / `Field` for form layout, full `Card` composition, and `className` for layout rather than overriding component styling.                                              |
| [Vercel `web-design-guidelines`](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)                                          | `vercel-labs/agent-skills`: 26.4k stars, pushed 2026-05-07; [skills.sh lists 300k+ installs](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines). | Fetches a living guidelines file before review, then outputs terse file-line findings. The important pattern is freshness: the skill delegates volatile design/a11y rules to a canonical remote document rather than freezing all guidance in `SKILL.md`.                                    |
| [Microsoft `frontend-design-review`](https://github.com/microsoft/skills/tree/main/.github/skills/frontend-design-review)                                     | 2.3k stars, pushed 2026-05-08.                                                                                                                                  | Two modes: create UI or review UI. Review mode scores design system compliance, frictionless insight-to-action, accessibility, and trust. It asks the agent to check Storybook/Figma/design tokens first, then prioritize blocking/major/minor issues.                                       |
| [OpenAI Figma implement/generate skills](https://github.com/openai/skills/tree/main/skills/.curated/figma-implement-design)                                   | `openai/skills`: 18.8k stars, pushed 2026-05-08.                                                                                                                | The public repo currently has Figma design skills, not a current `frontend-skill` at HEAD. The useful pattern is source-of-truth workflow: fetch structured design context, capture screenshot, download assets, map to project tokens/components, then validate against the screenshot.     |
| [Google Labs Stitch skills](https://github.com/google-labs-code/stitch-skills)                                                                                | 5.3k stars, pushed 2026-05-10.                                                                                                                                  | Creates `.stitch/DESIGN.md` as a semantic design source of truth. It translates screenshots/code into atmosphere, color roles, component styling, and layout principles before generating new screens.                                                                                       |
| [Flutter responsive layout skills](https://github.com/flutter/skills/tree/main/skills/flutter-build-responsive-layout)                                        | 1.9k stars, pushed 2026-05-08; skill metadata last modified 2026-04-21.                                                                                         | Strong constraint model: use parent-available space, not hardware type; use layout builders/container constraints; resize the app window and fix overflow errors. This maps cleanly to DryUI's container-query rule.                                                                         |

## Common Instruction Patterns

1. **Pre-build intent framing.** The best skills make the agent name the screen's user, task, context, density, tone, and primary action before code. Anthropic does this lightly; Impeccable does it as a gated shape brief.

2. **Layout dials beat vague adjectives.** Taste Skill's `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY` are useful because they turn "make it nicer" into behavior. DryUI could use a smaller version: `density`, `surface_type`, and `hierarchy_target`.

3. **Component and token discipline is separable from taste.** shadcn, Microsoft, OpenAI Figma, and DryUI all converge on the same rule: inspect components and tokens before inventing markup or raw values.

4. **Responsive behavior is becoming constraint-based.** Strong sources say to design from available container/window space, content ranges, pointer/hover capability, safe areas, long text, and mobile browser viewport units. "Mobile-first" alone is too weak.

5. **Design systems need living context.** Impeccable and Stitch use `PRODUCT.md`, `DESIGN.md`, or `.stitch/DESIGN.md`; Vercel fetches live guidelines. This keeps the skill small and lets project-specific taste live outside the core skill.

6. **Screenshots are evidence, not optional polish.** OpenAI Figma and the visual validator pattern both make screenshot comparison part of the workflow. DryUI already asks for desktop/mobile screenshots; the improvement is to define what counts as passing.

7. **Audit language helps actionability.** Microsoft's blocking/major/minor style is more actionable than a flat checklist. DryUI could use this for visual review and feedback without weakening lint rules.

## DryUI-Specific Opportunities

### 1. Add A Tiny Layout Brief

After "Restate the target UI," require a one-line layout brief:

```text
Layout brief: surface=<brand|product|docs|tool>, user=<role>, task=<primary action>, density=<airy|standard|dense>, hierarchy=<primary object/action>, states=<default/empty/loading/error/etc>.
```

This gives the model enough context to choose restrained product layout vs. expressive brand layout without adding broad design lore.

### 2. Add A Composition Contract

DryUI should tell agents to decide:

- Primary action per view.
- Scan path and grouping.
- Whether cards are needed, or whether spacing/dividers are enough.
- Which content gets top-left priority on product UIs.
- What collapses, hides, or reorders on narrow containers.

This is compatible with `src/layout.css` because it describes structure before CSS.

### 3. Add Layout Resilience Checks

DryUI's build skill already mentions media and long headings. Expand that into a pre-flight checklist:

- Long heading and localized copy.
- Empty, loading, error, disabled, success.
- Dense table/list data.
- Text zoom and minimum touch targets.
- Reduced motion.
- Coarse pointer / no-hover behavior.
- Safe-area and mobile viewport behavior.
- Dark/light contrast if system theme is enabled.

### 4. Strengthen Screenshot Validation

Current wording says to verify desktop and mobile screenshots. Make the pass criteria explicit:

- No overflow or clipped text.
- Primary action visible and distinct.
- Same visual hierarchy after mobile collapse.
- Skeleton/empty/error states keep the same track sizes as final content.
- Dark mode only if verified, otherwise keep the app light-only.

### 5. Borrow Severity Language For Reviews

For UI review or feedback runs, use:

- `blocking`: violates lint, a11y, broken layout, unreadable contrast, missing task path.
- `major`: weak hierarchy, broken responsive behavior, missing state, generic card grid where structure is required.
- `minor`: polish, copy, spacing rhythm, small alignment.

This makes DryUI feedback easier to triage.

## Recommended Patch Direction

Do not import big "anti-slop" style lists wholesale. DryUI should stay focused on structural UI craft. The highest-value update is a compact section between `Workflow` and `Markup`:

1. `Layout Brief`
2. `Composition`
3. `Layout Resilience`
4. `Visual Verification`

Keep Anthropic/Taste-style aesthetic ambition out of the default path except where the user asks for brand/marketing polish. DryUI's differentiator is that layout is enforceable through lint and `src/layout.css`, so the skill should make agents think before they touch those constraints.
