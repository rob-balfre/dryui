import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { emitKeypressEvents } from 'node:readline';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
	detectPackageManagerFromEnv,
	detectProject,
	type DryuiPackageManager
} from '@dryui/mcp/project-planner';
import {
	emitCommandResult,
	getFlag,
	hasFlag,
	homeRelative,
	isInteractiveTTY,
	printCommandHelp,
	runCommand,
	type CommandResult
} from '../run.js';
import { getDetect } from './detect.js';
import { getFeedbackUiResult } from './feedback.js';
import { runInit } from './init.js';
import { getInstallHookResult } from './install-hook.js';
import { getInstall } from './install.js';
import { runLauncher } from './launcher.js';
import {
	getSetupGuide,
	setupGuideIds,
	type SetupGuide,
	type SetupGuideId
} from './setup-guides.js';
import type { Spec } from './types.js';

type MainMenuValue = 'setup' | 'feedback' | 'init' | 'install' | 'detect' | 'exit';
type EditorMenuValue = SetupGuideId | 'back' | 'exit';
type FeedbackMenuValue = 'open' | 'print' | 'back' | 'exit';
type PackageManagerMenuValue = DryuiPackageManager | 'back' | 'exit';
type PostGuideValue = 'again' | 'main' | 'exit';
type InitTargetStatus = { kind: 'confirm' | 'error'; message: string };

interface SelectOption<T extends string> {
	label: string;
	value: T;
	description?: string;
}

interface SelectPromptOptions {
	contextLines?: readonly string[];
	footer?: string;
	initialIndex?: number;
}

let keypressInitialized = false;

function requireTTY(): void {
	if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
		throw new Error('Interactive input requires a TTY.');
	}
}

function handleReadlineError(error: unknown): never {
	if (error && typeof error === 'object' && 'code' in error && error.code === 'ABORT_ERR') {
		process.exit(130);
	}
	throw error;
}

const ANSI = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	cyan: '\x1b[38;5;45m',
	sky: '\x1b[38;5;117m',
	gold: '\x1b[38;5;221m',
	mint: '\x1b[38;5;121m',
	slate: '\x1b[38;5;110m',
	white: '\x1b[97m',
	black: '\x1b[30m',
	bgCyan: '\x1b[48;5;45m'
} as const;

const MAIN_MENU_OPTIONS: readonly SelectOption<MainMenuValue>[] = [
	{
		label: 'Set up editor or agent',
		value: 'setup',
		description: 'Choose Claude, Codex, Copilot, Cursor, Windsurf, or Zed.'
	},
	{
		label: 'Start feedback session',
		value: 'feedback',
		description: 'Open the feedback dashboard or print its URL.'
	},
	{
		label: 'Bootstrap a new project',
		value: 'init',
		description: 'Choose a project name/path and package manager, then run `dryui init`.'
	},
	{
		label: 'Print install plan for current folder',
		value: 'install',
		description: 'Inspect what DryUI would change before installing.'
	},
	{
		label: 'Detect current project setup',
		value: 'detect',
		description: 'Inspect the current folder before choosing an action.'
	},
	{
		label: 'Exit',
		value: 'exit'
	}
];

const FEEDBACK_MENU_OPTIONS: readonly SelectOption<FeedbackMenuValue>[] = [
	{
		label: 'Open dashboard now',
		value: 'open',
		description: 'Start the feedback server if needed and open the browser.'
	},
	{
		label: 'Print dashboard URL only',
		value: 'print',
		description: 'Start the feedback server if needed, but do not open the browser.'
	},
	{
		label: 'Back to main menu',
		value: 'back'
	},
	{
		label: 'Exit',
		value: 'exit'
	}
];

const PACKAGE_MANAGER_OPTIONS: readonly SelectOption<PackageManagerMenuValue>[] = [
	{
		label: 'bun',
		value: 'bun',
		description: 'Fastest path in this repo and the current default.'
	},
	{
		label: 'pnpm',
		value: 'pnpm',
		description: 'Use pnpm workspaces and lockfile conventions.'
	},
	{
		label: 'npm',
		value: 'npm',
		description: 'Use the default npm workflow.'
	},
	{
		label: 'yarn',
		value: 'yarn',
		description: 'Use the Yarn workflow.'
	},
	{
		label: 'Back to main menu',
		value: 'back'
	},
	{
		label: 'Exit',
		value: 'exit'
	}
];

function isSetupGuideId(value: string): value is SetupGuideId {
	return setupGuideIds.includes(value as SetupGuideId);
}

function yesNo(value: boolean): string {
	return value ? 'yes' : 'no';
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

function colorEnabled(): boolean {
	return Boolean(output.isTTY && !process.env.NO_COLOR);
}

function paint(text: string, ...codes: string[]): string {
	if (!colorEnabled()) return text;
	return `${codes.join('')}${text}${ANSI.reset}`;
}

function paintContextLine(line: string, index: number): string {
	if (!line.trim()) return line;
	if (index === 0) return paint(line, ANSI.bold, ANSI.cyan);
	if (/^Follow-up:/.test(line)) return paint(line, ANSI.bold, ANSI.mint);
	if (/^\d+\./.test(line)) return paint(line, ANSI.bold, ANSI.gold);
	if (/^ {3}/.test(line)) return paint(line, ANSI.slate);
	return paint(line, ANSI.white);
}

function paintOptionLabel(label: string, selected: boolean): string {
	if (selected) {
		return paint(` ${label} `, ANSI.bold, ANSI.black, ANSI.bgCyan);
	}

	return paint(label, ANSI.white);
}

function paintOptionDescription(description: string, selected: boolean): string {
	return selected ? paint(description, ANSI.sky) : paint(description, ANSI.dim, ANSI.slate);
}

function buildMainContext(spec: Spec): string[] {
	try {
		const detection = detectProject(spec, undefined);
		return [
			`cwd: ${homeRelative(process.cwd())}`,
			`project: ${detection.status} | framework: ${detection.framework} | pkg-manager: ${detection.packageManager}`,
			`root: ${detection.root ? homeRelative(detection.root) : '(not found)'}`,
			`deps: ui=${yesNo(detection.dependencies.ui)}, primitives=${yesNo(detection.dependencies.primitives)}, lint=${yesNo(detection.dependencies.lint)}`,
			`theme: default=${yesNo(detection.theme.defaultImported)}, dark=${yesNo(detection.theme.darkImported)}, auto=${yesNo(detection.theme.themeAuto)}`
		];
	} catch {
		return [`cwd: ${homeRelative(process.cwd())}`, 'project: detection failed'];
	}
}

function renderPromptFrame(question: string, config: SelectPromptOptions): void {
	console.clear();
	console.log(paint('DryUI', ANSI.bold, ANSI.cyan));
	console.log(paint('Interactive command menu', ANSI.dim, ANSI.sky));
	console.log('');

	for (const [index, line] of (config.contextLines ?? []).entries()) {
		console.log(paintContextLine(line, index));
	}

	if (config.contextLines?.length) {
		console.log('');
	}

	console.log(paint(question, ANSI.bold, ANSI.white));
	console.log('');
}

function setupHelp(exitCode = 0): never {
	printCommandHelp(
		{
			usage: `dryui setup [--editor <${setupGuideIds.join('|')}>] [--claude-hook] [--open-feedback] [--no-open]`,
			description: [
				'Interactive action menu for editor setup, feedback, and common project helpers.',
				'In a TTY, this command uses arrow-key menus for high-friction choices and text prompts only when needed.',
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

function renderSelect<T extends string>(
	question: string,
	options: readonly SelectOption<T>[],
	selectedIndex: number,
	config: SelectPromptOptions
): void {
	renderPromptFrame(question, config);

	for (const [index, option] of options.entries()) {
		const selected = index === selectedIndex;
		const marker = selected ? paint('>', ANSI.bold, ANSI.gold) : paint(' ', ANSI.dim, ANSI.slate);
		console.log(`${marker} ${paintOptionLabel(option.label, selected)}`);
		if (option.description) {
			console.log(`  ${paintOptionDescription(option.description, selected)}`);
		}
	}

	console.log('');
	console.log(paint(config.footer ?? 'Use Up/Down and Enter.', ANSI.dim, ANSI.sky));
}

async function promptText(
	question: string,
	defaultValue: string,
	config: SelectPromptOptions = {}
): Promise<string> {
	requireTTY();

	const previousRawMode = Boolean(input.isRaw);
	input.setRawMode(false);
	input.resume();

	renderPromptFrame(question, config);
	console.log(paint(`Press Enter to use "${defaultValue}".`, ANSI.dim, ANSI.slate));
	console.log('');

	const rl = createInterface({ input, output });

	try {
		const answer = await rl.question(paint('Project name or path: ', ANSI.bold, ANSI.gold));
		const trimmed = answer.trim();
		return trimmed || defaultValue;
	} catch (error) {
		handleReadlineError(error);
	} finally {
		rl.close();
		input.setRawMode(previousRawMode);
	}
}

async function promptAfterAction(
	returnTarget: 'main' | 'editor' = 'main'
): Promise<'main' | 'editor'> {
	if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
		return returnTarget;
	}

	const previousRawMode = Boolean(input.isRaw);
	input.setRawMode(false);
	input.resume();
	console.log('');

	const prompt =
		returnTarget === 'editor'
			? paint(
					'Press Enter to return to the editor list, type m for the main menu, or x to exit: ',
					ANSI.dim,
					ANSI.sky
				)
			: paint('Press Enter to return to the main menu, or type x to exit: ', ANSI.dim, ANSI.sky);

	const rl = createInterface({ input, output });

	try {
		const answer = (await rl.question(prompt)).trim().toLowerCase();
		if (answer === 'x' || answer === 'exit') {
			process.exit(0);
		}
		if (returnTarget === 'editor' && answer === 'm') {
			return 'main';
		}
		return returnTarget;
	} catch (error) {
		handleReadlineError(error);
	} finally {
		rl.close();
		input.setRawMode(previousRawMode);
	}
}

async function promptSelect<T extends string>(
	question: string,
	options: readonly SelectOption<T>[],
	config: SelectPromptOptions = {}
): Promise<T> {
	requireTTY();

	if (!keypressInitialized) {
		emitKeypressEvents(input);
		keypressInitialized = true;
	}

	const maxIndex = options.length - 1;
	let selectedIndex = Math.max(0, Math.min(config.initialIndex ?? 0, maxIndex));
	const previousRawMode = Boolean(input.isRaw);

	return await new Promise<T>((resolve) => {
		const cleanup = () => {
			input.off('keypress', onKeypress);
			input.setRawMode(previousRawMode);
			input.pause();
		};

		const onKeypress = (_chunk: string, key: { ctrl?: boolean; name?: string }) => {
			if (key.ctrl && key.name === 'c') {
				cleanup();
				process.exit(130);
			}

			if (key.name === 'up' || key.name === 'k') {
				selectedIndex = selectedIndex === 0 ? maxIndex : selectedIndex - 1;
				renderSelect(question, options, selectedIndex, config);
				return;
			}

			if (key.name === 'down' || key.name === 'j') {
				selectedIndex = selectedIndex === maxIndex ? 0 : selectedIndex + 1;
				renderSelect(question, options, selectedIndex, config);
				return;
			}

			if (key.name === 'return' || key.name === 'enter') {
				const selected = options[selectedIndex];
				cleanup();
				resolve(selected!.value);
			}
		};

		input.setRawMode(true);
		input.resume();
		input.on('keypress', onKeypress);
		renderSelect(question, options, selectedIndex, config);
	});
}

async function promptConfirm(
	question: string,
	defaultValue = false,
	config: SelectPromptOptions = {}
): Promise<boolean> {
	const value = await promptSelect(
		question,
		[
			{ label: 'Yes', value: 'yes' },
			{ label: 'No', value: 'no' }
		],
		{ ...config, initialIndex: defaultValue ? 0 : 1 }
	);

	return value === 'yes';
}

async function runFeedbackSession(noOpen: boolean, exitOnComplete: boolean): Promise<void> {
	const args = noOpen ? ['--no-open'] : [];
	const launched = await runLauncher(args, { exitOnComplete });
	if (launched) return;

	const result = await getFeedbackUiResult(args, exitOnComplete ? 'toon' : 'text');
	if (exitOnComplete) {
		runCommand(result, 'toon');
	} else {
		emitCommandResult(result);
	}
}

export function getInitTargetStatus(projectPath: string): InitTargetStatus | null {
	const targetPath = resolve(process.cwd(), projectPath);
	const targetExists = existsSync(targetPath);
	const targetIsDirectory = targetExists ? statSync(targetPath).isDirectory() : false;

	if (targetPath === resolve(process.cwd())) {
		if (targetExists && readdirSync(targetPath).length > 0) {
			return {
				kind: 'confirm',
				message:
					'This will scaffold into the current directory and may modify existing files. Continue?'
			};
		}
		return {
			kind: 'confirm',
			message: 'This will scaffold into the current directory. Continue?'
		};
	}

	if (targetExists && !targetIsDirectory) {
		return {
			kind: 'error',
			message: `Target ${homeRelative(targetPath)} already exists as a file. Choose a new directory path.`
		};
	}

	if (targetExists && readdirSync(targetPath).length > 0) {
		return {
			kind: 'confirm',
			message: `Target ${homeRelative(targetPath)} already exists and is not empty. Continue?`
		};
	}

	return null;
}

async function runInteractiveEditorSetup(args: string[], mainContext: string[]): Promise<void> {
	const editorOptions: readonly SelectOption<EditorMenuValue>[] = [
		...setupGuideIds.map((id) => ({
			label: getSetupGuide(id).label,
			value: id
		})),
		{ label: 'Back to main menu', value: 'back' },
		{ label: 'Exit', value: 'exit' }
	];

	while (true) {
		const editor = await promptSelect('Which editor or agent do you want to wire?', editorOptions, {
			contextLines: mainContext
		});

		if (editor === 'back') {
			return;
		}

		if (editor === 'exit') {
			process.exit(0);
		}

		const guide = getSetupGuide(editor);
		const contextLines = formatGuide(guide).split('\n');

		if (editor === 'claude-code') {
			const installHook = await promptConfirm('Install the Claude SessionStart hook now?', false, {
				contextLines
			});
			if (installHook) {
				emitCommandResult(getInstallHookResult([], 'text'));
				const next = await promptAfterAction('editor');
				if (next === 'main') {
					return;
				}
				continue;
			}
		}

		const next = await promptSelect<PostGuideValue>(
			'What next?',
			[
				{ label: 'Choose another editor', value: 'again' },
				{ label: 'Back to main menu', value: 'main' },
				{ label: 'Exit', value: 'exit' }
			],
			{ contextLines }
		);

		if (next === 'again') {
			continue;
		}

		if (next === 'main') {
			return;
		}

		process.exit(0);
	}
}

async function runInteractiveFeedbackSetup(mainContext: string[]): Promise<void> {
	const action = await promptSelect(
		'How would you like to start feedback?',
		FEEDBACK_MENU_OPTIONS,
		{
			contextLines: mainContext
		}
	);

	if (action === 'back') {
		return;
	}

	if (action === 'exit') {
		process.exit(0);
	}

	await runFeedbackSession(action === 'print', false);
	await promptAfterAction();
}

async function runInteractiveInit(spec: Spec, mainContext: string[]): Promise<void> {
	const projectPath = await promptText('Where should the new project live?', 'my-app', {
		contextLines: mainContext
	});
	const detectedPm = detectPackageManagerFromEnv();
	const initialIndex = PACKAGE_MANAGER_OPTIONS.findIndex((option) => option.value === detectedPm);
	const packageManager = await promptSelect<PackageManagerMenuValue>(
		'Which package manager should init use?',
		PACKAGE_MANAGER_OPTIONS,
		{
			contextLines: [...mainContext, `target: ${projectPath}`],
			initialIndex: initialIndex === -1 ? 0 : initialIndex
		}
	);

	if (packageManager === 'back') {
		return;
	}

	if (packageManager === 'exit') {
		process.exit(0);
	}

	const targetStatus = getInitTargetStatus(projectPath);
	if (targetStatus?.kind === 'error') {
		console.error(targetStatus.message);
		await promptAfterAction();
		return;
	}

	if (targetStatus?.kind === 'confirm') {
		const confirmed = await promptConfirm(targetStatus.message, false, {
			contextLines: [
				...mainContext,
				`target: ${homeRelative(resolve(process.cwd(), projectPath))}`,
				`package-manager: ${packageManager}`
			]
		});
		if (!confirmed) {
			return;
		}
	}

	runInit([projectPath, '--pm', packageManager], spec);
	await promptAfterAction();
}

async function runInteractiveSetup(args: string[], spec: Spec): Promise<void> {
	let mainContext = buildMainContext(spec);

	while (true) {
		const action = await promptSelect('What would you like to do?', MAIN_MENU_OPTIONS, {
			contextLines: mainContext
		});

		switch (action) {
			case 'setup':
				await runInteractiveEditorSetup(args, mainContext);
				break;
			case 'feedback':
				await runInteractiveFeedbackSetup(mainContext);
				mainContext = buildMainContext(spec);
				break;
			case 'init':
				await runInteractiveInit(spec, mainContext);
				mainContext = buildMainContext(spec);
				break;
			case 'install':
				emitCommandResult(getInstall('.', spec, 'text'));
				await promptAfterAction();
				break;
			case 'detect':
				emitCommandResult(getDetect('.', spec, 'text'));
				await promptAfterAction();
				break;
			case 'exit':
				process.exit(0);
		}
	}
}

export async function runSetup(args: string[], spec: Spec): Promise<void> {
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
		if (editor === 'claude-code' && hasFlag(args, '--claude-hook')) {
			emitCommandResult(getInstallHookResult([], 'text'));
		}
		if (hasFlag(args, '--open-feedback')) {
			await runFeedbackSession(hasFlag(args, '--no-open'), true);
			return;
		}
		process.exit(0);
	}

	if (!isInteractiveTTY()) {
		if (hasFlag(args, '--open-feedback')) {
			await runFeedbackSession(hasFlag(args, '--no-open'), true);
			return;
		}
		setupHelp();
	}

	await runInteractiveSetup(args, spec);
}
