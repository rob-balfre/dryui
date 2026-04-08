---
"@dryui/mcp": minor
"@dryui/cli": minor
---

Add AXI-inspired TOON output format for agent-optimized tool responses

- New TOON (Token-Optimized Output) format: ~40% fewer tokens than JSON for all MCP tool output
- CLI: --toon and --full flags on all commands (info, list, compose, review, diagnose, doctor, lint, detect, install)
- Content truncation: compose snippets, workspace findings, component examples capped with hints
- Pre-computed aggregates: hasBlockers, autoFixable (review), coverage % (diagnose), top-rule (workspace)
- Contextual next-step suggestions appended to every response
- Definitive empty states: issues[0]: clean, findings[0]: clean
- Structured errors with suggestions for agent consumption
- Content-first no-arg: `dryui` with no args shows project status in DryUI projects
- Ambient context hook (packages/cli/src/ambient.ts) for Claude Code session integration
- New shared module: composition-search.ts (extracted duplicated search logic from MCP and CLI)
