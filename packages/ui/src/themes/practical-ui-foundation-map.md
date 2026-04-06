# Practical UI Foundation Map

> Living note for [docs/research/practical-ui-figma-extraction.md](./docs/research/practical-ui-figma-extraction.md). Extracted from the Practical UI design system file on 2026-03-25.

## Foundation Rules

- Colour tokens are organized as semantic roles first, then tone, emphasis, and state.
- Background surfaces use `base`, `sunken`, `raised`, and `overlay`.
- Practical UI’s public neutral text and fill system is transparent, not solid.
- Elevation is expressed with both surface colour and shadow.
- Spacing is a fixed 4px-based ladder, not ad hoc values.
- Typography is centered on Inter with a small named scale.

## DryUI Mapping

| Figma                | DryUI                       |
| -------------------- | --------------------------- |
| `Background/Base`    | `--dry-color-bg-base`       |
| `Background/Sunken`  | `--dry-color-bg-sunken`     |
| `Background/Raised`  | `--dry-color-bg-raised`     |
| `Background/Overlay` | `--dry-color-bg-overlay`    |
| `Background/Inverse` | `--dry-color-bg-inverse`    |
| `Text/Strong`        | `--dry-color-text-strong`   |
| `Text/Weak`          | `--dry-color-text-weak`     |
| `Text/Disabled`      | `--dry-color-text-disabled` |
| `Stroke/Strong`      | `--dry-color-stroke-strong` |
| `Stroke/Weak`        | `--dry-color-stroke-weak`   |
| `Stroke/Focus`       | `--dry-color-stroke-focus`  |
| `Fill/Strong`        | `--dry-color-fill-strong`   |
| `Fill/Weak`          | `--dry-color-fill-weak`     |
| `Fill/Hover`         | `--dry-color-fill-hover`    |
| `Fill/Press`         | `--dry-color-fill-active`   |
| `Fill/Selected`      | `--dry-color-fill-selected` |
| `Fill/Inverse`       | `--dry-color-fill-inverse`  |
| `Information`        | `info`                      |

## Published Scales

- Spacing: `0`, `4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `56`, `64`, `80`, `96`, `128`, `192`, `256`
- Desktop typography: `Display 56/64`, `Heading 1 40/48`, `Heading 2 32/40`, `Heading 3 24/32`, `Heading 4 20/28`, `Small 16/24`, `Tiny 14/20`
- Mobile typography: `Display 40/48`, `Heading 1 36/44`, `Heading 2 28/36`, `Heading 3 24/32`, `Heading 4 20/28`, `Small 16/24`, `Tiny 14/20`

## Notes

- Keep [`default.css`](./packages/ui/src/themes/default.css) and [`dark.css`](./packages/ui/src/themes/dark.css) synchronized with the extracted foundation ladder.
- The inverse fill family in Dark mode follows the same transparent-neutral logic as the rest of the semantic layer.
