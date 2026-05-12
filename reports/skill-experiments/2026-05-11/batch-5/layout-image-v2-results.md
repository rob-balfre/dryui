# Layout Image V2 Results

Ran the layout-only `dryui-build` experiment skill against five generated design-reference images using Codex `gpt-5.5` with low reasoning.

## Harness Result

All five scenarios passed scaffold, agent, build, dev server, and structural assertions.

| Scenario            | Result | Visual Score | Notes                                                                                                                                                                                            |
| ------------------- | ------ | -----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Analytics dashboard | Pass   |       7.5/10 | Captures top bar, nav, KPI strip, primary analytics area, insight panel, activity, and account utilities. Slightly generic spacing and utility placement, but the responsive structure is close. |
| Project kanban      | Pass   |       8.5/10 | Best extraction. Preserves mobile stack, tablet board/detail split, desktop rail, board, task detail, and activity/bottom navigation regions.                                                    |
| CRM pipeline        | Pass   |         8/10 | Strong desktop and tablet structure with nav, header, KPI strip, deal workspace, account detail, forecast, and activity. Good region hierarchy.                                                  |
| Settings admin      | Pass   |       6.5/10 | Captures settings groups and action bar, but misses the strong desktop dark left sidebar from the reference and flattens the desktop shell.                                                      |
| AI knowledge        | Pass   |       5.5/10 | Labels the right regions but the desktop layout is too shallow and horizontal; it misses the dominant reader/document surface and side-panel proportions.                                        |

## Checks

- Output screenshots captured at 390px, 820px, and 1440px.
- Horizontal overflow was 0px in all 15 viewport captures.
- No imports, `@dryui/ui`, Lucide, inline SVG, images, forms, tables, buttons, or inputs were found in generated `+page.svelte`/`layout.css`.
- All outputs used mobile-first `grid-template-areas` with `@container` branches at `48rem` and `72rem`.

## Artifacts

- Output contact sheet: `reports/skill-experiments/2026-05-11/batch-5/design-image-layout-v2-contact-sheet.png`
- Reference contact sheet: `reports/skill-experiments/2026-05-11/batch-5/design-reference-contact-sheet.png`
- Run logs:
  - `reports/e2e-runs/layout-image-analytics-design-image-layout-v2-1778461221545`
  - `reports/e2e-runs/layout-image-kanban-design-image-layout-v2-1778461221546`
  - `reports/e2e-runs/layout-image-crm-design-image-layout-v2-1778461221547`
  - `reports/e2e-runs/layout-image-settings-design-image-layout-v2-1778461378116`
  - `reports/e2e-runs/layout-image-knowledge-design-image-layout-v2-1778461395324`
