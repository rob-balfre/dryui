import { runCommand, type CommandResult } from '../run.js';

export const DRYUI_SKILLS_INSTALL_COMMAND = 'npx skills add rob-balfre/dryui';

const SETUP_DEPRECATION_LINES = [
	'dryui setup is deprecated.',
	'',
	'Setup is now owned by vercel-labs/skills.',
	`Install the DryUI skills with: ${DRYUI_SKILLS_INSTALL_COMMAND}`,
	'',
	'For feedback sessions, run: dryui feedback'
] as const;

export function getSetupDeprecationResult(): CommandResult {
	return {
		output: SETUP_DEPRECATION_LINES.join('\n'),
		error: null,
		exitCode: 0
	};
}

export async function runSetup(_args: string[]): Promise<void> {
	runCommand(getSetupDeprecationResult(), 'text');
}
