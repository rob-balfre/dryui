// Shared YAML frontmatter parser for SKILL.md files. Used by
// validate-skills.ts (Phase 1 of the npx skills migration). The legacy
// sync-skills.ts consumer was removed in Phase 6.

export type Frontmatter = { meta: Record<string, string>; body: string };

export function parseFrontmatter(content: string): Frontmatter {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { meta: {}, body: content };
	const meta: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx > 0) {
			const key = line.slice(0, idx).trim();
			const val = line
				.slice(idx + 1)
				.trim()
				.replace(/^['"]|['"]$/g, '');
			meta[key] = val;
		}
	}
	return { meta, body: match[2] };
}
