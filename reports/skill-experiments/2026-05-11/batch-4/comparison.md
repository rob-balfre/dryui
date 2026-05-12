# Batch 4 Combined Skill Experiment

Date: 2026-05-11
Model: GPT-5.5, low reasoning
Task: full analytics dashboard page concept

## Runs

| Candidate          | Instruction score |    Visual score | Result                                                                                                                                                            |
| ------------------ | ----------------: | --------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| final-candidate    |             34/40 |    not rendered | Rejected: generated unscoped `src/layout.css` selectors after the shell rule.                                                                                     |
| final-candidate-v2 |             38/40 |           24/30 | Good instruction compliance, but desktop visual harness exposed a large blank band above the primary chart when the chart region spanned beside metrics/insights. |
| final-candidate-v3 |             37/40 | 26/30 estimated | Fixed the primary-region alignment issue, but regressed to invalid `--dry-spacing-*` tokens.                                                                      |
| final-candidate-v4 |             39/40 |           27/30 | Winner: kept shell scoping, fixed primary alignment, used valid `--dry-space-*` tokens, and self-corrected a banned `:global()` example during the run.           |

## Winner

`final-candidate-v4` is the clearest winner.

Reasons:

- Page shell owns `container: analytics-dashboard / inline-size`.
- Responsive grid lives on the shell direct child.
- Region selectors are scoped under `[data-layout='analytics-dashboard-shell']`.
- Dashboard branch is explicit before markup.
- Three layout candidates are scored before selecting the winner.
- Desktop layout keeps metrics compact, chart dominant, insights useful, and table full-width.
- Spanning/adjacent desktop regions get alignment rules, avoiding the blank-chart-band issue from v2.
- CSS token guard prevents `--dry-spacing-*` hallucination and uses repo-valid `--dry-space-*`.
- Snippet gate catches imports, compound parts, grid-area parity, token spelling, and banned patterns.

## Remaining Caveats

- This is still a report-only experiment, not a compiled Svelte route.
- v4 wisely marks uncertain `Select`, `DatePicker`, and `DataGrid` prop semantics as verification-needed, but a production skill should push the agent to confirm exact props before writing final code.
- The visual screenshots are static harness previews of the generated layout shape, not live DryUI component renders.

## Artifacts

- Skill: `reports/skill-experiments/2026-05-11/batch-4/final-candidate-v4/SKILL.md`
- Output: `reports/skill-experiments/2026-05-11/batch-4/outputs/final-candidate-v4.md`
- Preview: `reports/skill-experiments/2026-05-11/batch-4/previews/final-candidate-v4-preview.html`
- Screenshots: `reports/skill-experiments/2026-05-11/batch-4/screenshots/final-candidate-v4-{mobile,tablet,desktop}.png`
