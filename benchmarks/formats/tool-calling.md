# Format: tool-calling

Agent runs the full DryUI workflow: can call `ask`, `check`, `prompt`, and the CLI scaffold commands. Mirrors how a real agent session would work.

## Rationale

The target experience. Measures whether the tool loop beats a static catalog, and by how much. Gap between `prompt-plus-catalog` and `tool-calling` is the value of interactive discovery and the repair loop.

## Input

- Task prompt verbatim.
- System prompt listing available DryUI tools (contents of `benchmarks/tools/dryui-tools.json`).
- MCP connection to `@dryui/mcp` so `ask`, `check` calls go through the real server.
- `svelte-autofixer` from the Svelte MCP for Svelte-compiler-level fixes.

## Constraints

- Task budget still applies (`max_turns`, `max_tokens`, `max_seconds`).
- Task-level `allowed_tools` can narrow the available set (e.g. discovery-only tasks that block `write`).

## Artifacts

Same as `prompt-plus-catalog` plus:

- `tool-calls.jsonl` (one row per tool invocation: name, args, result, duration)
- `repair-trace.json` for tasks that use the self-correction loop
