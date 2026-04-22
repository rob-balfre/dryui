# Format: prompt-only

Baseline. The agent receives the task prompt with zero DryUI-specific context: no generated catalog, no MCP tools, no setup guides. Whatever the model knows about DryUI it knows from its pretraining set.

## Rationale

Measures how much DryUI's generated infrastructure (contract, docs, MCP tools) actually improves real workflow success, vs. pure model recall. Without this lane the other two lanes have nothing to compare against.

## Input

- Task prompt verbatim.
- No system prompt additions.
- No tools.

## Expected ceiling

Low. Most tasks require knowing component names, compound shapes, and anti-patterns that are not in any public corpus.

## Artifacts

- `output.svelte` (or `output.css`, or `output.md` depending on task)
- `transcript.jsonl` of model messages
- `metrics.json` (tokens, wall time, success flag)
