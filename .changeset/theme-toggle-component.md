---
'@dryui/ui': minor
'@dryui/primitives': minor
'@dryui/mcp': patch
---

Add `ThemeToggle` component plus `createThemeController` and `themeFlashScript` helpers to `@dryui/ui`. `ThemeToggle` wraps the existing `Toggle` with bundled sun/moon SVG icons, supports Alt-click / Escape to return to system mode, persists the explicit pick under a configurable `storageKey` (default `'dryui-theme'`), and accepts an optional pre-built controller so multiple surfaces can share state. `createThemeController` exposes `mode`, `isDark`, `setMode`, `cycle`, and `reset` for custom triggers, and `themeFlashScript` returns the inline IIFE to embed in `<head>` so the stored preference applies synchronously before first paint.
