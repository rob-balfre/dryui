# Contrast Color And Theme Guidance Audit

Date: 2026-05-16

## Summary

DryUI should document `contrast-color()` as a progressive enhancement, not as a replacement for semantic foreground/background tokens.

Current platform facts:

- `contrast-color()` is Baseline 2026 newly available since April 2026.
- The function returns only `black` or `white`.
- Production guidance still needs static fallback tokens, because Baseline newly available does not mean every supported environment has upgraded.
- DryUI dark mode is driven by `[data-theme='dark']` or `.theme-auto`, not by `color-scheme` or `light-dark()`.

## Documentation Position

First-class theme modes should be named consistently:

- Light-only: import `@dryui/ui/themes/default.css` and leave `<html>` bare.
- Explicit light/dark: import `default.css` and `dark.css`, then set `data-theme='light'` or `data-theme='dark'`.
- System-aware auto: import `default.css` and `dark.css`, then set `class='theme-auto'`; use `data-theme` only as an override.

`color-scheme` may still be useful for browser chrome and form control rendering, and `light-dark()` may still be useful for isolated CSS values. Neither should be described as a DryUI theme switch, because they do not activate the DryUI dark token block.

## `contrast-color()` Guidance

Use `contrast-color()` only after declaring a readable static fallback:

```css
[data-tone='accent'] {
	--surface: var(--dry-color-accent-9);
	--surface-fg: var(--dry-color-accent-contrast);
	background: var(--surface);
	color: var(--surface-fg);
}

@supports (color: contrast-color(red)) {
	[data-tone='accent'] {
		--surface-fg: contrast-color(var(--surface));
	}
}
```

The fallback remains the accessibility contract. The `@supports` block is an enhancement for current engines.

Do not use `contrast-color()` as the only check for middle-tone brand colors, charts, overlays, disabled states, badges, or translucent surfaces. Because the return value is limited to black or white, it cannot choose a semantic branded foreground and may still produce a result that needs design review for clarity.

## Audit Outcome

Updated the durable guidance surfaces that agents, contributors, and consumers are expected to read:

- `skills/dryui-build/SKILL.md` now names the first-class light, explicit dark, and `.theme-auto` modes and adds guarded `contrast-color()` guidance.
- `ACCESSIBILITY.md` now treats contrast across first-class theme modes as part of AA readiness and clarifies that `contrast-color()` is progressive enhancement with static fallback tokens.
- `README.md`, the Getting Started route, and the LLM summary now describe light-only, system-aware auto, and explicit override setup instead of treating `theme-auto` as a universal default.
- Theme CSS now exposes static `on-*` fallbacks for `info`, `accent`, and `orange`, gates dynamic `contrast-color()` overrides behind `@supports`, and declares `color-scheme` in first-class light and dark theme selectors.
- Component fixes moved brand text states to text tokens and made solid orange Badge/Tag variants consume the new orange fill/on pair.
- Regression tests now cover semantic fill/on contrast across the named themes and keep explicit dark declarations aligned with `.theme-auto` dark declarations.
