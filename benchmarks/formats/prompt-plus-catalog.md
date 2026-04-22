# Format: prompt-plus-catalog

Agent receives the task prompt plus the full generated agent contract inlined as context. Still no tool use, still no ability to query MCP.

## Rationale

Isolates the value of the generated contract from the value of tool-assisted discovery. Measures whether agents can succeed when given perfect but static knowledge.

## Input

- Task prompt verbatim.
- System prompt prepended with the rendered `@dryui/mcp/agent-contract.v1.json` contract (compact mode).
- No tools.

## Expected ceiling

Mid. Agents have every component signature and anti-pattern available, but can't actively verify or iterate.

## Artifacts

Same as `prompt-only` plus:

- `context-bundle.md` (the exact catalog passed to the model)
- `context-tokens.json` (token count per section, for attribution)
