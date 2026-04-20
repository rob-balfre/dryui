---
'@dryui/ui': minor
'@dryui/primitives': minor
'@dryui/mcp': patch
---

Polish motion, radius, and typography details across `@dryui/ui` primitives.

New public tokens and utilities: `--dry-stagger-step` / `--dry-stagger-max` / `--dry-stagger-delay` with a `[data-dry-stagger]` attribute utility (nth-child(1..12) fallback so lists animate in order without JS), a shared `[data-dry-icon-reveal]` primitive that animates opacity/scale/blur with `--dry-ease-spring-snappy`, and a `--dry-image-edge` semantic token for subtle 10% rings on image-shaped surfaces. Container surfaces (card, modal/dialog, alert, popover, toast, dropdown-menu, alert-dialog) now set `--dry-btn-radius` to `--dry-radius-nested` so nested controls inherit the concentric outer-minus-padding radius.

Button press uses `scale(0.98)` for tactile feedback and `icon-sm` is bumped to 40px so icon-only controls (including the dialog close) meet a 40x40 hit target. Enter/exit timing is now asymmetric on dialog, drawer, alert-dialog, tooltip, popover, and dropdown-menu: exits use `--dry-duration-fast` + `--dry-ease-out` for a snappier close. `[data-dry-stagger]` wires into accordion, select, combobox, command-palette, dropdown-menu, context-menu, menubar, and toast; `[data-dry-icon-reveal]` wires into checkbox, radio, theme-toggle, and the select chevron. `Text` gets `text-wrap: pretty` and `tabular-nums` is applied to number-input, slider value label, progress label, pin-input, chart y-axis labels, and data-grid number/end-aligned cells. Optical alignment: play triangle in video-embed nudged `translateX(1px)`, nav-arrow-button prev/next nudged +-0.5px (flows to pagination and carousel nav). All changes honor `prefers-reduced-motion`.
