# AGENTS.md

Generated DryUI consumer project.

- Before editing UI, load `skills/dryui-build/SKILL.md`. If native skill discovery does not trigger, read that file directly.
- Treat `@dryui/ui`, `@dryui/lint`, `src/layout.css`, or DryUI theme imports as a hard signal that DryUI rules apply.
- For setup context only, use `skills/dryui-init/SKILL.md`.
- Canonical DryUI skills are vendored into `skills/`, `.agents/skills/`, `.claude/skills/`, and `.codex/skills/` so isolated Codex and Claude runs do not depend on machine-local skill installs.
- Before inventing app-local UI primitives, check DryUI components with `node skills/dryui-build/scripts/check-component.mjs --search <term>`.
- Keep route layout hooks in `src/layout.css`; keep visual styling in route/component CSS using DryUI tokens.
- For visual work, run checks plus mobile, tablet, and desktop screenshot review. HTTP 200 or text presence alone is not enough.
- Do not disable DryUI lint or add ignore comments to make a design pass. Use the recovery steps in `skills/dryui-build/SKILL.md`.
