# AGENTS.md

Instructions for all AI coding agents working in this repository.

## CSS Rules (enforced by @dryui/lint — build fails on violations)

- **No `width`/`inline-size` properties** in scoped `<style>` blocks — no `width`, `min-width`, `max-width`, `inline-size`, or min/max variants. Grid children are sized by their track. Use `grid-template-columns`/`grid-template-rows` instead.
- **No `display: flex`** — use `display: grid` for all layout.
- **No inline styles** — no `style="..."` or `style:` directives.
- **No `!important`**, no `:global()`, no CSS modules.
- **No `<!-- svelte-ignore css_unused_selector -->`** — fix the root cause instead. Ensure DOM elements are rendered directly in the component that styles them.

## Verification

Always run `bun run --filter '@dryui/ui' build` after editing `.svelte` files in `packages/ui/`. The lint preprocessor runs during build and will reject violations.
