# Accessibility Policy

DryUI targets WCAG 2.2 AA across the core interactive component surface.

This repository does not make a library-wide AAA claim. AAA remains a useful stretch target for individual experiences, but it is not the baseline standard for the component library as a whole.

For custom widgets, APG-aligned semantics and keyboard behaviour are required. That includes truthful roles and states, predictable focus management, and keyboard interaction that matches the established widget pattern instead of a DryUI-specific variant.

## What AA-ready Means Here

A component is only considered AA-ready in this repository when:

- its accessible name, role, value, and state are exposed correctly
- focus order and focus return are predictable
- the keyboard model matches the intended widget pattern
- helper, error, and status text are programmatically associated where relevant
- motion, autoplay, and transient feedback do not create avoidable accessibility regressions

## Verification

Accessibility regressions should be caught by review and automation together:

- `tests/browser/a11y-*.browser.test.ts` covers widget-specific semantic and keyboard regressions
- `bun run test:browser` is part of the pull-request validation workflow
- `bun run --filter '@dryui/ui' build` remains required after editing `.svelte` files in `packages/ui/`
- generated component metadata in `packages/mcp/src/spec.json` must include explicit a11y guidance for every exported component surface

## Contributor Checklist

- Add or update a browser test when interactive behaviour, keyboard handling, or semantics change.
- Keep accessible labels, descriptions, and error associations explicit.
- Prefer native semantics where possible; only ship custom widget roles when the full pattern is implemented.
- Treat motion and transient feedback as accessibility concerns, not just visual polish.

## Scope Notes

- The library can support accessible applications, but final conformance still depends on product-level labeling, copy, information architecture, and content decisions made by consumers.
- Presentational or layout helpers should not add landmark or region semantics unless the consumer gives the section a meaningful name.
- Components that visualize data or motion-heavy content must provide a reliable non-visual alternative when the visual treatment carries essential information.
