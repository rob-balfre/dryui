# reports

Generated-output target for MCP audit artifacts.

`packages/mcp/src/architecture.ts` writes `reports/architecture-audit.md` via
`writeArchitectureArtifacts()` — a human-readable companion to
`packages/mcp/src/architecture.json` that summarises spec / docs / source
mismatches across the component graph.

The file is produced on demand (not checked into git); this directory exists as
its write target so the MCP helper can create the file without `mkdir -p`
failing from an unexpected path.
