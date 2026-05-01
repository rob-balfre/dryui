# Migrating DryUI skills to `npx skills@latest`

Owner: Rob. Drafted: 2026-05-02. Decisions locked: 2026-05-02. Status: ready for Phase 0.

## 1. Goal and non-goals

**Goal.** Replace DryUI's hand-rolled per-agent skill copier (degit + hardcoded paths in `packages/cli/src/commands/setup-installers.ts`) with the `npx skills` standard. While doing so: consolidate all skill sources into a single top-level `skills/` directory (the npx skills well-known location), rename two generically-named skills, and sunset the parallel plugin marketplace channel (`packages/plugin/`). End state: one source-of-truth tree, one install command, one channel.

**Non-goals.**

- Replacing MCP server wiring. `dryui init` keeps owning `mergeServersConfig()` and editor-specific MCP JSON merges. `npx skills` does not touch MCP config.
- Embedding skill payloads in published packages. `@dryui/feedback-server` no longer ships a SKILL.md and no longer self-heals at dispatch time. Skill source-of-truth is the GitHub repo, install via `npx skills add` (typically through `dryui init`). Dispatch precondition-checks skill presence and fails clearly if missing.
- Moving away from `dryui ask` and `dryui check`. Those are deterministic validators, not skills, and remain CLI-owned.
- Keeping `dryui setup --install` as a separate command. Folded into `dryui init`; `dryui init` becomes the only setup entry point.

## 2. Decisions (locked 2026-05-02)

| ID  | Decision                                          | Resolution                                                              | Notes                                                                                                                                                                                                            |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Source-of-truth location                          | **Consolidate to top-level `skills/`** (per Phase 0.B finding)          | Phase 2 moves all five skills out of their current package homes into the npx skills spec-blessed location.                                                                                                      |
| D2  | Plugin marketplace fate                           | **Sunset `packages/plugin/`**                                           | Removed in Phase 6. Also removes `syncSkillToCursor()` since `npx skills` covers Cursor directly.                                                                                                                |
| D3  | Symlink vs copy when shelling to `npx skills add` | `--copy` for end-user installs, default symlink for `bun run dev:link`  | End-user `node_modules` symlinks fragile across pnpm/bun store layouts and CI caches.                                                                                                                            |
| D4  | Telemetry posture                                 | Anonymous default for users; export `DISABLE_TELEMETRY=1` in our own CI | CI auto-exempted by upstream; env var makes it explicit.                                                                                                                                                         |
| D5  | Repo identity for `npx skills add`                | `rob-balfre/dryui`                                                      | Already what `setup-installers.ts:SKILL_SOURCE` uses.                                                                                                                                                            |
| D6  | Skill naming                                      | `init` → `dryui-init`, `live-feedback` → `dryui-live-feedback`          | Phase 2. Avoids generic-name collisions on skills.sh.                                                                                                                                                            |
| D7  | Phase pacing                                      | No calendar gates between phases                                        | Verify-and-proceed model. Each phase ships when its acceptance criteria pass.                                                                                                                                    |
| D8  | `feedback-server` runtime skill resolution        | **Delete `ensureProjectSkillCopy()` and `resolveDispatchSkillPath()`**  | Dispatch precondition-checks `<projectRoot>/.claude/skills/dryui-feedback/SKILL.md`. If missing, fail with a clear error pointing at `npx skills add rob-balfre/dryui --skill dryui-feedback` (or `dryui init`). |
| D9  | `dryui setup --install` fate                      | **Remove the subcommand**                                               | `dryui init` becomes the only setup entry point. Per-editor reinstall (e.g. user added Cursor later) handled by re-running `dryui init` (idempotent) or by `npx skills add` directly.                            |

## 3. Current state inventory (frozen 2026-05-02)

### 3.1 Source skills (pre-migration)

| Source path                                               | Skill name       | Supporting files                                                                                                       |
| --------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/skills/dryui/SKILL.md`                       | `dryui`          | `agents/openai.yaml`, `rules/{svelte,accessibility,composition,compound-components,native-web-transitions,theming}.md` |
| `packages/ui/skills/dryui-layout/SKILL.md`                | `dryui-layout`   | none                                                                                                                   |
| `packages/feedback/skills/live-feedback/SKILL.md`         | `live-feedback`  | none                                                                                                                   |
| `packages/feedback-server/skills/dryui-feedback/SKILL.md` | `dryui-feedback` | none                                                                                                                   |
| `packages/cli/skills/init/SKILL.md`                       | `init`           | none                                                                                                                   |

### 3.2 Generated mirrors (do not hand-edit)

- `packages/plugin/skills/{dryui-layout,init,live-feedback}/` written by `scripts/sync-skills.ts`. Goes away in Phase 6.
- `.cursor/rules/*.mdc` generated by `syncSkillToCursor()`. Goes away in Phase 6 (Cursor goes through `npx skills` like every other agent).
- `packages/feedback-server/.claude/skills/dryui-feedback/SKILL.md` git-tracked mirror used by `resolveDispatchSkillPath()`. Mirror, resolver, and runtime copier all deleted in Phase 2 (D8). Users install the skill via `npx skills add`.

### 3.3 Distribution channels (pre-migration)

| Channel               | Code path                                                                                | Agents covered                           | Fate                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Plugin marketplace    | `packages/plugin/` + `claude plugin marketplace add rob-balfre/dryui`                    | Claude Code, Codex 0.121+, Gemini        | Removed Phase 6.                                                                                            |
| degit copy            | `packages/cli/src/commands/setup-installers.ts` (`SKILL_SOURCE` L77, `copySkill()` L127) | Copilot, Cursor, Windsurf, OpenCode, Zed | Replaced by `npx skills add` Phase 3 onward.                                                                |
| Runtime dispatch copy | `packages/feedback-server/src/skill-path.ts:ensureProjectSkillCopy()`                    | Claude Code only                         | Removed Phase 2 (D8). Dispatch precondition-checks; user must run `npx skills add` (or `dryui init`) first. |

### 3.4 Validation today

- Frontmatter parsed in `scripts/sync-skills.ts:parseFrontmatter()` (L75-L91). No schema enforcement.
- Byte-equality CI check in `.github/workflows/release.yml` (L36-L69) catches drift between source and `packages/plugin/skills/` mirror. Goes away in Phase 6.
- No check that `name === dirname`. No frontmatter required-field enforcement.

## 4. Target end state

```
skills/                                      NEW. Top-level (npx skills standard well-known location).
  dryui/
    SKILL.md
    agents/openai.yaml
    rules/{accessibility,composition,compound-components,native-web-transitions,svelte,theming}.md   (6 files)
  dryui-layout/
    SKILL.md
  dryui-feedback/
    SKILL.md
  dryui-live-feedback/                       RENAMED from live-feedback
    SKILL.md
  dryui-init/                                RENAMED from init
    SKILL.md

packages/
  ui/                                        skills/ subdir removed Phase 2
  feedback/                                  skills/ subdir removed Phase 2
  feedback-server/
    src/skill-path.ts                        DELETED Phase 2 (no embed, no runtime copy) (D8)
    src/dispatch.ts                          precondition-checks <projectRoot>/.claude/skills/dryui-feedback/SKILL.md exists; clear error if missing
    skills/                                  removed Phase 2
    .claude/skills/                          removed Phase 2 (was the mirror feeding the runtime copier)
  cli/
    skills/                                  removed Phase 2
    src/commands/setup.ts                    DELETED Phase 6 (D9). dryui init is the only setup entry.
    src/commands/setup-installers.ts
      SKILL_SOURCE retained for Zed only (npx skills doesn't support Zed; per Phase 0.C)
      copySkill() retained for Zed only
      defaultRunDegit() retained for Zed only
      installSkillsViaNpx() shells `npx skills@^1.1.1 add rob-balfre/dryui --agent <agent> --copy --yes` for all other agents
      INSTALLERS dict retained (called by dryui init)
      mergeServersConfig() unchanged
  plugin/                                    DELETED Phase 6

scripts/
  sync-skills.ts                             DELETED Phase 6 (no more mirrors)
  validate-skills.ts                         NEW Phase 1. Frontmatter + name=dirname checks.
  _skill-frontmatter.ts                      NEW Phase 1. Shared YAML parser.

.cursor/                                     DELETED Phase 6 (no more .mdc generation)
.github/workflows/release.yml                sync:skills step removed Phase 6, validate:skills retained
```

**Why top-level `skills/` not `packages/skills/`:** Phase 0.B proved that `npx skills add rob-balfre/dryui --list` only finds skills in well-known locations (root `skills/`, `.claude/skills/`, `.agents/skills/`). It does not recurse into `packages/`. Top-level `skills/` is the spec-blessed location and works without any manifest or symlink.

Install flow after migration:

1. `dryui init` runs preflight (theme CSS, layout.css, vite plugin, hooks): unchanged.
2. `dryui init` shells `npx skills@^1.1.1 add rob-balfre/dryui --agent <detected> --copy --yes` for each detected editor.
3. `dryui init` runs `mergeServersConfig()` to wire MCP server entries: unchanged.

Single channel. Single source. Single command for end users.

## 5. Phased plan with explicit gates

Each phase ends at a **GATE** requiring explicit user approval before the next starts. No calendar timers (D7); gates are verify-and-proceed.

---

### Phase 0. Pre-flight verification (no code changes)

**Pre-conditions.** Section 2 decisions locked (done).

**Work streams (parallelizable).**

- **0.A Local install dry-run.** Agent: `general-purpose`. Brief: "Run `npx skills@latest add /Users/robertbalfre/dryui/packages/ui/skills/dryui --copy --yes` against a scratch dir at `/tmp/skills-dryrun-$(date +%s)`. Confirm exit 0, that `.claude/skills/dryui/SKILL.md` materializes with intact frontmatter, that the `rules/` subfolder ships, and that `agents/openai.yaml` ships. Repeat for `dryui-layout` (path `packages/ui/skills/dryui-layout`), `dryui-feedback` (path `packages/feedback-server/skills/dryui-feedback`), `live-feedback` (path `packages/feedback/skills/live-feedback`), `init` (path `packages/cli/skills/init`). Report which agents the CLI auto-detected (none should: scratch dir is empty), which target paths it wrote, and any stderr warnings. Do NOT modify any file under /Users/robertbalfre/dryui."
- **0.B Repo-level dry-run.** Agent: `general-purpose`. Brief: "From a fresh scratch dir, run `npx skills@latest add rob-balfre/dryui --list`. Report which skills the CLI discovers from the published GitHub state today against the expected list (dryui, dryui-layout, dryui-feedback, live-feedback, init). Note any name mismatches or skipped skills. This determines whether `npx skills` can crawl our scattered layout BEFORE Phase 2 consolidation, so we know whether the legacy state is publishable as a fallback during migration."
- **0.C Path drift check.** Agent: `Explore`. Brief: "Compare install paths the `npx skills` CLI writes (per its README at https://raw.githubusercontent.com/vercel-labs/skills/refs/heads/main/README.md) against targets currently hardcoded in `packages/cli/src/commands/setup-installers.ts` lines 408 (Copilot), 422 (Cursor), 435 (OpenCode), 456 (Windsurf), 489 (Zed). Build a side-by-side table. Flag any disagreement: e.g., dryui CLI writes Cursor at `.agents/skills/dryui` but `npx skills` may write Cursor at `.agents/skills/`. For each mismatch, decide whether `npx skills`' choice is acceptable. Verify Zed is supported by `npx skills` (the README's full agent list should be the source of truth). Report under 200 words with a table and a per-row verdict."

**Acceptance criteria.**

- 0.A: clean materialization for all 5 skills, no stderr noise, `rules/` and `agents/` subfolders preserved.
- 0.B: all 5 skills discovered from the GitHub state OR a documented reason why some are missed (which informs whether Phase 2 needs a top-level `skills/` index or a `.claude-plugin/marketplace.json` manifest).
- 0.C: path table with zero unresolved mismatches.

**Rollback.** None required.

**GATE 0 → 1.** User confirms dry-runs are clean. If 0.B reveals discoverability gaps, Phase 2 design absorbs the fix (e.g., add a `skills/` symlink at repo root pointing at `packages/skills/`).

**Phase 0 STATUS (executed 2026-05-02): COMPLETE. Findings absorbed:**

- **0.A green.** All 5 skills install cleanly via `npx skills@latest add <local-path> --copy --yes -a claude-code`. Frontmatter intact; supporting files (`rules/`, `agents/openai.yaml`) preserved byte-for-byte. Plan rules-count of "7" was a typo: dryui has 6 rules files (accessibility, composition, compound-components, native-web-transitions, svelte, theming). Corrected in §4.
- **0.B blocker → resolved by moving to top-level `skills/`.** Default `npx skills add rob-balfre/dryui --list` finds only 3 of 5 skills today. The CLI's recursive search prefers well-known top-level locations (`skills/`, `.claude/skills/`, `.agents/skills/`); it does not reliably descend into `packages/`. Phase 2 now consolidates to **top-level `skills/`** instead of `packages/skills/`. This also avoids any need for `.claude-plugin/marketplace.json` or symlinks.
- **0.C blockers → resolved by Zed carve-out + accept upstream paths.** Zed is NOT in the npx skills supported-agents list. Phase 3.A keeps `installSkillsViaNpx()` for all supported agents, retains `copySkill()` exclusively for Zed. Copilot/Windsurf/OpenCode write to different paths than our current `setup-installers.ts` (npx skills uses `.agents/skills/`, our installers use `.github/skills/`, `.windsurf/skills/`, `.opencode/skills/`). Trust upstream: npx skills tracks current agent conventions actively. Document the path move in Phase 4 release notes; Phase 6 cleanup leaves old-location dirs alone (users can re-run `dryui init` for a fresh install at the new locations).

---

### Phase 1. Add frontmatter validation (additive, behavior-neutral)

**Goal.** Make every future SKILL.md edit fail loudly if frontmatter drifts or `name` mismatches dirname. Pure additive. Lands BEFORE Phase 2 so the consolidation move triggers immediate validation feedback.

**Work streams (sequential).**

- **1.A Validator + shared parser.** Agent: `general-purpose`. Brief: "Create `/Users/robertbalfre/dryui/scripts/_skill-frontmatter.ts` extracting the `parseFrontmatter` helper currently in `scripts/sync-skills.ts` (L75-L91) into a shared module. Update `sync-skills.ts` to import from the new shared module. Then create `/Users/robertbalfre/dryui/scripts/validate-skills.ts` that: (1) walks `packages/*/skills/*/SKILL.md` AND top-level `skills/*/SKILL.md` (so it works during AND after Phase 2), (2) parses frontmatter via the shared module, (3) asserts `name` field is present, lowercase, hyphens only, matches parent directory name, (4) asserts `description` is present and 20-1024 chars (npx skills routing rule guidance), (5) exits 1 with per-file diagnostics if any check fails. Add `bun run validate:skills` to root `package.json`. Wire it as a precondition of `bun run sync:skills` in the same package.json. Use `node:fs` and `node:path`; do not add deps. After landing, run `bun run validate:skills` and confirm current tree passes (it should: every existing skill complies with name=dirname today)."
- **1.B CI hookup.** Agent: `general-purpose`. Brief: "After 1.A lands, edit `.github/workflows/release.yml` to invoke `bun run validate:skills` before `bun run sync:skills`. Check for pre-commit infra in the repo (`.husky/`, `lefthook.yml`, root `package.json` `simple-git-hooks` block); if present, add `bun run validate:skills` for staged SKILL.md changes. If no pre-commit infra exists, do not add one. Report where the hook landed."

**Dependencies.** 1.B blocked by 1.A.

**Acceptance criteria.**

- `bun run validate:skills` exits 0 on current tree.
- Manually breaking a SKILL.md (e.g., `name: DryUI`) and re-running causes exit 1 with a clear diagnostic.
- CI fails on a PR that introduces such a break.

**Rollback.** Revert validator commits, package.json script entry, workflow edit. No production impact.

**GATE 1 → 2.** User confirms validator runs clean and CI hookup verified.

---

### Phase 2. Consolidate sources + rename + update all references

**Goal.** Move all five skills from their current package homes into top-level `skills/`. Rename `init` → `dryui-init` and `live-feedback` → `dryui-live-feedback`. Update every internal reference. Pure refactor: no install behavior changes.

**Why top-level `skills/` (not `packages/skills/`):** Phase 0.B proved `npx skills add rob-balfre/dryui` only finds skills in well-known top-level locations. Recursive search does not reliably descend into `packages/`.

This is the highest-risk phase. Single PR, one work stream owning the whole atomic move so reference updates land in the same commit as the file moves.

**Work streams (sequential, single owner).**

- **2.A Design the move.** Agent: `Plan`. Brief: "Design the consolidation move from scattered `packages/*/skills/` to top-level `skills/`. Specifically map: (1) every source path → new path. (2) Every reference to update with file:line locations. Search the codebase for: `packages/ui/skills`, `packages/feedback/skills`, `packages/feedback-server/skills`, `packages/cli/skills`, `packages/plugin/skills`, `name: init`, `name: live-feedback`, the strings `live-feedback` and `\binit\b` in skill-related contexts. Known reference sites from the audit: `packages/cli/src/commands/setup-installers.ts:77` (SKILL_SOURCE), `packages/cli/agents/dryui-layout.md`, `packages/cli/agents/feedback.md`, `packages/feedback-server/src/skill-path.ts:resolveDispatchSkillPath()`, `packages/mcp/src/ai-surface.ts`, `packages/mcp/src/spec.json`, `packages/mcp/src/contract.v1.json`, `packages/mcp/src/agent-contract.v1.json`, `scripts/sync-skills.ts`. (3) Frontmatter `name:` field updates for the two renamed skills. (4) DELETE `packages/feedback-server/src/skill-path.ts` entirely (`resolveDispatchSkillPath()` and `ensureProjectSkillCopy()`) per D8. Update `packages/feedback-server/src/dispatch.ts` to precondition-check `<projectRoot>/.claude/skills/dryui-feedback/SKILL.md` exists; if missing, fail the dispatch with a clear error message: `dryui-feedback skill not installed. Run: npx skills add rob-balfre/dryui --skill dryui-feedback (or run: dryui init for full project setup)`. Delete the git-tracked mirror at `packages/feedback-server/.claude/skills/dryui-feedback/`. Output: a single ordered task list (do this, then this) the implementation agent can follow without judgment calls."
- **2.B Execute the move.** Agent: `general-purpose`. Brief: depends on 2.A output. "Execute the move plan from 2.A in a single PR. Use `git mv` for every file move so history is preserved. Update every reference site identified in 2.A. Update frontmatter `name:` fields for `dryui-init` and `dryui-live-feedback`. Rename their parent dirs to match. Delete `packages/feedback-server/src/skill-path.ts` and the `packages/feedback-server/.claude/skills/` mirror (per D8). Update `packages/feedback-server/src/dispatch.ts` with the precondition-check from 2.A. After all moves: run `bun run validate:skills` (must pass), `bun test` across all packages (must pass), `bun run vm:test` (must produce a working SvelteKit + DryUI install). Verify the published `@dryui/feedback-server` package no longer ships any SKILL.md: `cd packages/feedback-server && bun pack` and inspect the tarball. Do NOT change `dryui init` install behavior in this PR; the legacy `copySkill()` still runs, now reading from `skills/dryui/` after `SKILL_SOURCE` is updated to `rob-balfre/dryui/skills/dryui`. The dispatch precondition-check is the only behavior change. Report diff stats and any test that broke."

**Dependencies.** 2.B blocked by 2.A.

**Acceptance criteria.**

- All source skills live under top-level `skills/`. Old `packages/{ui,feedback,feedback-server,cli}/skills/` directories deleted.
- `dryui-init` and `dryui-live-feedback` named correctly in both dir name and frontmatter.
- `bun run validate:skills` passes.
- `bun test` passes across all packages.
- `bun run vm:test` produces a working install (legacy `copySkill()` flow against the new `SKILL_SOURCE` of `rob-balfre/dryui/skills/dryui`).
- `feedback-server` dispatch fails cleanly with a clear error (pointing at `npx skills add` / `dryui init`) when the `dryui-feedback` skill is missing from `<projectRoot>/.claude/skills/`. After running `dryui init` in the VM, dispatch succeeds. Verified in VM smoke.
- `packages/feedback-server/src/skill-path.ts` and the git-tracked `.claude/skills/` mirror both deleted. `bun pack` of `@dryui/feedback-server` shows no SKILL.md in the tarball.
- Git history preserved (verified by `git log --follow skills/dryui/SKILL.md` showing pre-move commits).

**Rollback.** Single revert of the move PR. Atomic.

**GATE 2 → 3.** User runs `bun run vm:test` and verifies the install works post-consolidation. Crucially: legacy install path is the only path active here, so we are testing that the move did not break what already worked.

---

### Phase 3. Wire `npx skills add` into `dryui init` (env-flagged opt-in)

**Goal.** Land the `npx skills`-backed install path next to the existing `copySkill()` legacy path, gated by `DRYUI_SKILLS_VIA_NPX=1`. Zero default-behavior change. Lets us validate the new path against real installs before flipping.

**Work streams (sequential within phase).**

- **3.A Design the seam.** Agent: `Plan`. Brief: "Design the integration in `packages/cli/src/commands/setup-installers.ts` where `copySkill()` is currently called per agent (lines 408, 422, 435, 456, 489). Add `installSkillsViaNpx(agentFlag, ctx)` shelling `npx skills@^1.1.1 add rob-balfre/dryui --agent <agentFlag> --copy --yes` via `node:child_process spawn`, capturing stderr, surfacing nonzero exits with the agent name in the error. Map our internal agent identifiers to `npx skills` `--agent` flag values per the Phase 0.C drift table. **Zed carve-out (per Phase 0.C): Zed is NOT supported by npx skills. Always use `copySkill()` for Zed regardless of env var.** Pin npx skills to `^1.1.1` to avoid surprise breaks. Gate the new code path behind `process.env.DRYUI_SKILLS_VIA_NPX === '1'`; otherwise call the existing `copySkill()`. Spell out fallback behavior on offline failure: log a warning, fall through to legacy `copySkill()`. Output: ordered diff plan (file:line ranges, new function signatures), Vitest spec list under `packages/cli/test/setup-installers-npx.test.ts` including a Zed-always-uses-copySkill test."
- **3.B Implement the seam.** Agent: `general-purpose`. Brief: depends on 3.A. "Apply the diff plan from 3.A. Add Vitest specs under `packages/cli/test/setup-installers-npx.test.ts` mocking `child_process.spawn`, asserting the right `--agent` flag per installer, and verifying env-var gating. Run `bun test packages/cli` and report. Do not break any existing test."
- **3.C Source Mode docs.** Agent: `general-purpose`. Brief: "Edit `/Users/robertbalfre/dryui/README.md` Source Mode section to document `DRYUI_SKILLS_VIA_NPX=1` as the new opt-in install path. Note this is currently behind a flag pending Phase 5 default flip. Add a `bun run dev:link:npx` script that exports the env var and runs the existing `dev:link` for testing."

**Dependencies.** 3.B blocked by 3.A. 3.C parallel with 3.B.

**Acceptance criteria.**

- `DRYUI_SKILLS_VIA_NPX=1 dryui init` in a scratch SvelteKit project lands all five skills in correct per-agent dirs with intact frontmatter, `rules/` subfolder, and `agents/` subfolder.
- `dryui init` without env var produces byte-identical output to pre-Phase-3 release (regression baseline captured during Phase 0).
- All Vitest specs pass.

**Rollback.** Single revert of the gating commit. Env var defaults to off; no user impact.

**GATE 3 → 4.** User runs `DRYUI_SKILLS_VIA_NPX=1 bun run vm:test` and confirms install lands cleanly in microVM. Without VM verification, do not proceed.

---

### Phase 4. Update docs to lead with `npx skills add`

**Goal.** Every external doc surface leads with `npx skills add rob-balfre/dryui`. Plugin marketplace and degit instructions move under `### Alternative install paths` (Phase 6 will delete plugin marketplace entirely; for now it stays as fallback documentation).

**Work streams (parallelizable).**

- **4.A Skill bodies.** Agent: `general-purpose`. Brief: "Edit `skills/dryui/SKILL.md` lines around the install table (was L235-L241 pre-consolidation; verify post-Phase-2 location). Add `npx skills add rob-balfre/dryui` as the primary install command for all agents. Move existing degit and plugin-marketplace commands under `### Alternative install paths`. Run `bun run validate:skills` to confirm description-length budget still holds."
- **4.B `apps/docs/src/lib/ai-setup.ts`.** Agent: `general-purpose`. Brief: "Read `/Users/robertbalfre/dryui/apps/docs/src/lib/ai-setup.ts`. It hosts editor-setup snippets shown on dryui.dev/tools. Add `npx skills add rob-balfre/dryui` as the lead install command for every agent the npx skills CLI supports (per Phase 0.C agent map). Keep MCP server JSON snippets exactly as-is. Verify with `bun --filter docs check`."
- **4.C `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`.** Agent: `general-purpose`. Brief: "Per the user's terse-pointer-doc style: in `AGENTS.md` and `CLAUDE.md`, add ONE bullet under skills pointing to the new install command. Do not embed snippets. In `CONTRIBUTING.md`, add a 'Skills' subsection: source of truth lives under top-level `skills/`, validation runs via `bun run validate:skills`, distribution via `npx skills add rob-balfre/dryui`."
- **4.D `packages/cli/agents/*.md`.** Agent: `general-purpose`. Brief: "These two pointer files (`dryui-layout.md`, `feedback.md`) currently say 'Read the canonical skill at packages/...'. Update each to also mention installable via `npx skills add rob-balfre/dryui --skill <name>`. Update the canonical-path pointer to reflect Phase 2 consolidation (`skills/dryui-layout/SKILL.md`, `skills/dryui-feedback/SKILL.md`)."

**Acceptance criteria.**

- Every doc surface leads with `npx skills add rob-balfre/dryui`.
- `bun run validate:skills` and the docs `check` script both pass.
- Manual smoke: open dryui.dev/tools locally via `bun run dev`, screenshot the Install section per editor.

**Rollback.** Pure docs revert.

**GATE 4 → 5.** User reviews dryui.dev/tools in browser and approves new ordering.

---

### Phase 5. Flip default to `npx skills`

**Goal.** Make `npx skills add` the default install path in `dryui init`. Legacy `copySkill()` remains reachable via `DRYUI_SKILLS_LEGACY=1` for one release as escape hatch.

**Work streams.**

- **5.A Flip the gate.** Agent: `general-purpose`. Brief: "In `packages/cli/src/commands/setup-installers.ts`, change gating from `if (process.env.DRYUI_SKILLS_VIA_NPX === '1')` to `if (process.env.DRYUI_SKILLS_LEGACY !== '1')` so npx skills becomes default. Update Vitest specs accordingly. Update `README.md` Source Mode section to reflect the flip and note that `DRYUI_SKILLS_LEGACY=1` is a one-release escape hatch slated for removal in Phase 6."
- **5.B Release notes.** Agent: `general-purpose`. Brief: "Draft a release-notes entry under `RELEASING.md` (or wherever release notes live; check). Title: 'Skills install via `npx skills`'. Bullet: user-facing change, legacy escape hatch, link to install docs. Under 150 words."
- **5.C VM smoke test.** Agent: `general-purpose`. Brief: "Run `bun run vm:test` end-to-end. Verify resulting project has dryui skills installed via npx skills (look for `--copy` signature: regular file rather than symlink) in the correct agent dir. Per project memory: do NOT use `bunx @dryui/cli`; use the local workspace build per the smolvm flow. Capture output and report any warnings."

**Dependencies.** 5.B and 5.C parallel with 5.A.

**Acceptance criteria.**

- Default `dryui init` (no env vars) installs via `npx skills`.
- `DRYUI_SKILLS_LEGACY=1 dryui init` still works and produces pre-Phase-3 output.
- VM smoke green.
- Release notes drafted.

**Rollback.** Single revert of the flip commit.

**GATE 5 → 6.** Phase 5 PR merged, VM smoke green. Proceed immediately to Phase 6.

---

### Phase 6. Cleanup: delete legacy, plugin marketplace, sync machinery

**Goal.** Single channel. Single source. Single command. Delete every parallel install path.

**Work streams (parallelizable except where noted).**

- **6.A Delete `copySkill()` and `DRYUI_SKILLS_LEGACY` for npx-supported agents only.** Agent: `general-purpose`. Brief: "In `packages/cli/src/commands/setup-installers.ts`: delete the `DRYUI_SKILLS_LEGACY` gate. **KEEP `SKILL_SOURCE`, `copySkill()`, `defaultRunDegit()` because Zed still uses them (per Phase 0.C: Zed is not supported by npx skills).** Update `SKILL_SOURCE` to point at the new `rob-balfre/dryui/skills/dryui` path. Delete only the Vitest specs that tested the legacy path for npx-supported agents; keep the Zed specs. Run `bun test packages/cli` and `bun run vm:test`. Report any regression."
- **6.B Delete `packages/plugin/`.** Agent: `general-purpose`. Brief: "Delete `packages/plugin/` directory entirely. Remove plugin from root `package.json` workspaces array, `bun.lock` (will rewrite on `bun install`), any `tsconfig.json` references, any CI matrix entries. Search for `@dryui/plugin` references and remove. Update `skills/dryui/SKILL.md` install table to drop the `claude plugin marketplace add` line and the Codex `/plugins` line (Codex 0.121+ users can use `npx skills` like everyone else). Update `apps/docs/src/lib/ai-setup.ts` to drop plugin marketplace install snippets."
- **6.C Delete `scripts/sync-skills.ts` and Cursor mirror.** Agent: `general-purpose`. Brief: "Delete `scripts/sync-skills.ts` (no more plugin mirror needed). Delete `bun run sync:skills` script entry from root `package.json`. Delete the `sync:skills` step from `.github/workflows/release.yml`. Keep `validate:skills` and `_skill-frontmatter.ts`. Delete `.cursor/rules/` directory and any `syncSkillToCursor()` references. Run `bun install && bun run validate:skills && bun test` and confirm green."
- **6.D Delete `dryui setup --install` subcommand (D9).** Agent: `general-purpose`. Brief: "Remove the `dryui setup` subcommand entirely. Delete `packages/cli/src/commands/setup.ts` (or wherever the `setup` command is registered), its tests, and its CLI router registration. The `INSTALLERS` dict at `setup-installers.ts:L537-545` is still consumed by `dryui init`, so keep the dict but delete only the `setup` command wrapper. Update `skills/dryui/SKILL.md` to remove every `dryui setup --install` reference. Update `README.md` and `apps/docs/src/lib/ai-setup.ts` similarly. Run `bun test packages/cli` and `bun run vm:test` to confirm `dryui init` still does everything users need (preflight + per-agent install + MCP wiring)."
- **6.E Doc scrub.** Agent: `general-purpose`. Brief: "After 6.A through 6.D land, scrub all references to `DRYUI_SKILLS_LEGACY`, `DRYUI_SKILLS_VIA_NPX`, the legacy degit install path, plugin marketplace install commands, and `bun run sync:skills` from `README.md`, `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `apps/docs/src/lib/ai-setup.ts`, every SKILL.md install section, and any other surface returned by `rg 'DRYUI_SKILLS|degit.*rob-balfre/dryui|plugin marketplace add|sync:skills'`. Make `npx skills add rob-balfre/dryui` the only documented install path."

**Dependencies.** 6.E blocked by 6.A through 6.D. 6.A through 6.D parallelize.

**Acceptance criteria.**

- `rg 'DRYUI_SKILLS|degit.*rob-balfre/dryui|plugin marketplace add|sync:skills|dryui setup'` returns zero hits.
- `packages/plugin/`, `scripts/sync-skills.ts`, `.cursor/rules/` all gone. (`packages/feedback-server/.claude/skills/` and `src/skill-path.ts` were already deleted in Phase 2.)
- `dryui setup --install` subcommand removed; `dryui init` is the only setup entry point.
- `bun install && bun run validate:skills && bun test && bun run vm:test` all green.
- One channel: `npx skills add rob-balfre/dryui` (Zed: still uses degit copySkill until upstream npx skills supports Zed). One source: top-level `skills/`. One setup command: `dryui init`.

**Rollback.** Per work stream: revert. 6.B (plugin deletion) is the highest-blast-radius revert since it touches workspace config; verify on a branch first.

**GATE 6 → done.** User signs off on cleanup. Migration complete.

## 6. Risks and mitigations

| Risk                                                                                                                       | Likelihood                        | Mitigation                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx skills add rob-balfre/dryui --list` does not discover our scattered layout pre-Phase-2                                | CONFIRMED Phase 0.B               | Resolved by Phase 2 consolidation to **top-level `skills/`** (not `packages/skills/`). Default `npx skills` discovery looks at well-known top-level paths only.                                                                                                           |
| `npx skills` writes to a different per-agent path than current `copySkill()` (e.g. `.agents/skills/` vs `.github/skills/`) | CONFIRMED Phase 0.C               | Trust upstream paths; document the move in Phase 4 release notes. Old-location dirs left in place; users re-run `dryui init` for fresh install at new locations.                                                                                                          |
| Zed users lose skill install when `copySkill()` is removed                                                                 | CONFIRMED Phase 0.C               | Zed not supported by npx skills. Phase 3.A keeps `installSkillsViaNpx()` for all other agents but retains `copySkill()` exclusively for Zed. Phase 6.A keeps `SKILL_SOURCE`+`copySkill()`+`defaultRunDegit()` until upstream npx skills adds Zed.                         |
| Standalone `@dryui/feedback-server` users (no `dryui init`) hit failed dispatch                                            | Medium                            | Dispatch precondition-check shows clear error pointing at `npx skills add rob-balfre/dryui --skill dryui-feedback`. Document the prerequisite in `@dryui/feedback-server` README. Self-contained dispatch deliberately sacrificed for single-source-of-truth purity (D8). |
| Symlink behavior breaks on Windows (default of `npx skills`)                                                               | Low for our use (`--copy` always) | We pass `--copy` in `installSkillsViaNpx()`. Windows users get regular files.                                                                                                                                                                                             |
| `npx skills` upstream breaks compat (renames flags, changes paths)                                                         | Low                               | Pin `skills@^1.1.1` in `installSkillsViaNpx()`. Bump deliberately.                                                                                                                                                                                                        |
| Plugin marketplace users break in Phase 6 deletion                                                                         | Medium                            | Phase 5 release notes warn the plugin marketplace is going away. Phase 6 release notes confirm it's gone. Users on plugin marketplace must migrate to `npx skills add rob-balfre/dryui`. Acceptable per D2.                                                               |
| Drift between SKILL.md install instructions and reality                                                                    | High without validation           | Phase 1 validator catches name/dirname drift. Description length cap surfaces over-long install blurbs.                                                                                                                                                                   |
| `git mv` history preservation fails on Phase 2 because of subsequent edits                                                 | Low                               | Single PR with moves and reference updates separate commits inside the PR. `git log --follow` verification in 2.B acceptance.                                                                                                                                             |

## 7. Rollback plan (per phase)

- Phase 0: nothing to roll back.
- Phase 1: revert validator commits. No production impact.
- Phase 2: revert the consolidation PR. Atomic. Restores `skill-path.ts`, the `.claude/skills/` mirror, and the runtime copier; dispatch self-heals as it did before.
- Phase 3: revert gating commit. Env var defaults to off; no user impact.
- Phase 4: revert docs commits. Channels still work; only display order changes.
- Phase 5: revert flip commit. Default returns to legacy.
- Phase 6: per work stream revert. 6.B (plugin deletion) highest blast radius; verify on branch first.

Each phase commits as a single squashed PR per work stream so reverts are surgical.

## 8. Open questions

All resolved 2026-05-02:

- **Q1 → D8.** `feedback-server` no embed, no self-heal. `skill-path.ts` deleted in Phase 2; `dispatch.ts` precondition-checks skill presence and fails clearly if missing.
- **Q2 → D9.** `dryui setup --install` removed in Phase 6.D. `dryui init` is the only setup entry point.

## 9. Agent team roster

| Agent type        | Used in                                                      | Why                                                                  |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `Explore`         | 0.C                                                          | Read-only path-drift comparison.                                     |
| `Plan`            | 2.A, 3.A                                                     | Architecture design for consolidation move and npx integration seam. |
| `general-purpose` | 0.A, 0.B, 1.A, 1.B, 2.B, 3.B, 3.C, 4.A-4.D, 5.A-5.C, 6.A-6.E | Multi-step refactor and docs work across the monorepo.               |

`dryui-layout`, `feedback`, `svelte:svelte-file-editor`, `claude-code-guide` are not needed.

## 10. Definition of done

- Source of truth: top-level `skills/` only. Five skills: `dryui`, `dryui-layout`, `dryui-feedback`, `dryui-live-feedback`, `dryui-init`.
- Distribution: `npx skills add rob-balfre/dryui` only. No plugin marketplace, no degit fallback, no embedded SKILL.md in `@dryui/feedback-server`.
- Setup entry point: `dryui init` only. No `dryui setup --install` subcommand.
- `dryui init` shells `npx skills@^1.1.1 add` for each detected agent, then runs `mergeServersConfig()` for MCP wiring.
- `bun run validate:skills` exists, runs clean, gates CI.
- All public docs (SKILL.md install sections, ai-setup.ts, AGENTS.md, CLAUDE.md, dryui.dev/tools) lead with `npx skills add rob-balfre/dryui` exclusively.
- `rob-balfre/dryui` appears on the skills.sh leaderboard.
- `packages/plugin/`, `scripts/sync-skills.ts`, `.cursor/rules/`, `packages/feedback-server/.claude/skills/`, `packages/feedback-server/src/skill-path.ts` all deleted.
- Legacy `copySkill()`, `DRYUI_SKILLS_LEGACY`, `DRYUI_SKILLS_VIA_NPX` all gone.
- `feedback-server` dispatch precondition-checks skill presence and fails with a clear install-hint error if missing.
- `bun run vm:test` green end-to-end.
- Git history preserved through `git log --follow` for every moved skill.
