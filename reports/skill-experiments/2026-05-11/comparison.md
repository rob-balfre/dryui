# Experiment Comparison

Task: `task-dashboard-page.md`

Model requested for all workers: GPT-5.5, low reasoning.

## Scores

| Variant                | Branch following | DryUI contract | Container query quality | Dashboard judgment | State coverage | Low-reasoning robustness | Total |
| ---------------------- | ---------------: | -------------: | ----------------------: | -----------------: | -------------: | -----------------------: | ----: |
| A: Branching task list |                5 |              3 |                       4 |                  4 |              4 |                        4 |    24 |
| B: Gated workflow      |                5 |              4 |                       4 |                  5 |              5 |                        5 |    28 |
| C: Decision table      |                5 |              2 |                       4 |                  4 |              4 |                        3 |    22 |

## Notes

- A tests whether explicit surface branches are enough.
- B tests whether gates reduce low-reasoning omissions.
- C tests whether compact decision tables are easier for low-reasoning agents to follow.

## Initial Hypothesis

B should be strongest for compliance because it forces a target brief and stop/fix gates. A may be easiest to read but can allow branch order mistakes. C may be shortest, but low-reasoning agents may skip details if the recipe feels optional.

## Result

B was strongest. The target brief forced the worker to classify the request as `type=page, subtype=dashboard`, and the gates carried through into the implementation plan, markup, layout CSS, and self-review. It produced the clearest dashboard hierarchy and state coverage with fewer off-contract moves than the others.

## Variant Notes

### A: Branching Task List

Strengths:

- Correctly followed Dashboard, then Full page.
- Produced a sensible region model: header, filters, metrics, chart, table, detail.
- Named the page container and used `@container analytics-dashboard`.

Weaknesses:

- The branch list did not stop the worker from drifting into guessed component APIs and `class=` usage on DryUI components.
- It used likely wrong token names such as `--dryui-space-*`.
- It treated the branches as guidance rather than a compliance gate.

### B: Gated Workflow

Strengths:

- Produced the best target classification and dashboard intent.
- Followed the no-route-layout-CSS rule most clearly.
- Included loading, empty, error, and dense-data states.
- Kept filters before affected data and made the chart the dominant region.
- Self-review was tied directly to the gates.

Weaknesses:

- Still guessed some component APIs.
- `dashboard-state` needs stronger placement guidance in non-ready states.
- Token names still need to be anchored to real `--dry-*` DryUI tokens.

### C: Decision Table

Strengths:

- Very easy to scan.
- Correctly classified the page and applied the Dashboard recipe.
- Produced a concrete, realistic dashboard shape.

Weaknesses:

- The terse recipe let the worker violate the `src/layout.css` contract by adding visual styling such as border, radius, and background.
- It added width/inline-size style decisions into layout CSS.
- It hallucinated more detailed component APIs than the other variants.

## Recommendation

Use B as the base, then borrow A's explicit target branch list as the first gate. Do not use C as-is; keep its classification table only if the table points into gated workflows rather than replacing them.

Recommended shape:

1. Target router from A.
2. Target brief gate from B.
3. Full-page layout contract from B.
4. Dashboard add-on from B.
5. Short branch recipes from A for sections, components, forms, and polish.
6. Self-review gate from B.
