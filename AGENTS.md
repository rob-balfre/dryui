# AGENTS.md

Repo-wide instructions for AI coding agents working in this repository.

## Canonical Docs

- Public overview: [`README.md`](./README.md)
- Contributor workflow: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- CSS discipline and token rules: [`skills/dryui/rules/theming.md`](./skills/dryui/rules/theming.md)
- Accessibility policy: [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)
- Release flow: [`RELEASING.md`](./RELEASING.md)

## Canonical Sources

- Editor install snippets and MCP config examples live in [`apps/docs/src/lib/ai-setup.ts`](./apps/docs/src/lib/ai-setup.ts). Do not duplicate them elsewhere.
- Public docs copy and positioning should match [`apps/docs/src/lib/site-meta.ts`](./apps/docs/src/lib/site-meta.ts) and the docs homepage: human-led, agent-assisted UI for reusable components, themes, and route patterns. Avoid positioning DryUI as a full automation tool, an "agent-built apps" product, or a Svelte-only message.
- The public docs route surface is intentionally small: `/`, `/getting-started`, and `/components/[slug]`. Do not re-add removed exploration pages (`/tools`, `/how-it-works`, `/how-we-work`, `/grid-rules`, `/theme-wizard`, logo option pages, `/components` index pages, or similar samples) unless explicitly requested.
- Skill sources live in top-level [`skills/`](./skills/) (`dryui`, `dryui-layout`, `dryui-feedback`, `dryui-live-feedback`, `dryui-init`). One source of truth.
- Recommended install path for end users: `npx skills add rob-balfre/dryui` (skills.sh standard).
- `bun run validate:skills` lints every SKILL.md (frontmatter present, name=dirname, description length).
- `/plugins` in this repo refers to the in-app Claude or Codex install flow (sunset for DryUI; users install via `npx skills add rob-balfre/dryui`), not a repo directory.

## Repo Rules

- Use `gh-axi` for GitHub and `chrome-devtools-axi` for browser automation.
- DryUI is pre-alpha. Prefer the current shape over compatibility shims unless a task explicitly asks for backwards compatibility.
- Use the DryUI CLI as the default entry point. Always check for an existing local link before installing globally:

```bash
readlink ~/.bun/install/global/node_modules/@dryui/cli
```

If the link points at this repo's `packages/cli`, do not run a global install; it will replace the local link. Restore or refresh local source mode instead:

```bash
bun run dev:link
DRYUI_DEV=1 dryui
```

Only install the published CLI when no local link exists and you are not iterating on the DryUI monorepo:

```bash
bun install -g @dryui/cli@latest
dryui
```

- Use `dryui check [path]` or MCP `check` for static validation: component contracts, a11y, tokens, CSS discipline.
- DryUI ships no layout component. Page/section structure lives as plain CSS Grid in root `src/layout.css`, scoped under `[data-layout="<name>"]`. The file is imported last from `src/routes/+layout.svelte` after DryUI theme CSS and `../app.css`.
- All `display: grid` and `display: flex` declarations in consumer code live in `src/layout.css` (or `@container` blocks within it). Mobile-first; `@container` queries for responsive shifts, never `@media` for layout breakpoints.
- `@dryui/lint` has two build-time surfaces: `dryuiLint()` in `svelte.config` for component rules, and `dryuiLayoutCss()` in `vite.config` for `src/layout.css`. The Vite plugin must run in `vite dev`/HMR and `vite build`; missing `src/layout.css` is warning-only, violations are hard errors.
- The docs shell header is centralized in [`apps/docs/src/routes/+layout.svelte`](./apps/docs/src/routes/+layout.svelte): logo, search, GitHub, and theme toggle. Keep route pages focused on content and avoid duplicating header chrome.
- The docs logo is the simple font-based `DryUI` wordmark in [`apps/docs/src/lib/components/Logo.svelte`](./apps/docs/src/lib/components/Logo.svelte). The favicon lives at [`apps/docs/static/favicon.svg`](./apps/docs/static/favicon.svg) and should stay black and white with no underline.
- For design-quality work (brief, critique, polish, visual review, anti-pattern detection), DryUI delegates to [impeccable](https://impeccable.style). Install alongside DryUI via `dryui init` or `npx impeccable skills install`, then use `/impeccable <command>` from your AI harness. `PRODUCT.md` and `DESIGN.md` at the project root are impeccable-owned; DryUI tools do not read or write them.
- Keep root-level Markdown durable. One-off audits, scratch TODOs, and generated reports belong under `docs/`, `reports/`, or ignored local directories, not the repo root.
- Repo-local editor install output such as `.agents/skills/`, `.github/skills/`, `.opencode/`, and `opencode.json` is not canonical source.

## End-to-End Testing

- Use `bun run e2e:full` to pack local package tarballs and run every scaffold scenario. Use `bun run e2e:one <scenario>` for a focused scenario and `bun run e2e:pack` when only refreshing tarballs is needed.

## Local Source Mode

- For iterating on `@dryui/cli`, `@dryui/mcp`, or `@dryui/feedback-server` against live source instead of `dist/`, run `bun run dev:link` once then set `DRYUI_DEV=1` in the consuming shell or editor MCP config. Wrappers, env contract, and dashboard UI watch flow are documented under "Source Mode (DRYUI_DEV)" in [`README.md`](./README.md). Tear down with `bun run dev:unlink`.

## Verification

- After editing `.svelte` files in `packages/ui/`, run `bun run --filter '@dryui/ui' build`.
- For docs work, prefer the root wrappers so local runs match CI: `bun run docs`, `bun run docs:build`, `bun run docs:check`, and `bun run build:docs`.
- After changing skill content, run `bun run validate:skills` (auto-runs in postinstall and the pre-commit hook).
