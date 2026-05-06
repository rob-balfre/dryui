---
'@dryui/feedback-server': minor
---

Skills install via `npx skills add rob-balfre/dryui` by default.

`@dryui/feedback-server` no longer embeds `dryui-feedback/SKILL.md` in its published tarball. The skill must be installed in the consumer project (via `npx skills add rob-balfre/dryui` or `npx skills add rob-balfre/dryui --skill dryui-feedback`); dispatch precondition-checks and aborts with a clear hint if missing.
