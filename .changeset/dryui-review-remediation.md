---
'@dryui/primitives': major
'@dryui/ui': major
'@dryui/cli': patch
'@dryui/feedback': patch
'@dryui/feedback-server': patch
'@dryui/mcp': patch
---

Address the main-branch review findings across security, SSR stability, generated artifact hygiene, docs deployment, and tooling validation.

Rename the MarkdownRenderer raw HTML opt-out from `sanitize={false}` to the explicit `dangerouslyAllowRawHtml` prop, harden local feedback server request boundaries, sanitize rich text editor HTML, move component IDs to Svelte SSR-safe IDs, and tighten DateField and drag preview cleanup.

Also stabilize package declaration cleanup, generated artifact drift checks, docs static output and component manifests, MCP reviewer/theme diagnostics, CLI setup/install behavior, feedback page identity, and docs demo coverage.
