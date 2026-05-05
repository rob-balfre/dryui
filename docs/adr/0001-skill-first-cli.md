# ADR-0001: DryUI is skill-first, not a project-detection CLI

## Status

Accepted, amended by [ADR-0002](./0002-skills-installer-owns-editor-setup.md)

## Context

DryUI previously exposed CLI commands for project detection, install planning, component lookup, token listing, prompt generation, and broad checking. Those commands made the CLI responsible for interpreting project state and prescribing implementation steps.

The project direction is now that DryUI should primarily be a set of skills. Large language models can inspect a project and apply repo-specific context from skills more flexibly than a growing CLI command surface. The CLI should not duplicate that judgment.

## Decision

Keep the DryUI CLI focused on:

- feedback tooling
- small local helpers such as `ambient` and `install-hook`

Remove public CLI routing for project detection, install planning, project bootstrapping, component lookup, token listing, prompt generation, and broad checking.

Deterministic validation should live in package-level lint/build/test commands and focused libraries, not in a broad project-aware CLI.

## Consequences

- Agents should use DryUI skills for project inspection and implementation guidance.
- The CLI help should present only supported local helper and feedback paths.
- Future architecture work should prefer deleting CLI planning surfaces over deepening them.
- If a deterministic check is still needed, it should be exposed as a focused package command or library interface rather than a catch-all `dryui` command.
