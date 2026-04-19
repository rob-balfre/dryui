---
'@dryui/cli': minor
---

- `dryui setup` can now run editor installs instead of only printing them. After the printed guide, the interactive flow asks "Install for me now?" and there is a non-interactive `dryui setup --editor <id> --install` for scripts. The installer pulls the DryUI skill into the editor's expected folder via `npx degit --force` and merges the canonical MCP server block into the editor's JSON config (preserving any other servers and unrelated keys). Auto-install is wired for `copilot`, `cursor`, `opencode`, `windsurf`, and `zed`. `claude-code` and `codex` keep their guide-only flow because their canonical install requires an interactive `/plugins` session in the editor itself; `claude-code`'s existing optional `dryui install-hook` step is unchanged.
