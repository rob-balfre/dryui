# ADR-0002: Skills installer owns editor setup

## Status

Accepted

## Context

DryUI's product surface is skill-first. ADR-0001 kept `dryui setup` as a small CLI surface for skill and editor setup while removing broader project detection and install planning from the CLI.

DryUI now uses the `vercel-labs/skills` installer as the canonical way to install DryUI skills into supported agents:

```bash
npx skills add rob-balfre/dryui
```

Keeping editor setup logic inside DryUI means the CLI must continue tracking each editor's skill folders, plugin paths, MCP config shape, fallback paths, and probe behavior. That duplicates responsibility now owned by the skills installer and makes DryUI responsible for churn outside its component, token, lint, and feedback domains.

## Decision

The skills installer owns skill and editor setup. DryUI documentation should direct users to `npx skills add rob-balfre/dryui` for installing DryUI skills.

The DryUI CLI should no longer grow or maintain editor setup flows. If the `dryui setup` command remains for compatibility, it should be a small deprecation stub that points users to the skills installer and to still-supported DryUI commands such as `dryui feedback`.

DryUI may still document or provide tooling for DryUI-specific feedback workflows, because feedback capture, storage, and dispatch are DryUI-owned behavior.

## Consequences

- `dryui setup` is legacy. Do not deepen or expand it.
- Editor-specific skill installation logic should be deleted from DryUI rather than refactored into a new module.
- Documentation, skills, generated contracts, and llms surfaces should not advertise `dryui setup` as the install path.
- Future setup work should go through `vercel-labs/skills` unless the behavior is specifically about DryUI feedback tooling.
