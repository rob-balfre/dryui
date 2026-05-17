# CLAUDE.md

Generated DryUI consumer project.

Load `skills/dryui-build/SKILL.md` before implementing or changing UI. The same DryUI skills are also copied to `.claude/skills/` for Claude Code skill discovery.

DryUI signals that should dominate the session: `@dryui/ui`, `@dryui/lint`, `src/layout.css`, DryUI theme imports, and any `data-layout` contract.

Before inventing local components, check existing DryUI components with `node skills/dryui-build/scripts/check-component.mjs --search <term>`. Keep page/section grid in `src/layout.css`, keep visual paint in app or component CSS, and do not disable DryUI lint.

For visual work, validate with screenshots at mobile, tablet, and desktop sizes. A successful route load or matching text is not visual verification.
