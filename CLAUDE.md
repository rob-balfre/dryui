# DryUI

Bun monorepo: zero-dependency Svelte 5 components built on native browser APIs.

## Packages

- `packages/primitives` — @dryui/primitives: headless, unstyled components
- `packages/ui` — @dryui/ui: styled components with Svelte scoped styles + --dry-\* variable theming
- `packages/mcp` — @dryui/mcp: MCP server for lookup, source retrieval, planning, validation, theme diagnosis, and workspace audit
- `packages/cli` — @dryui/cli: CLI tool for setup snippets, planning, lookup, validation, and workspace audit
- `packages/lint` — @dryui/lint: Svelte preprocessor that enforces CSS grid-only layout, container queries, and bans flexbox/inline styles
- `packages/feedback` — @dryui/feedback: feedback annotation UI components
- `packages/feedback-server` — @dryui/feedback-server: feedback MCP server backend
- `packages/theme-wizard` — @dryui/theme-wizard: theme generation library (brand color → full theme)
- `packages/plugin` — @dryui/plugin: Claude Code + Codex plugin (bundles skill, MCP server, and feedback)
- `apps/docs` — Documentation site (SvelteKit, static adapter)

## Commands

```bash
bun install                    # Install all workspace deps
bun run build                  # Build all @dryui/* packages
bun run test                   # Run unit + browser tests
bun run test:unit              # Bun test runner (tests/unit/)
bun run test:browser           # Vitest + Playwright (tests/browser/)
bun run check                  # Exports + type-check + contracts + docs:llms + lint violations
bun run check:lint             # Run CSS lint rule tests
bun run validate               # parallel pipeline: lint + build + check + test (CI gate, supports --no-test)
bun run changeset              # Create a changeset for release
bun run format                 # Format all files (Prettier)
bun run format:check           # Check formatting without writing
bun run sync:exports           # Regenerate package.json exports maps
bun run sync:skills            # Sync skill files to ~/.claude/skills/
bun run validate:spec          # Check spec.json coverage against components
bun run screenshots:components # Generate component screenshots to tmp/ (manual, not in CI)
```

### Per-package builds

```bash
bun run --filter '@dryui/primitives' build   # svelte-package
bun run --filter '@dryui/ui' build            # svelte-package
bun run --filter '@dryui/mcp' build           # generate-spec → bun build → tsc
```

## Architecture

primitives (headless) → ui (styled, scoped Svelte styles) → mcp (spec generator + tools)

- Components use native browser APIs: `<dialog>`, Popover API, CSS Anchor Positioning
- No external runtime dependencies — this is a hard constraint
- Svelte 5 runes only ($state, $derived, $props) — no legacy syntax

## Dogfooding — USE DryUI Components

**Hard rule: All UI in this repo (docs app, playground, examples, tools) MUST use DryUI components from `@dryui/ui`.** Never write raw `<button>`, `<input>`, `<div class="card">` when a DryUI component exists for that purpose.

Use:

- `Button` not `<button class="my-btn">`
- `Card` not `<div class="card">`
- `Input` not `<input class="my-input">`
- `Slider` not `<input type="range">`
- `Badge` not `<span class="badge">`
- `Alert` not `<div class="alert">`

**Layout is raw CSS grid** — do not use `Grid`, `Stack`, or `Flex` components. Use `display: grid` with CSS custom properties and `@container` queries. See the CSS Discipline section below and the `dryui-css` skill.

**Before writing any UI**, run `mcp compose` or check the component catalog to find the right DryUI components for the job. If no component exists, flag it — don't work around it with raw HTML.

## Theming

Token naming: `--dry-color-{element}-{tone}-{emphasis}-{state}`

- **Elements:** text, stroke, icon, fill, bg
- **Tones:** neutral (omitted), brand, error, warning, success, info
- **Emphasis:** strong, weak
- **States:** hover, active (omitted for default)

Two-tier system: semantic → component.

- Semantic: `--dry-color-text-strong`, `--dry-color-fill-brand`, `--dry-color-bg-base`, `--dry-color-stroke-weak`, etc.
- Component: `--dry-card-bg: var(--dry-color-bg-raised)` (set in scoped `<style>`)
- Non-color: `--dry-space-4`, `--dry-radius-lg`, `--dry-shadow-sm` (unchanged utility tokens)
- Themes: `packages/ui/src/themes/default.css` and `dark.css`
- Prefer `<html class="theme-auto">` as the default app/docs theme mode; use `data-theme="light|dark"` only for explicit overrides
- Brownfield integration: import default.css, override `--dry-color-*` semantic tokens to match project palette
- Theme wizard: `apps/docs/src/routes/theme-wizard/` — guided theme builder from a single brand color
- Docs app note: the docs theme switcher defaults to system and persists explicit user picks in `localStorage` under `dryui-docs-theme`

## MCP Server

Registered in `.mcp.json`. Run via: `bun run packages/mcp/dist/index.js`

### Quick setup

```bash
# Claude Code (plugin — installs skill + MCP server)
claude plugin marketplace add rob-balfre/dryui
claude plugin install dryui@dryui

# Codex (public/manual install)
$skill-installer install https://github.com/rob-balfre/dryui/tree/main/packages/ui/skills/dryui
codex mcp add dryui -- npx -y @dryui/mcp

# Codex (repo-local plugin when working in this repository)
codex
/plugins
# Install DryUI from the "DryUI Local" marketplace exposed by .agents/plugins/marketplace.json

# Copilot / Cursor / Windsurf (skill + MCP config)
npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui
# Then add MCP config — see apps/docs/src/lib/ai-setup.ts for per-tool formats

# Zed (MCP only — no skill support yet, reads AGENTS.md for conventions)
# Add to ~/.config/zed/settings.json under "context_servers"
```

Two MCP servers are configured:

- **dryui** — component lookup, composition, validation, theme checks, workspace audit
- **dryui-feedback** — feedback annotation and review (`packages/feedback-server/dist/mcp.js`)

DryUI MCP tools:

- lookup and source browsing (`info`, `get`, `list`)
- composition and project planning (`compose`, `detect_project`, `plan_install`, `plan_add`)
- validation, theme checks, and workspace audit (`review`, `diagnose`, `doctor`, `lint`)
- CLI: `bunx @dryui/cli detect` / `install` / `add --project` / `info <component>` / `get` / `list` / `compose` / `review` / `diagnose` / `doctor` / `lint`
- Skill: `packages/ui/skills/dryui/SKILL.md`
- Plugin: `packages/plugin/` (Claude Code plugin + Codex local plugin bundling `dryui`, `init`, `live-feedback`, and MCP)

### Output Format — TOON (Token-Optimized Output)

MCP tool output uses TOON format by default — a compact, agent-optimized notation (~40% fewer tokens than JSON). Format: `resource[count]{fields}: value1,value2,...`

- MCP tools: TOON is the default for all tools (info, list, compose, review, diagnose, doctor, lint, detect_project, plan_install, plan_add)
- CLI: plain text by default; add `--toon` for TOON output, `--json` for JSON (where supported)
- `--full` disables truncation (compose snippets, workspace findings, component examples are truncated by default in TOON mode)
- Every TOON response includes `next[]` contextual help suggesting logical next commands
- Pre-computed aggregates: `hasBlockers`, `autoFixable` (review), `coverage` (diagnose), `top-rule` (workspace)
- Definitive empty states: `issues[0]: clean`, `findings[0]: clean` (not ambiguous empty output)
- Structured errors: `error[1]{code,message}: not-found,"Unknown component"` with suggestions

### Composition Data

Single source of truth: `packages/mcp/src/composition-data.ts`

- Defines per-component composition rules (alternatives, anti-patterns, combinesWith)
- Defines cross-component recipes (named patterns with full snippets)
- Search logic: `packages/mcp/src/composition-search.ts` (shared between MCP and CLI)
- Consumed by: spec.json, `compose` MCP tool, `compose` CLI command, dryui skill
- When adding new components or changing component APIs, update composition-data.ts
- Run `bun run --filter '@dryui/mcp' build` after changes to regenerate spec.json

## Testing

- Unit tests: Bun test runner with happy-dom (`tests/unit/`)
- Browser tests: Vitest + Playwright chromium (`tests/browser/`)
- MCP reviewer tests: `packages/mcp/src/reviewer.test.ts`
- CI: GitHub Actions builds docs and deploys to Cloudflare Pages on push to main. No PR validation workflow — run `bun run validate` locally before pushing

## Releasing

Automated via GitHub Actions (`.github/workflows/release.yml`) using `changesets/action@v1`:

1. Push changesets to `main` → CI opens/updates a "Version Packages" PR
2. Merge that PR → CI publishes to npm and creates GitHub Releases

Manual local release: `bun run release` (validate → version → build → publish)

Secrets required: `NPM_TOKEN` (repo Actions secret, already configured)

### npm auth gotcha — READ BEFORE ROTATING TOKENS

A gitignored **project-level `.npmrc` at the repo root** holds the publish token (`npm_R8uE...` at time of writing — a classic Publish token). This file takes precedence over `~/.npmrc` whenever publish commands run from inside the repo (`bun run publish:packages`, `bun run release`, etc.).

**The GitHub Actions `NPM_TOKEN` secret must match `./.npmrc`, NOT `~/.npmrc`.** They are usually different tokens with different scopes. The user-level token is often a granular read token that can't publish; the project-level token is the one with `@dryui/*` write permission.

To rotate the CI secret to match the current project token:

```bash
awk -F= '/^\/\/registry.npmjs.org\/:_authToken=/{printf "%s", $2}' ./.npmrc \
  | gh secret set NPM_TOKEN --repo rob-balfre/dryui
```

Rules:

- Use `printf` / `awk ... printf` (no trailing newline). A trailing `\n` becomes URL-encoded in the Bearer header and npm returns 401, which it reports as a misleading 404 on `PUT /<pkg>`.
- Pipe via stdin to `gh secret set`. **Never paste tokens into GitHub's web UI** — it silently injects whitespace that triggers the same 401→404 pattern.
- The npm CLI reports 404 "package not in registry" on publish auth failures to avoid leaking package existence. Always verify the package exists on npmjs.com before assuming the 404 is real — if the package IS there, the 404 means auth is wrong.

## Deployment

Docs site deploys to Cloudflare Pages (`dryui-docs` project).

```bash
bun run --filter '@dryui/primitives' build && bun run --filter '@dryui/ui' build  # build deps first
cd apps/docs && bun run build                                                      # build docs
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name=dryui-docs        # deploy
```

- Adapter: `@sveltejs/adapter-cloudflare`
- Config: `apps/docs/wrangler.toml`
- Build output: `apps/docs/.svelte-kit/cloudflare`

## UI Design — Always Load practical-ui Skill

**When building, styling, or reviewing any UI** (components, layouts, pages, forms, buttons), always load the `practical-ui` skill first. It enforces proven design rules from "Practical UI" that this project follows. Key rules include:

- **Never disable submit/continue buttons** — always enable, validate on click, show error explaining why the user can't proceed
- **Labels above fields**, single-column forms, vertical radio/checkbox stacks
- **1 primary button per view** — secondary for everything else
- **Button labels: verb + noun** ("Save post") — never "Ok", "Yes", "Submit"
- **Errors above fields** with red border + tint + icon — never colour alone
- **Minimum 48x48pt** interactive targets
- **Left-align** actions, ordered most important to least important

## CSS Discipline

- **All layout is CSS grid** — use `display: grid` with CSS custom properties (`var(--name, fallback)`) for columns, gap, alignment. Do not use `display: flex` or the `Grid`, `Stack`, `Flex` components
- **Container queries for responsive** — use `container-type: inline-size` + `@container` queries. Never use `@media` for sizing breakpoints
- **`@media` only for user preferences** — `prefers-reduced-motion` and `prefers-color-scheme` only
- **No inline styles** — no `style="..."` attributes or `style:` directives in markup. Use scoped CSS with custom properties
- **Never use `!important`** — fix specificity at the source; use component props, data attributes, or restructure HTML
- **Never use `:global()`** — use scoped styles, `data-*` attributes, CSS variables, or component props
- **Svelte scoped `<style>` blocks only** — no CSS modules (`.module.css`). UI components render their own elements directly and use scoped styles
- **`data-*` attributes for variants** — use `data-variant`, `data-size`, `data-color` etc. instead of CSS module class selection
- **Svelte custom properties for consumer overrides** — expose `--dry-*` CSS vars that consumers can pass as component props (`<Button --dry-btn-bg="red" />`)
- **UI components render elements directly** — import only context/utility functions from `@dryui/primitives`, never primitive components
- **No `width`/`inline-size` properties** — do not use `width`, `min-width`, `max-width`, `inline-size`, or their min/max variants in scoped styles. Grid children are sized by their track; use `grid-template-columns`/`grid-template-rows` instead. Enforced by `@dryui/lint` (`dryui/no-width`) — build will fail on violations
- **Never use `<!-- svelte-ignore css_unused_selector -->`** — this suppresses real bugs where scoped styles can't reach their targets. Fix the root cause: ensure the DOM element is rendered directly in the same component as the `<style>` block, not delegated to a child/primitives component
- **Enforced by `@dryui/lint`** — a Svelte preprocessor runs on every `.svelte` file during dev and build, **errors break the build**. Always run `bun run --filter '@dryui/ui' build` to verify before claiming a fix. Load the `dryui-css` skill for full rules

## Gotchas

- Browser tests require Playwright installed (`bunx playwright install chromium`)
- @dryui/primitives and @dryui/ui versions are linked via changesets — release together
- MCP build runs `generate-spec` first to produce spec.json from component metadata
- The ui package scoped styles reference --dry-\* vars — components render unstyled without a theme import
- @dryui/docs is excluded from changesets (not published)
- Docs build requires `PUBLIC_MAPBOX_TOKEN` env var — CI sets it from secrets; locally, export it or expect map-related features to fail
