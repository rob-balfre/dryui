import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { emitKeypressEvents } from 'node:readline';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
	detectPackageManagerFromEnv,
	detectProject,
	type DryuiPackageManager,
	type ProjectDetection
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
import { getInstallHookResult, getInstallHookStatus } from './install-hook.js';
import { getInstall } from './install.js';
import { runLauncher, runUserProjectLauncher } from './launcher.js';
import type { PortHolder } from './launch-utils.js';
import {
	getSetupGuide,
	setupGuideIds,
	type SetupGuide,
	type SetupGuideId
} from './setup-guides.js';
import {
	formatInstallResult,
	getAgentSetupStatus,
	installPreviewLines,
	isAutoInstallable,
	readAgentSetupEntries,
	runEditorInstall,
	runSvelteCompanionInstall,
	svelteCompanionPreviewLines,
	type AgentSetupEntry
} from './setup-installers.js';
import type { Spec } from './types.js';

type MainMenuValue = 'setup' | 'feedback' | 'init' | 'install' | 'detect' | 'exit';
type EditorMenuValue = SetupGuideId | 'back' | 'exit';
type FeedbackMenuValue = 'open' | 'print' | 'back' | 'exit';
type PackageManagerMenuValue = DryuiPackageManager | 'back' | 'exit';
type PostGuideValue = 'svelte' | 'again' | 'main' | 'exit';
type InitTargetStatus = { kind: 'confirm' | 'error'; message: string };

interface SelectOption<T extends string> {
	label: string;
	value: T;
	description?: string;
	icon?: string;
}

interface SelectPromptOptions {
	contextLines?: readonly string[];
	secondaryLines?: readonly string[];
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
		icon: '⌘',
		description: 'Choose Claude, Codex, Gemini, OpenCode, Copilot, Cursor, Windsurf, or Zed.'
	},
	{
		label: 'Start feedback session',
		value: 'feedback',
		icon: '◉',
		description: 'Open the feedback dashboard or print its URL.'
	},
	{
		label: 'Bootstrap a new project',
		value: 'init',
		icon: '✦',
		description: 'Choose a project name/path and package manager, then run `dryui init`.'
	},
	{
		label: 'Print install plan for current folder',
		value: 'install',
		icon: '≡',
		description: 'Inspect what DryUI would change before installing.'
	},
	{
		label: 'Detect current project setup',
		value: 'detect',
		icon: '⌕',
		description: 'Inspect the current folder before choosing an action.'
	},
	{
		label: 'Exit',
		value: 'exit',
		icon: '⏻'
	}
];

const FEEDBACK_MENU_OPTIONS: readonly SelectOption<FeedbackMenuValue>[] = [
	{
		label: 'Open dashboard now',
		value: 'open',
		icon: '↗',
		description: 'Start the feedback server if needed and open the browser.'
	},
	{
		label: 'Print dashboard URL only',
		value: 'print',
		icon: '⎘',
		description: 'Start the feedback server if needed, but do not open the browser.'
	},
	{
		label: 'Back to main menu',
		value: 'back',
		icon: '←'
	},
	{
		label: 'Exit',
		value: 'exit',
		icon: '⏻'
	}
];

const PACKAGE_MANAGER_OPTIONS: readonly SelectOption<PackageManagerMenuValue>[] = [
	{
		label: 'bun',
		value: 'bun',
		icon: '◈',
		description: 'Fastest path in this repo and the current default.'
	},
	{
		label: 'pnpm',
		value: 'pnpm',
		icon: '◌',
		description: 'Use pnpm workspaces and lockfile conventions.'
	},
	{
		label: 'npm',
		value: 'npm',
		icon: '□',
		description: 'Use the default npm workflow.'
	},
	{
		label: 'yarn',
		value: 'yarn',
		icon: '△',
		description: 'Use the Yarn workflow.'
	},
	{
		label: 'Back to main menu',
		value: 'back',
		icon: '←'
	},
	{
		label: 'Exit',
		value: 'exit',
		icon: '⏻'
	}
];

function isSetupGuideId(value: string): value is SetupGuideId {
	return setupGuideIds.includes(value as SetupGuideId);
}

const FLAG_ON = '✓';
const FLAG_OFF = '·';

function formatFlagRow(flags: readonly { label: string; on: boolean }[]): string {
	return flags.map((f) => `${f.on ? FLAG_ON : FLAG_OFF} ${f.label}`).join('   ');
}

const AGENT_COLUMNS: readonly {
	header: string;
	get: (entry: AgentSetupEntry) => string;
}[] = [
	{ header: '', get: (e) => e.displayName },
	{ header: 'plugin', get: (e) => (e.plugin ? FLAG_ON : FLAG_OFF) },
	{ header: 'mcp', get: (e) => (e.mcp ? FLAG_ON : FLAG_OFF) },
	{ header: 'feedback', get: (e) => (e.feedback ? FLAG_ON : FLAG_OFF) },
	{ header: 'svelte', get: (e) => (e.svelte ? FLAG_ON : FLAG_OFF) }
];

export function buildAgentsBlock(cwd: string): string[] {
	const entries = readAgentSetupEntries({ cwd });
	if (entries.length === 0) {
		return [paint('Agents: none wired yet', ANSI.dim, ANSI.slate)];
	}

	const colWidths = AGENT_COLUMNS.map((col) =>
		Math.max(col.header.length, ...entries.map((entry) => col.get(entry).length))
	);
	const bar = paint('│', ANSI.dim, ANSI.slate);
	const border = (left: string, mid: string, right: string): string =>
		paint(left + colWidths.map((w) => '─'.repeat(w + 2)).join(mid) + right, ANSI.dim, ANSI.slate);
	const renderRow = (cells: readonly string[], paintCell: (text: string) => string): string =>
		bar + cells.map((cell, i) => ` ${paintCell(cell.padEnd(colWidths[i]!))} ${bar}`).join('');

	const headerCells = AGENT_COLUMNS.map((col) => col.header);
	const header = renderRow(headerCells, (text) => paint(text, ANSI.bold, ANSI.sky));

	const out = [
		paint('Agents', ANSI.bold, ANSI.slate),
		border('┌', '┬', '┐'),
		header,
		border('├', '┼', '┤')
	];
	for (const [index, entry] of entries.entries()) {
		const cells = AGENT_COLUMNS.map((col) => col.get(entry));
		out.push(renderRow(cells, (text) => paint(text, ANSI.white)));
		if (index < entries.length - 1) {
			out.push(border('├', '┼', '┤'));
		}
	}
	out.push(border('└', '┴', '┘'));
	return out;
}

function takeLeadingSentences(text: string, count: number): string {
	const sentences = text
		.trim()
		.split(/(?<=[.!?])\s+/)
		.filter(Boolean);
	return sentences.slice(0, count).join(' ');
}

function formatPreviewCodeLines(guide: SetupGuide, code: string): string[] {
	const lines = code.split('\n');
	if (lines.length <= 2 && !lines.some((line) => /^[{\[]/.test(line.trim()))) {
		return lines.map((line) => `   ${line}`);
	}

	if (lines.length <= 4 && lines.every((line) => !/^[{\[]/.test(line.trim()))) {
		return [...lines.map((line) => `   ${line}`)];
	}

	return [`   See \`dryui setup --editor ${guide.id}\` for the full snippet.`];
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

export function formatGuidePreviewLines(guide: SetupGuide): string[] {
	const [primary, ...optional] = guide.sections;
	if (!primary) return [guide.label];

	const lines = [guide.label, '', `1. ${primary.title}`];
	if (primary.note) {
		lines.push(`   ${takeLeadingSentences(primary.note, 2)}`);
	}
	lines.push(...formatPreviewCodeLines(guide, primary.code));

	if (optional.length) {
		lines.push('');
		lines.push('Optional');
		for (const [index, section] of optional.entries()) {
			lines.push(`   ${index + 2}. ${section.title}`);
		}
	}

	lines.push('');
	lines.push(`Follow-up: ${guide.followUp}`);
	return lines;
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
	if (index === 0) return paint(`◆ ${line}`, ANSI.bold, ANSI.cyan);
	if (/^Follow-up:/.test(line)) return paint(`↳ ${line}`, ANSI.bold, ANSI.mint);
	if (/^\d+\./.test(line)) return paint(line, ANSI.bold, ANSI.gold);
	if (/^ {3}/.test(line)) return paint(line, ANSI.slate);
	return paint(line, ANSI.white);
}

function paintOptionLabel(label: string, selected: boolean): string {
	const text = label.trim();
	if (selected) {
		if (!colorEnabled()) {
			return text;
		}
		return paint(` ${text} `, ANSI.bold, ANSI.black, ANSI.bgCyan);
	}

	return paint(text, ANSI.white);
}

function paintOptionDescription(description: string, selected: boolean): string {
	return selected ? paint(description, ANSI.sky) : paint(description, ANSI.dim, ANSI.slate);
}

function divider(width = output.columns ?? 72): string {
	return '─'.repeat(Math.max(36, Math.min(72, width - 2)));
}

type ContextEntry =
	| { kind: 'pair'; label: string; value: string }
	| { kind: 'continuation'; value: string };

function parseContextEntry(line: string): ContextEntry | null {
	if (line.startsWith('  ')) {
		return { kind: 'continuation', value: line.slice(2).replace(/\s+$/, '') };
	}
	if (!line.trim()) return null;
	const separatorIndex = line.indexOf(':');
	if (separatorIndex === -1) return null;
	const afterColon = line.slice(separatorIndex + 1);
	return {
		kind: 'pair',
		label: line.slice(0, separatorIndex).trim(),
		value: (afterColon.startsWith(' ') ? afterColon.slice(1) : afterColon).replace(/\s+$/, '')
	};
}

function parseContextEntries(lines: readonly string[]): ContextEntry[] | null {
	const eligible = lines.filter((line) => line.trim());
	if (eligible.length === 0) return null;
	const parsed: ContextEntry[] = [];
	let hasPair = false;
	for (const line of eligible) {
		const entry = parseContextEntry(line);
		if (!entry) return null;
		if (entry.kind === 'pair') hasPair = true;
		parsed.push(entry);
	}
	return hasPair ? parsed : null;
}

function formatContextBlockLines(contextLines: readonly string[] = []): string[] {
	if (!contextLines.length) return [];

	const entries = parseContextEntries(contextLines);
	if (entries) {
		const labelWidth = entries.reduce(
			(width, entry) => (entry.kind === 'pair' ? Math.max(width, entry.label.length) : width),
			0
		);
		const valueWidth = entries.reduce((width, entry) => Math.max(width, entry.value.length), 0);

		const border = (left: string, mid: string, right: string): string =>
			paint(
				`${left}${'─'.repeat(labelWidth + 2)}${mid}${'─'.repeat(valueWidth + 2)}${right}`,
				ANSI.dim,
				ANSI.slate
			);
		const bar = paint('│', ANSI.dim, ANSI.slate);
		const blankCell = ' '.repeat(labelWidth);

		const out = [paint('Current workspace', ANSI.bold, ANSI.slate), border('┌', '┬', '┐')];
		for (const [index, entry] of entries.entries()) {
			const labelText =
				entry.kind === 'pair'
					? paint(entry.label.padEnd(labelWidth), ANSI.bold, ANSI.sky)
					: blankCell;
			const value = paint(entry.value.padEnd(valueWidth), ANSI.white);
			out.push(`${bar} ${labelText} ${bar} ${value} ${bar}`);
			if (index < entries.length - 1) {
				out.push(border('├', '┼', '┤'));
			}
		}
		out.push(border('└', '┴', '┘'));
		return out;
	}

	return contextLines.map((line, index) =>
		line.trim() ? `  ${paintContextLine(line, index)}` : ''
	);
}

function formatOptionText<T extends string>(option: SelectOption<T>): string {
	return option.icon ? `${option.icon} ${option.label}` : option.label;
}

export function formatPromptFrameLines(question: string, config: SelectPromptOptions): string[] {
	const lines = [
		paint('◈ DryUI', ANSI.bold, ANSI.cyan),
		paint('Interactive command menu', ANSI.dim, ANSI.sky),
		paint(divider(), ANSI.dim, ANSI.slate),
		''
	];

	lines.push(...formatContextBlockLines(config.contextLines));

	if (config.contextLines?.length) {
		lines.push('');
	}

	if (config.secondaryLines?.length) {
		lines.push(...config.secondaryLines);
		lines.push('');
	}

	lines.push(paint(question, ANSI.bold, ANSI.white), '');
	return lines;
}

function formatSelectBodyLines<T extends string>(
	options: readonly SelectOption<T>[],
	selectedIndex: number,
	config: SelectPromptOptions
): string[] {
	const lines: string[] = [];

	for (const [index, option] of options.entries()) {
		const selected = index === selectedIndex;
		const marker = selected ? paint('›', ANSI.bold, ANSI.gold) : paint(' ', ANSI.dim, ANSI.slate);
		const label = paintOptionLabel(formatOptionText(option), selected);
		lines.push(`${marker} ${label}`);
		if (option.description) {
			const descriptionPrefix = selected ? paint('↳', ANSI.dim, ANSI.sky) : ' ';
			lines.push(`  ${descriptionPrefix} ${paintOptionDescription(option.description, selected)}`);
		}
		if (index < options.length - 1) {
			lines.push('');
		}
	}

	lines.push('');
	lines.push(paint(config.footer ?? '↑/↓ move  Enter select  Ctrl+C quit.', ANSI.dim, ANSI.sky));
	return lines;
}

export function formatSelectScreenLines<T extends string>(
	question: string,
	options: readonly SelectOption<T>[],
	selectedIndex: number,
	config: SelectPromptOptions
): string[] {
	return [
		...formatPromptFrameLines(question, config),
		...formatSelectBodyLines(options, selectedIndex, config)
	];
}

function getEditorMenuIcon(editor: SetupGuideId): string {
	switch (editor) {
		case 'claude-code':
			return '☼';
		case 'codex':
			return '⌘';
		case 'gemini':
			return '✦';
		case 'opencode':
			return '◉';
		case 'copilot':
			return '△';
		case 'cursor':
			return '◌';
		case 'windsurf':
			return '≈';
		case 'zed':
			return '□';
	}
}

function buildMainContext(spec: Spec): string[] {
	try {
		const detection = detectProject(spec, undefined);
		const cwd = homeRelative(process.cwd());
		const root = detection.root ? homeRelative(detection.root) : null;

		const lines = [
			`cwd: ${cwd}`,
			`project: ${detection.status} · ${detection.framework} · ${detection.packageManager}`
		];

		if (root && root !== cwd) {
			lines.push(`root: ${root}`);
		} else if (!root) {
			lines.push('root: (not found)');
		}

		lines.push(
			`deps: ${formatFlagRow([
				{ label: 'ui', on: detection.dependencies.ui },
				{ label: 'primitives', on: detection.dependencies.primitives },
				{ label: 'lint', on: detection.dependencies.lint }
			])}`
		);
		lines.push(
			`theme: ${formatFlagRow([
				{ label: 'default', on: detection.theme.defaultImported },
				{ label: 'dark', on: detection.theme.darkImported },
				{ label: 'auto', on: detection.theme.themeAuto }
			])}`
		);
		return lines;
	} catch {
		return [`cwd: ${homeRelative(process.cwd())}`, 'project: detection failed'];
	}
}

function renderPromptFrame(question: string, config: SelectPromptOptions = {}): void {
	console.clear();
	for (const line of formatPromptFrameLines(question, config)) {
		console.log(line);
	}
}

function renderDetectView(spec: Spec): void {
	const mainContext = buildMainContext(spec);
	const agentsBlock = buildAgentsBlock(process.cwd());
	console.clear();
	console.log(paint('◈ DryUI', ANSI.bold, ANSI.cyan));
	console.log(paint('Detected project setup', ANSI.dim, ANSI.sky));
	console.log(paint(divider(), ANSI.dim, ANSI.slate));
	console.log('');
	for (const line of formatContextBlockLines(mainContext)) {
		console.log(line);
	}
	if (agentsBlock.length) {
		console.log('');
		for (const line of agentsBlock) {
			console.log(line);
		}
	}
	console.log('');
}

function renderFeedbackLaunchProgress(noOpen: boolean): void {
	renderPromptFrame(
		noOpen ? 'Starting feedback dashboard URL lookup...' : 'Starting feedback dashboard...'
	);
	console.log(
		paint(
			noOpen
				? 'Starting the feedback server if needed and preparing the dashboard URL.'
				: 'Starting the feedback server if needed and opening the browser.',
			ANSI.white
		)
	);
	console.log(paint('This can take a few seconds.', ANSI.dim, ANSI.sky));
	console.log('');
}

function renderNoProjectFeedbackNotice(detection: ProjectDetection, cwd: string): void {
	renderPromptFrame(detectionIssueTitle(detection));
	console.log(
		paint(
			'Opening the feedback dashboard only. Run from your Svelte or SvelteKit app directory to also start its dev server.',
			ANSI.white
		)
	);
	console.log(paint(`cwd: ${homeRelative(cwd)}`, ANSI.dim, ANSI.sky));
	console.log('');
}

function detectionIssueTitle(detection: ProjectDetection): string {
	if (!detection.packageJsonPath) return 'No Svelte or SvelteKit project detected';
	if (detection.framework === 'unknown') return 'Not a Svelte or SvelteKit project';
	if (detection.packageManager === 'unknown') return 'Could not detect a package manager';
	return 'No dev script found in package.json';
}

function renderEditorInstallProgress(
	editor: SetupGuide,
	contextLines: readonly string[],
	includeSvelteMcp: boolean
): void {
	renderPromptFrame(`Installing ${editor.label} setup...`, { contextLines });
	console.log(paint('Copying the DryUI skill and updating the editor MCP config.', ANSI.white));
	console.log(
		paint(
			`Svelte MCP: ${includeSvelteMcp ? 'including @sveltejs/mcp' : 'skipped'}.`,
			ANSI.dim,
			ANSI.sky
		)
	);
	console.log(
		paint(
			'Please wait. This can take a few seconds while npx resolves packages.',
			ANSI.dim,
			ANSI.sky
		)
	);
	console.log('');
}

function renderSvelteCompanionInstallProgress(
	editor: SetupGuide,
	contextLines: readonly string[]
): void {
	renderPromptFrame(`Installing the Svelte companion for ${editor.label}...`, { contextLines });
	console.log(
		paint('Wiring the Svelte companion without re-running the full DryUI install.', ANSI.white)
	);
	console.log(paint('Please wait while the plugin or MCP config is updated.', ANSI.dim, ANSI.sky));
	console.log('');
}

function setupHelp(exitCode = 0): never {
	printCommandHelp(
		{
			usage: `dryui setup [--editor <${setupGuideIds.join('|')}>] [--install] [--claude-hook] [--no-svelte-mcp] [--open-feedback] [--no-open]`,
			description: [
				'Interactive action menu for editor setup, feedback, and common project helpers.',
				'In a TTY, this command uses arrow-key menus for high-friction choices and text prompts only when needed.',
				'Without a TTY, use --editor and/or --open-feedback for deterministic output.'
			],
			options: [
				'  --editor <id>       Print setup steps for one editor or agent',
				'  --install           After printing the editor steps, run them (skill copy + MCP config merge).',
				'                      Supported for copilot, cursor, gemini, opencode, windsurf, zed.',
				'  --no-svelte-mcp     Skip registering the official @sveltejs/mcp server (default: on)',
				'  --claude-hook       Run `dryui install-hook` after the Claude guide',
				'  --open-feedback     Open feedback tooling after printing setup steps',
				'  --no-open           When opening feedback, print the URL instead of opening the browser'
			],
			examples: [
				'  dryui setup',
				'  dryui setup --editor codex',
				'  dryui setup --editor gemini --install',
				'  dryui setup --editor opencode --install',
				'  dryui setup --editor cursor --install --no-svelte-mcp',
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
	for (const line of formatSelectBodyLines(options, selectedIndex, config)) {
		console.log(line);
	}
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
			{ label: 'Yes', value: 'yes', icon: '✓' },
			{ label: 'No', value: 'no', icon: '•' }
		],
		{ ...config, initialIndex: defaultValue ? 0 : 1 }
	);

	return value === 'yes';
}

async function promptKillPortHolder(holder: PortHolder, port: number): Promise<boolean> {
	return await promptConfirm(
		`Port ${port} is busy (PID ${holder.pid}, command: ${holder.command}). Kill it and start your project dev server?`,
		false
	);
}

async function promptFeedbackSetup(plan: {
	install: boolean;
	mount: boolean;
	layoutPath: string | null;
	viteConfig: boolean;
	viteConfigPath: string | null;
}): Promise<boolean> {
	const actions: string[] = [];
	if (plan.install) actions.push('• Install @dryui/feedback');
	if (plan.mount && plan.layoutPath) actions.push(`• Mount <Feedback /> in ${plan.layoutPath}`);
	if (plan.viteConfig && plan.viteConfigPath) {
		actions.push(`• Add @dryui/feedback to ssr.noExternal in ${plan.viteConfigPath}`);
	}
	return await promptConfirm('Set up @dryui/feedback for this project?', true, {
		contextLines: actions
	});
}

async function runFeedbackSession(
	noOpen: boolean,
	exitOnComplete: boolean,
	spec: Spec | null,
	launcherOptions: Omit<
		NonNullable<Parameters<typeof runLauncher>[1]>,
		'cwd' | 'exitOnComplete'
	> = {}
): Promise<void> {
	const args = noOpen ? ['--no-open'] : [];
	const launched = await runLauncher(args, { exitOnComplete, ...launcherOptions });
	if (launched) return;

	if (spec) {
		const cwd = process.cwd();
		const detection = detectProject(spec, cwd);
		const onProgress = launcherOptions.runtime?.onProgress;
		const userProjectLaunched = await runUserProjectLauncher(args, {
			exitOnComplete,
			spec,
			runtime: {
				promptKillPortHolder,
				promptFeedbackSetup,
				detectProject: () => detection,
				...(onProgress
					? {
							onProgress: ({ cwd, noOpen: projectNoOpen }) =>
								onProgress({ workspaceRoot: cwd, noOpen: projectNoOpen })
						}
					: {})
			}
		});
		if (userProjectLaunched) return;

		if (!exitOnComplete) {
			renderNoProjectFeedbackNotice(detection, cwd);
		}
	}

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

async function runInteractiveEditorSetup(args: string[], defaultSvelteMcp: boolean): Promise<void> {
	const editorOptions: readonly SelectOption<EditorMenuValue>[] = [
		...setupGuideIds.map((id) => ({
			label: getSetupGuide(id).label,
			value: id,
			icon: getEditorMenuIcon(id)
		})),
		{ label: 'Back to main menu', value: 'back', icon: '←' },
		{ label: 'Exit', value: 'exit', icon: '⏻' }
	];

	while (true) {
		const editor = await promptSelect('Which editor or agent do you want to wire?', editorOptions);

		if (editor === 'back') {
			return;
		}

		if (editor === 'exit') {
			process.exit(0);
		}

		const guide = getSetupGuide(editor);
		const contextLines = formatGuidePreviewLines(guide);

		if (editor === 'claude-code') {
			const hookStatus = getInstallHookStatus({ cwd: process.cwd() });
			if (!hookStatus.project && !hookStatus.global) {
				const installHook = await promptConfirm(
					'Install the Claude SessionStart hook now?',
					false,
					{
						contextLines
					}
				);
				if (installHook) {
					emitCommandResult(getInstallHookResult([], 'text'));
					const next = await promptAfterAction('editor');
					if (next === 'main') {
						return;
					}
					continue;
				}
			}
		}

		if (isAutoInstallable(editor)) {
			const previewCtx = { cwd: process.cwd(), includeSvelteMcp: defaultSvelteMcp };
			const previewLines = installPreviewLines(editor, previewCtx);
			const runIt = await promptConfirm('Install for me now?', true, {
				contextLines: [...contextLines, '', ...previewLines]
			});
			if (runIt) {
				const includeSvelteMcp = await promptConfirm(
					'Also register the official @sveltejs/mcp server?',
					defaultSvelteMcp,
					{ contextLines: [...contextLines, '', ...previewLines] }
				);
				renderEditorInstallProgress(
					guide,
					[...contextLines, '', ...previewLines],
					includeSvelteMcp
				);
				const result = runEditorInstall(editor, {
					cwd: process.cwd(),
					includeSvelteMcp
				});
				if (result) {
					console.log('');
					console.log(formatInstallResult(result));
				}
				const next = await promptAfterAction('editor');
				if (next === 'main') {
					return;
				}
				continue;
			}
		}

		const setupStatus = getAgentSetupStatus(editor, { cwd: process.cwd() });
		const nextOptions: SelectOption<PostGuideValue>[] = [];
		if (!setupStatus.svelte) {
			nextOptions.push({
				label: 'Install Svelte companion only',
				value: 'svelte',
				icon: '∿',
				description:
					'Adds the official Svelte plugin or MCP server for this editor without touching DryUI.'
			});
		}
		nextOptions.push(
			{ label: 'Choose another editor', value: 'again', icon: '↺' },
			{ label: 'Back to main menu', value: 'main', icon: '←' },
			{ label: 'Exit', value: 'exit', icon: '⏻' }
		);

		const next = await promptSelect<PostGuideValue>('What next?', nextOptions, { contextLines });

		if (next === 'svelte') {
			const previewLines = svelteCompanionPreviewLines(editor, { cwd: process.cwd() });
			renderSvelteCompanionInstallProgress(guide, [...contextLines, '', ...previewLines]);
			const result = runSvelteCompanionInstall(editor, { cwd: process.cwd() });
			if (result) {
				console.log('');
				console.log(formatInstallResult(result));
			}
			const after = await promptAfterAction('editor');
			if (after === 'main') {
				return;
			}
			continue;
		}

		if (next === 'again') {
			continue;
		}

		if (next === 'main') {
			return;
		}

		process.exit(0);
	}
}

async function runInteractiveFeedbackSetup(spec: Spec): Promise<void> {
	const action = await promptSelect('How would you like to start feedback?', FEEDBACK_MENU_OPTIONS);

	if (action === 'back') {
		return;
	}

	if (action === 'exit') {
		process.exit(0);
	}

	await runFeedbackSession(action === 'print', false, spec, {
		runtime: {
			onProgress: ({ noOpen }) => renderFeedbackLaunchProgress(noOpen)
		}
	});
	await promptAfterAction();
}

async function runInteractiveInit(spec: Spec): Promise<void> {
	const projectPath = await promptText('Where should the new project live?', 'my-app');
	const detectedPm = detectPackageManagerFromEnv();
	const initialIndex = PACKAGE_MANAGER_OPTIONS.findIndex((option) => option.value === detectedPm);
	const packageManager = await promptSelect<PackageManagerMenuValue>(
		'Which package manager should init use?',
		PACKAGE_MANAGER_OPTIONS,
		{
			contextLines: [`target: ${projectPath}`],
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
				`target: ${homeRelative(resolve(process.cwd(), projectPath))}`,
				`package-manager: ${packageManager}`
			]
		});
		if (!confirmed) {
			return;
		}
	}

	await runInit([projectPath, '--pm', packageManager], spec);
	await promptAfterAction();
}

async function runInteractiveSetup(
	args: string[],
	spec: Spec,
	defaultSvelteMcp: boolean
): Promise<void> {
	while (true) {
		const action = await promptSelect('What would you like to do?', MAIN_MENU_OPTIONS);

		switch (action) {
			case 'setup':
				await runInteractiveEditorSetup(args, defaultSvelteMcp);
				break;
			case 'feedback':
				await runInteractiveFeedbackSetup(spec);
				break;
			case 'init':
				await runInteractiveInit(spec);
				break;
			case 'install':
				emitCommandResult(getInstall('.', spec, 'text'));
				await promptAfterAction();
				break;
			case 'detect':
				renderDetectView(spec);
				await promptAfterAction();
				break;
			case 'exit':
				process.exit(0);
		}
	}
}

function resolveIncludeSvelteMcp(args: string[]): boolean {
	return !hasFlag(args, '--no-svelte-mcp');
}

export async function runSetup(args: string[], spec: Spec): Promise<void> {
	if (hasFlag(args, '--help') || hasFlag(args, '-h')) {
		setupHelp();
	}

	const includeSvelteMcp = resolveIncludeSvelteMcp(args);

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
		if (hasFlag(args, '--install')) {
			if (!isAutoInstallable(editor)) {
				console.error('');
				console.error(
					`--install is not supported for ${editor}. Follow the printed steps above instead.`
				);
				process.exit(1);
			}
			console.log('');
			console.log(
				`Installing ${getSetupGuide(editor).label} setup. Please wait while npx resolves packages...`
			);
			const result = runEditorInstall(editor, {
				cwd: process.cwd(),
				includeSvelteMcp
			});
			if (result) {
				console.log('');
				console.log(formatInstallResult(result));
				if (!result.ok) {
					process.exit(1);
				}
			}
		}
		if (hasFlag(args, '--open-feedback')) {
			await runFeedbackSession(hasFlag(args, '--no-open'), true, spec);
			return;
		}
		process.exit(0);
	}

	if (!isInteractiveTTY()) {
		if (hasFlag(args, '--open-feedback')) {
			await runFeedbackSession(hasFlag(args, '--no-open'), true, spec);
			return;
		}
		setupHelp();
	}

	await runInteractiveSetup(args, spec, includeSvelteMcp);
}
