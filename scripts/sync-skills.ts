import { $ } from 'bun';
import { readdir, exists, rm, realpath, lstat } from 'node:fs/promises';
import { join, basename, relative } from 'node:path';

const root = join(import.meta.dir, '..');
const packageSkills = join(root, 'packages', 'ui', 'skills', 'dryui');
const rootSkills = join(root, 'skills');
const claudeSkills = join(root, '.claude', 'skills');
const codexSkills = join(root, '.codex', 'skills');
const cursorRules = join(root, '.cursor', 'rules');

// Files we deliberately never copy (OS metadata, etc.)
const IGNORED_NAMES = new Set(['.DS_Store']);

async function copyDir(src: string, dest: string) {
	// If dest is a symlink, remove it first to avoid writing through it back to src
	try {
		const stat = await lstat(dest);
		if (stat.isSymbolicLink()) {
			await rm(dest);
		}
	} catch {}

	await $`mkdir -p ${dest}`;
	const entries = await readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		if (IGNORED_NAMES.has(entry.name)) continue;
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath);
		} else {
			// Skip if src and dest resolve to the same file (symlink loop guard)
			try {
				const realSrc = await realpath(srcPath);
				const realDest = await realpath(destPath);
				if (realSrc === realDest) continue;
			} catch {}
			// Read as bytes and write explicitly — avoids any lazy-file-ref quirks
			// where Bun.write(path, Bun.file(src)) can silently no-op if both refs
			// resolve to the same underlying file handle during async streaming.
			const bytes = await Bun.file(srcPath).bytes();
			await Bun.write(destPath, bytes);
		}
	}
}

async function removeStale(src: string, dest: string) {
	if (!(await exists(dest))) return;
	const entries = await readdir(dest, { withFileTypes: true });

	for (const entry of entries) {
		if (IGNORED_NAMES.has(entry.name)) continue;
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (!(await exists(srcPath))) {
			await rm(destPath, { recursive: true });
		} else if (entry.isDirectory()) {
			await removeStale(srcPath, destPath);
		}
	}
}

// --- Cursor .mdc conversion ---

function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
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

function toMdc(opts: {
	description: string;
	body: string;
	globs?: string;
	alwaysApply?: boolean;
}): string {
	const lines = ['---'];
	lines.push(`description: ${opts.description}`);
	lines.push(`globs: ${opts.globs ?? ''}`);
	lines.push(`alwaysApply: ${opts.alwaysApply ?? false}`);
	lines.push('---');
	lines.push(opts.body);
	return lines.join('\n');
}

function firstHeading(body: string): string {
	const match = body.match(/^#\s+(.+)/m);
	return match ? match[1].trim() : '';
}

async function syncSkillToCursor(skillDir: string, skillName: string, dest: string) {
	await $`mkdir -p ${dest}`;

	// Collect expected .mdc filenames so we can remove stale ones
	const expected = new Set<string>();

	// Convert SKILL.md → <skillName>.mdc (auto-attached to .svelte files)
	const skillFile = join(skillDir, 'SKILL.md');
	if (await exists(skillFile)) {
		const raw = await Bun.file(skillFile).text();
		const { meta, body } = parseFrontmatter(raw);
		const desc = meta.description || `${skillName} skill`;
		const filename = `${skillName}.mdc`;
		expected.add(filename);
		await Bun.write(
			join(dest, filename),
			toMdc({ description: desc, body, globs: '**/*.svelte', alwaysApply: false })
		);
	}

	// Convert rules/*.md → <skillName>-<rule>.mdc (agent-requested)
	const rulesDir = join(skillDir, 'rules');
	if (await exists(rulesDir)) {
		const entries = await readdir(rulesDir, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
			const raw = await Bun.file(join(rulesDir, entry.name)).text();
			const ruleName = basename(entry.name, '.md');
			const heading = firstHeading(raw);
			const desc = heading ? `${skillName}: ${heading}` : `${skillName} ${ruleName} rules`;
			const filename = `${skillName}-${ruleName}.mdc`;
			expected.add(filename);
			await Bun.write(join(dest, filename), toMdc({ description: desc, body: raw }));
		}
	}

	// Remove stale .mdc files from this skill (prefixed with skillName-)
	const existing = await readdir(dest);
	for (const file of existing) {
		if (file === '.DS_Store') continue;
		if ((file === `${skillName}.mdc` || file.startsWith(`${skillName}-`)) && !expected.has(file)) {
			await rm(join(dest, file));
		}
	}
}

// --- Post-sync verification ---

type Mismatch = { source: string; target: string; reason: string };

async function collectFiles(dir: string, base: string = dir): Promise<string[]> {
	if (!(await exists(dir))) return [];
	const out: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (IGNORED_NAMES.has(entry.name)) continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...(await collectFiles(full, base)));
		} else {
			out.push(relative(base, full));
		}
	}
	return out.sort();
}

async function verifySyncedTree(src: string, dest: string, mismatches: Mismatch[]) {
	const srcFiles = await collectFiles(src);
	const destFiles = await collectFiles(dest);

	const srcSet = new Set(srcFiles);
	const destSet = new Set(destFiles);

	for (const rel of srcFiles) {
		if (!destSet.has(rel)) {
			mismatches.push({ source: src, target: dest, reason: `missing target file: ${rel}` });
			continue;
		}
		const a = await Bun.file(join(src, rel)).bytes();
		const b = await Bun.file(join(dest, rel)).bytes();
		if (a.length !== b.length || !a.every((byte, i) => byte === b[i])) {
			mismatches.push({
				source: src,
				target: dest,
				reason: `content mismatch: ${rel} (src ${a.length}B, dest ${b.length}B)`
			});
		}
	}
	for (const rel of destFiles) {
		if (!srcSet.has(rel)) {
			mismatches.push({ source: src, target: dest, reason: `orphan target file: ${rel}` });
		}
	}
}

// 1. Sync packages/ui/skills/dryui/ → .claude/skills/dryui/ + .codex/skills/dryui/ + .cursor/rules/*.mdc
const syncedTargets: Array<{ src: string; dest: string; label: string }> = [];

if (await exists(packageSkills)) {
	const claudeDest = join(claudeSkills, 'dryui');
	const codexDest = join(codexSkills, 'dryui');

	await removeStale(packageSkills, claudeDest);
	await copyDir(packageSkills, claudeDest);
	await removeStale(packageSkills, codexDest);
	await copyDir(packageSkills, codexDest);
	await syncSkillToCursor(packageSkills, 'dryui', cursorRules);

	syncedTargets.push(
		{ src: packageSkills, dest: claudeDest, label: '.claude/skills/dryui' },
		{ src: packageSkills, dest: codexDest, label: '.codex/skills/dryui' }
	);

	console.log(
		'synced packages/ui/skills/dryui → .claude/skills/ + .codex/skills/ + .cursor/rules/'
	);
}

// 2. Sync each skill in skills/ → .claude/skills/<name>/ + .codex/skills/<name>/ + .cursor/rules/*.mdc
if (await exists(rootSkills)) {
	const entries = await readdir(rootSkills, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory() || entry.name === '.DS_Store') continue;
		const src = join(rootSkills, entry.name);
		const claudeDest = join(claudeSkills, entry.name);
		const codexDest = join(codexSkills, entry.name);

		await removeStale(src, claudeDest);
		await copyDir(src, claudeDest);
		await removeStale(src, codexDest);
		await copyDir(src, codexDest);
		await syncSkillToCursor(src, entry.name, cursorRules);

		syncedTargets.push(
			{ src, dest: claudeDest, label: `.claude/skills/${entry.name}` },
			{ src, dest: codexDest, label: `.codex/skills/${entry.name}` }
		);
	}
	console.log('synced skills/* → .claude/skills/ + .codex/skills/ + .cursor/rules/');
}

// 3. Post-sync guard — assert every target is byte-identical to its source.
// If the copy silently no-ops (the bug this guard was added to catch),
// exit non-zero with a clear report so CI and humans notice immediately.
const mismatches: Mismatch[] = [];
for (const { src, dest } of syncedTargets) {
	await verifySyncedTree(src, dest, mismatches);
}

if (mismatches.length > 0) {
	console.error('');
	console.error(`sync-skills: ${mismatches.length} post-sync mismatch(es) detected:`);
	for (const m of mismatches) {
		console.error(`  - ${relative(root, m.target)}: ${m.reason}`);
	}
	console.error('');
	console.error(
		'The sync script ran but did not leave targets byte-identical to source. ' +
			'This usually means a destination file could not be overwritten (permissions, ' +
			'a hostile file watcher restoring it, or a caching bug in the copy helper). ' +
			'Re-run `bun run sync:skills`; if it persists, investigate the listed paths manually.'
	);
	process.exit(1);
}

console.log(`sync-skills: verified ${syncedTargets.length} target tree(s) — all in sync.`);
