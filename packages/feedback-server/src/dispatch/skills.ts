// Skill path resolution for dispatch.
//
// `dryui-feedback` is the canonical skill the dispatched agent reads first.
// Claude reads project-local skills (so auto permission mode stays inside the
// workspace); Codex reads installed skills from `~/.agents/skills`, where
// `dryui` links local source-mode skills. Other agents follow the project
// path.

import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DispatchAgent, DispatchSkillPaths } from './agents.js';

const PROJECT_SKILL_RELATIVE = '.claude/skills/dryui-feedback/SKILL.md';
const CODEX_SKILL_RELATIVE = '.agents/skills/dryui-feedback/SKILL.md';

export const SKILL_MISSING_HINT =
	'dryui-feedback skill not installed in this project. ' +
	'Run `npx skills add rob-balfre/dryui --skill dryui-feedback`.';

export const CODEX_SKILL_MISSING_HINT =
	'dryui-feedback skill not installed for Codex. ' +
	'Run `DRYUI_DEV=1 dryui`, choose "Set up editor or agent", then choose Codex.';

function findProjectSkill(workspace: string): string | null {
	const candidate = join(workspace, PROJECT_SKILL_RELATIVE);
	return existsSync(candidate) ? candidate : null;
}

function findCodexSkill(homeDir: string): string | null {
	const candidate = join(homeDir, CODEX_SKILL_RELATIVE);
	return existsSync(candidate) ? candidate : null;
}

export function resolveFeedbackSkillPath(
	workspace: string,
	target: DispatchAgent,
	homeDir = homedir()
): string | null {
	const projectSkill = findProjectSkill(workspace);
	if (target !== 'codex') return projectSkill;
	return findCodexSkill(homeDir) ?? projectSkill;
}

export function resolveFeedbackSkillPaths(
	workspace: string,
	agents: readonly DispatchAgent[],
	homeDir = homedir()
): DispatchSkillPaths {
	const projectSkill = findProjectSkill(workspace);
	const codexSkill = findCodexSkill(homeDir);
	const skillPaths: DispatchSkillPaths = {};

	for (const agent of agents) {
		const skillPath = agent === 'codex' ? (codexSkill ?? projectSkill) : projectSkill;
		if (skillPath) skillPaths[agent] = skillPath;
	}

	return skillPaths;
}

export function missingSkillHint(target: DispatchAgent): string {
	return target === 'codex' ? CODEX_SKILL_MISSING_HINT : SKILL_MISSING_HINT;
}

/**
 * When the feedback-server runs from a dryui workspace checkout, prefer the
 * live plugin source over the marketplace install. Claude Code's
 * `--plugin-dir <path>` flag loads a plugin directly from a local tree and
 * takes precedence over the install with the same name. Override with
 * `DRYUI_PLUGIN_DIR` for ad-hoc testing.
 */
export function resolveLocalPluginDir(): string | null {
	const explicit = process.env['DRYUI_PLUGIN_DIR'];
	if (explicit) {
		return existsSync(join(explicit, '.claude-plugin', 'plugin.json')) ? explicit : null;
	}
	let dir: string;
	try {
		dir = dirname(fileURLToPath(import.meta.url));
	} catch {
		return null;
	}
	for (let i = 0; i < 8; i++) {
		const pluginDir = join(dir, 'packages', 'plugin');
		if (
			existsSync(join(pluginDir, '.claude-plugin', 'plugin.json')) &&
			existsSync(join(dir, 'packages', 'ui', 'package.json'))
		) {
			return pluginDir;
		}
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return null;
}
