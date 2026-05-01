// Validate every SKILL.md against the npx skills spec.
//
// Checks:
//   1. Frontmatter parses cleanly (--- delimited block at top).
//   2. `name` field present, lowercase + digits + hyphens only.
//   3. `name` matches the parent directory name.
//   4. `description` present, 20..1024 chars (npx skills routing-rule budget).
//
// Exit code: 0 on clean tree, 1 on any validation failure (with per-file
// diagnostics on stderr).

import { readdir, exists } from 'node:fs/promises';
import { join, basename, relative } from 'node:path';
import { parseFrontmatter } from './_skill-frontmatter';

const root = join(import.meta.dir, '..');
const skillsRoot = join(root, 'skills');

const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;
const DESC_MIN = 20;
const DESC_MAX = 1024;

type Diagnostic = { file: string; reason: string };

const diagnostics: Diagnostic[] = [];

function report(file: string, reason: string) {
	diagnostics.push({ file: relative(root, file), reason });
}

async function validateSkill(skillMdPath: string) {
	const dirName = basename(join(skillMdPath, '..'));
	const raw = await Bun.file(skillMdPath).text();

	if (!raw.startsWith('---\n')) {
		report(skillMdPath, 'missing YAML frontmatter (file does not start with `---\\n`)');
		return;
	}

	const { meta } = parseFrontmatter(raw);

	const name = meta.name;
	if (!name) {
		report(skillMdPath, 'frontmatter missing required `name` field');
	} else {
		if (!NAME_RE.test(name)) {
			report(
				skillMdPath,
				`name "${name}" must be lowercase letters/digits/hyphens only and start with a letter or digit`
			);
		}
		if (name !== dirName) {
			report(skillMdPath, `name "${name}" does not match parent directory "${dirName}"`);
		}
	}

	const desc = meta.description;
	if (!desc) {
		report(skillMdPath, 'frontmatter missing required `description` field');
	} else {
		if (desc.length < DESC_MIN) {
			report(
				skillMdPath,
				`description is ${desc.length} chars (min ${DESC_MIN}); npx skills uses description as a routing rule, give it enough context`
			);
		}
		if (desc.length > DESC_MAX) {
			report(skillMdPath, `description is ${desc.length} chars (max ${DESC_MAX}); trim it down`);
		}
	}
}

async function findSkills(dir: string): Promise<string[]> {
	if (!(await exists(dir))) return [];
	const out: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const skillMd = join(dir, entry.name, 'SKILL.md');
		if (await exists(skillMd)) out.push(skillMd);
	}
	return out;
}

const allSkills = await findSkills(skillsRoot);

if (allSkills.length === 0) {
	console.error(`validate-skills: no SKILL.md files found under ${relative(root, skillsRoot)}/`);
	process.exit(1);
}

for (const skill of allSkills) {
	await validateSkill(skill);
}

if (diagnostics.length > 0) {
	console.error(`validate-skills: ${diagnostics.length} validation failure(s):`);
	for (const d of diagnostics) {
		console.error(`  ${d.file}: ${d.reason}`);
	}
	process.exit(1);
}

console.log(`validate-skills: ${allSkills.length} SKILL.md file(s) passed all checks.`);
