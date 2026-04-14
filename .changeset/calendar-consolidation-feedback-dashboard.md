---
'@dryui/ui': patch
'@dryui/primitives': patch
'@dryui/cli': patch
'@dryui/feedback-server': patch
---

Calendar consolidation, input/embed fixes, and feedback dashboard merge.

**@dryui/ui**

- Consolidated `Calendar`, `DatePicker`, `DateRangePicker`, and `RangeCalendar` onto a single shared internal `CalendarGridButton` via a `CalendarGridAdapter` prop. ~600 lines of duplicated template + styles removed; behavior, narrow weekday headers (S M T W T F S), and brand-fill selection are now consistent across all four.
- Fixed empty weekday header row caused by duplicate keys in the `{#each}` (narrow labels have repeated letters).
- Selected dates fill with the brand color on first click via cell-level CSS variable cascade.
- `NumberInput`: removed dead `container-type: inline-size` that was collapsing the wrapper to 38px and misaligning the +/- buttons; increment/decrement buttons now scale with the `size` prop (`sm`/`md`/`lg`).
- `VideoEmbed`: iframe and video now fill the aspect-ratio box via `width="100%" height="100%"` HTML attributes (CSS `inset` alone doesn't override replaced-element intrinsic size).
- `Image`: exposed `--dry-image-block-size` and `--dry-image-place-self` for consumer overrides.

**@dryui/cli**

- `dryui feedback launcher` now opens the unified feedback dashboard at `/ui/` directly (with the docs URL passed via `?dev=`), via the new `buildDashboardUrl()` helper. Removed the separate launcher URL/targets and the `includeLauncher` build option.

**@dryui/feedback-server**

- The standalone launcher UI (`launcher.html`, `Launcher.svelte`, `launcher.ts`) is removed. The main dashboard (`App.svelte`) is now the single entry point and reads the docs base URL from a `?dev=` query parameter. Added a copy-prompt button so submissions can be handed off to Claude with one click.
