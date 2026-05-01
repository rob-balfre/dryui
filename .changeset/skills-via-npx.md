---
'@dryui/cli': minor
'@dryui/feedback-server': minor
'@dryui/mcp': patch
---

Skills install via `npx skills add rob-balfre/dryui` by default.

`dryui setup --install` and `dryui init` now route the per-agent skill install through the upstream `npx skills` CLI (skills.sh standard) instead of the legacy `degit` copy. The new path supports 50+ coding agents and writes to the upstream-blessed install location for each one.

### What changed

- New default: copilot/cursor/opencode/windsurf shell out to `npx skills@^1.1.1 add rob-balfre/dryui --agent <flag> --copy --yes` during setup.
- Zed continues to use the legacy `degit` copy. `npx skills` does not yet list Zed in its supported-agents table.
- Source-of-truth: skills moved from `packages/{ui,feedback,feedback-server,cli}/skills/*` to top-level `skills/*`. Two skills renamed for skills.sh disambiguation: `init` → `dryui-init`, `live-feedback` → `dryui-live-feedback`.
- `@dryui/feedback-server` no longer embeds `dryui-feedback/SKILL.md` in its published tarball. The skill must be installed in the consumer project (via `dryui init` or `npx skills add rob-balfre/dryui --skill dryui-feedback`); dispatch precondition-checks and aborts with a clear hint if missing.

### Escape hatches

- `DRYUI_SKILLS_LEGACY=1 dryui setup --install` falls back to the legacy `degit` copy. This is a one-release escape hatch slated for removal in the next minor.
- Failures during the npx skills call (offline, missing npx) automatically fall back to the legacy `degit` copy with a one-line warning.

### Migration for existing users

- Re-run `dryui init` in your project to land the skills at the new (npx-skills-blessed) per-agent paths. Old per-agent install dirs (`.github/skills/dryui`, `.opencode/skills/dryui`, etc) are left in place; remove manually if you want a clean state.
- Plugin marketplace install paths (`claude plugin install dryui@dryui`, Codex `/plugins`) still work; they are listed under "Alternative install paths" in `skills/dryui/SKILL.md`.

See `plan.md` in the repo for the full migration log.
