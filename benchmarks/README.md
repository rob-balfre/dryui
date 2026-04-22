# DryUI Benchmarks

End-to-end workflow success, not token-count golf.

## What gets measured

A benchmark task is a pinned real-world workflow: "build a settings form", "pick a date range", "drive the repair loop". For each task we measure whether an agent can ship working Svelte against DryUI's contract, under one of three knowledge modes:

- `prompt-only` — agent has the task prompt and nothing else. Baseline.
- `prompt-plus-catalog` — agent also receives the generated agent contract inline.
- `tool-calling` — agent has the contract _and_ can call `ask`, `check`, `prompt`, plus `svelte-autofixer`. The target experience.

The gap between `prompt-plus-catalog` and `tool-calling` is the value of interactive discovery plus the self-correction loop.

## Lanes

| Lane  | Trigger                            | Cost             | Scope                                          |
| ----- | ---------------------------------- | ---------------- | ---------------------------------------------- |
| smoke | every PR                           | free, no network | schema validation + deterministic local checks |
| full  | nightly (`DRYUI_BENCHMARK_LIVE=1`) | real API         | all three formats × all tasks, with artifacts  |

The smoke lane catches drift in the task manifests themselves, deterministic CLI outputs, and target-component references. The full lane measures real agent success.

## Layout

```
benchmarks/
├── README.md                # this file
├── tasks/
│   ├── schema.json          # JSON Schema for task manifests
│   └── <id>.json            # one per task, matches schema
├── formats/
│   ├── prompt-only.md
│   ├── prompt-plus-catalog.md
│   └── tool-calling.md
└── tools/
    └── dryui-tools.json     # tool list passed to the agent in tool-calling mode
```

Reports are written to:

```
reports/benchmarks/
├── latest.json              # most recent run (machine-readable)
├── latest.md                # most recent run (human-readable)
├── baseline.json            # pinned run, regression comparison target
├── history/
│   ├── smoke.jsonl          # one line per smoke run
│   └── <format>.jsonl       # one line per live run, per format
└── artifacts/
    └── <run-id>/<task>/     # per-task outputs, transcripts, tool calls
```

## Running locally

```bash
# Smoke lane (safe, no API calls)
bun run scripts/benchmark/run.ts --smoke

# Compare format pass rates side by side
bun run scripts/benchmark/compare.ts

# Pin the current run as the regression baseline
bun run scripts/benchmark/check-baseline.ts --bless

# Check for regressions vs baseline
bun run scripts/benchmark/check-baseline.ts

# Full lane — requires DRYUI_BENCHMARK_LIVE=1 and an API key
DRYUI_BENCHMARK_LIVE=1 ANTHROPIC_API_KEY=sk-ant-… \
	bun run scripts/benchmark/run.ts --format=tool-calling --model=claude-opus-4-7
```

## Metrics (full lane)

Per task, per format:

- task success rate (built + `check` clean + acceptance rules pass)
- first-pass success rate (no `check` iterations needed)
- median turns to success
- tool calls per success
- prompt tokens, completion tokens, total tokens
- wall time
- browser runtime success (where a rendered surface is part of the task)
- screenshot diff rate against the golden artifact
- accessibility pass rate (axe-core over the rendered DOM)
- component accuracy (does the produced code use the target components?)

## Adding a task

1. Copy an existing `benchmarks/tasks/<id>.json` as a starting point.
2. Rename the file so it matches the new `id`.
3. Update `claim`, `prompt`, `target_components`, `acceptance_checks`, and `budget`.
4. Run `bun run scripts/benchmark/run.ts --smoke` to confirm the manifest validates and every target component exists in `spec.json`.
5. If the task ships a golden artifact, drop it under `reports/benchmarks/artifacts/<id>/golden/…`.

## Initial task set

`cli-init-smoke`, `component-discovery`, `basic-form-composition`, `selection-workflows`, `overlay-navigation`, `date-range-workflow`, `data-display-dashboard`, `theme-docs-stability`, `feedback-loop`.
