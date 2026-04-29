import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SKILL_RELATIVE_PATH = 'skills/dryui-feedback/SKILL.md';
const PROJECT_SKILL_RELATIVE = '.claude/skills/dryui-feedback/SKILL.md';

/**
 * Absolute path to the canonical `dryui-feedback` SKILL.md that ships with
 * this package — the source-of-truth artifact.
 *
 * Use {@link ensureProjectSkillCopy} for dispatch prompts: that returns a
 * path *inside* the consumer's project, which keeps the dispatched agent's
 * Read tool from triggering a permission prompt for paths outside the
 * project root (`auto` permission mode still prompts on "suspicious"
 * out-of-project reads).
 */
export function resolveDispatchSkillPath(): string | null {
	let here: string;
	try {
		here = fileURLToPath(import.meta.url);
	} catch {
		return null;
	}

	// `here` is either `<pkg>/src/skill-path.ts` or `<pkg>/dist/skill-path.js`,
	// so the package root is two levels up.
	const pkgRoot = resolve(dirname(here), '..');
	const candidate = resolve(pkgRoot, SKILL_RELATIVE_PATH);
	return existsSync(candidate) ? candidate : null;
}

/**
 * Mirror the canonical SKILL.md into `<projectRoot>/.claude/skills/dryui-feedback/`
 * and return the absolute path of the copy. Idempotent — copies only when the
 * source is newer than the destination (or the destination is missing).
 *
 * Returning a path *inside* the project keeps the dispatched agent's reads
 * within its project root, which is what `--permission-mode auto` actually
 * pre-approves. Reads of the workspace-shipped skill (outside the project)
 * still trigger a permission prompt, which is the bug we're fixing.
 *
 * Falls back to {@link resolveDispatchSkillPath} (the workspace path) when
 * the copy fails — the prompt is still useful, just with the original
 * permission-prompt friction.
 */
export function ensureProjectSkillCopy(projectRoot: string): string | null {
	const source = resolveDispatchSkillPath();
	if (!source) return null;
	const destination = resolve(projectRoot, PROJECT_SKILL_RELATIVE);

	try {
		const sourceStat = statSync(source);
		const destStat = existsSync(destination) ? statSync(destination) : null;
		const upToDate = destStat !== null && destStat.mtimeMs >= sourceStat.mtimeMs;

		if (!upToDate) {
			mkdirSync(dirname(destination), { recursive: true });
			copyFileSync(source, destination);
		}

		return destination;
	} catch {
		return source;
	}
}
