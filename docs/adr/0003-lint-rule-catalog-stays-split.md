# ADR-0003: Lint rule catalog stays split from lint policy

## Status

Accepted

## Context

The **Lint surface** today exposes two sibling modules in `@dryui/lint`:

- `packages/lint/src/rule-catalog.ts` — canonical rule metadata (IDs, messages, suggested fixes, ownership, golden snapshot).
- `packages/lint/src/lint-policy.ts` — enforcement decisions on top of the catalog (severity resolution, violation formatting).

A `/improve-codebase-architecture` review proposed merging `rule-catalog.ts` into `lint-policy.ts` on the hypothesis that catalog edits and severity decisions move together, so locality would improve.

Investigation showed the catalog is **not** a single-consumer module:

- `@dryui/lint/rule-catalog` is a declared subpath export in `packages/lint/package.json`.
- `packages/mcp/src/component-checker.ts`, `packages/mcp/src/theme-checker.ts`, and `packages/mcp/src/workspace-audit.ts` import directly from that subpath.
- `scripts/skill-rule-contract.ts` reads `RULE_CATALOG` for skill-rules drift detection.
- `packages/lint/src/__snapshots__/rule-catalog.txt` pins the catalog through `serializeRuleCatalog()`.
- Internal sibling consumers beyond `lint-policy` exist: `rules.ts` reads `ruleMessage`, `preprocessor.ts` reads `RULE_CATALOG` and `RuleSeverity`.

`lint-policy` is one consumer among many — not the canonical reader. The catalog and the policy have distinct release blast radii: catalog edits ripple to mcp checkers and the contract script; policy edits stay inside `@dryui/lint`.

## Decision

`rule-catalog.ts` stays split from `lint-policy.ts`. The catalog is the canonical rule metadata store; the policy is one of several consumers that adds enforcement semantics on top.

The 8-line `rule-definitions.ts` re-export shim was deleted in the same review — that change stands separately.

## Consequences

- Future architecture reviews should not re-propose merging the catalog into the policy. The catalog has multiple independent consumers and a public subpath export.
- New rule metadata edits go in `rule-catalog.ts` and may ripple to mcp consumers; severity-decision edits go in `lint-policy.ts` and stay local to `@dryui/lint`.
- If the catalog ever loses its non-policy consumers (mcp checkers, skill-rule-contract, public subpath export), this decision should be revisited.
