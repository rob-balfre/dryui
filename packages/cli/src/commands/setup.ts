import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { getFlag, hasFlag, isInteractiveTTY, printCommandHelp } from '../run.js';
import { runInstallHook } from './install-hook.js';
import { runFeedback } from './feedback.js';
import { runLauncher } from './launcher.js';
import {
	getSetupGuide,
	setupGuideIds,
	type SetupGuide,
	type SetupGuideId
} from './setup-guides.js';

function isSetupGuideId(value: string): value is SetupGuideId {
	return setupGuideIds.includes(value as SetupGuideId);
}

function formatGuide(guide: SetupGuide): string {
	const lines = [guide.label, '', guide.description, ''];

	for (const [index, section] of guide.sections.entries()) {
		lines.push(`${index + 1}. ${section.title}`);
		if (section.note) {
			lines.push(`   ${section.note}`);
		}
		for (const line of section.code.split('\n')) {
			lines.push(`   ${line}`);
		}
		lines.push('');
	}

	lines.push(`Follow-up: ${guide.followUp}`);
	return lines.join('\n').trimEnd();
}

function setupHelp(exitCode = 0): never {
	printCommandHelp(
		{
			usage: `dryui setup [--editor <${setupGuideIds.join('|')}>] [--claude-hook] [--open-feedback] [--no-open]`,
			description: [
				'Interactive onboarding for DryUI editor integration and feedback tooling.',
				'In a TTY, this command asks which editor or agent to wire and optionally opens feedback tooling.',
				'Without a TTY, use --editor and/or --open-feedback for deterministic output.'
			],
			options: [
				'  --editor <id>     Print setup steps for one editor or agent',
				'  --claude-hook     Run `dryui install-hook` after the Claude guide',
				'  --open-feedback   Open feedback tooling after printing setup steps',
				'  --no-open         When opening feedback, print the URL instead of opening the browser'
			],
			examples: [
				'  dryui setup',
				'  dryui setup --editor codex',
				'  dryui setup --editor claude-code --claude-hook',
				'  dryui setup --open-feedback --no-open'
			]
		},
		exitCode
	);
}

async function promptChoice(
	rl: ReturnType<typeof createInterface>,
	question: string,
	options: readonly { label: string; value: string }[]
): Promise<string> {
	while (true) {
		console.log(question);
		for (const [index, option] of options.entries()) {
			console.log(`  ${index + 1}. ${option.label}`);
		}
		const answer = (await rl.question('> ')).trim();
		const numeric = Number(answer);
		if (Number.isInteger(numeric) && numeric >= 1 && numeric <= options.length) {
			return options[numeric - 1]!.value;
		}
		const direct = options.find((option) => option.value === answer);
		if (direct) return direct.value;
		console.log('Choose one of the listed numbers or ids.');
		console.log('');
	}
}

async function promptYesNo(
	rl: ReturnType<typeof createInterface>,
	question: string,
	defaultValue = false
): Promise<boolean> {
	const suffix = defaultValue ? ' [Y/n] ' : ' [y/N] ';
	while (true) {
		const answer = (await rl.question(`${question}${suffix}`)).trim().toLowerCase();
		if (!answer) return defaultValue;
		if (answer === 'y' || answer === 'yes') return true;
		if (answer === 'n' || answer === 'no') return false;
		console.log('Answer yes or no.');
	}
}

async function maybeOpenFeedback(args: string[]): Promise<void> {
	const launcherArgs = hasFlag(args, '--no-open') ? ['--no-open'] : [];
	const launched = await runLauncher(launcherArgs);
	if (launched) return;
	await runFeedback(['ui', ...launcherArgs]);
}

function maybeRunClaudeHook(args: string[]): never | void {
	if (!hasFlag(args, '--claude-hook')) return;
	runInstallHook([]);
}

async function runInteractiveSetup(args: string[]): Promise<void> {
	const rl = createInterface({ input, output });
	try {
		console.log('DryUI setup');
		console.log('');

		let continueEditors = true;
		while (continueEditors) {
			const editor = await promptChoice(rl, 'Which editor or agent do you want to wire?', [
				...setupGuideIds.map((id) => ({
					label: getSetupGuide(id).label,
					value: id
				})),
				{ label: 'Skip editor setup', value: 'skip' }
			]);
			console.log('');

			if (editor === 'skip') {
				break;
			}

			if (isSetupGuideId(editor)) {
				const guide = getSetupGuide(editor);
				console.log(formatGuide(guide));
				console.log('');

				if (editor === 'claude-code') {
					const installHook = await promptYesNo(
						rl,
						'Install the Claude SessionStart hook now?',
						false
					);
					if (installHook) {
						runInstallHook([]);
					}
				}
			}

			continueEditors = await promptYesNo(rl, 'Do you want setup steps for another editor?', false);
			console.log('');
		}

		const openFeedback = await promptYesNo(rl, 'Do you want to open feedback now?', false);
		if (openFeedback) {
			rl.close();
			await maybeOpenFeedback(args);
			return;
		}

		console.log('Next steps:');
		console.log('  dryui init my-app');
		console.log('  dryui install .');
		console.log('  dryui detect .');
		console.log('  dryui feedback ui');
		process.exit(0);
	} finally {
		rl.close();
	}
}

export async function runSetup(args: string[]): Promise<void> {
	if (hasFlag(args, '--help') || hasFlag(args, '-h')) {
		setupHelp();
	}

	const editor = getFlag(args, '--editor');
	if (editor) {
		if (!isSetupGuideId(editor)) {
			console.error(`Unknown editor: ${editor}`);
			process.exit(1);
		}
		console.log(formatGuide(getSetupGuide(editor)));
		maybeRunClaudeHook(args);
		if (hasFlag(args, '--open-feedback')) {
			await maybeOpenFeedback(args);
			return;
		}
		process.exit(0);
	}

	if (!isInteractiveTTY()) {
		if (hasFlag(args, '--open-feedback')) {
			await maybeOpenFeedback(args);
			return;
		}
		setupHelp();
	}

	await runInteractiveSetup(args);
}
