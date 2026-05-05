import { resolve } from 'node:path';
import { emitKeypressEvents } from 'node:readline';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
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
import { getFeedbackUiResult } from './feedback.js';
import { getInstallHookResult, getInstallHookStatus } from './install-hook.js';
import { runLauncher } from './launcher.js';
import { ensureClaudeAgents } from './launch-utils.js';
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

type MainMenuValue = 'setup' | 'feedback' | 'exit';
type EditorMenuValue = SetupGuideId | 'back' | 'exit';
type FeedbackMenuValue = 'open' | 'print' | 'back' | 'exit';
type PostGuideValue = 'svelte' | 'again' | 'main' | 'exit';

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
	if (isStdinIoError(error)) {
		process.exit(130);
	}
	throw error;
}

function isStdinIoError(error: unknown): boolean {
	if (!error || typeof error !== 'object') return false;
	const code = (error as { code?: string }).code;
	const errno = (error as { errno?: number }).errno;
	return code === 'EIO' || code === 'EBADF' || errno === -5 || errno === 5;
}

function safeSetRawMode(mode: boolean): boolean {
	if (typeof input.setRawMode !== 'function') return false;
	try {
		input.setRawMode(mode);
		return true;
	} catch (error) {
		if (isStdinIoError(error)) return false;
		throw error;
	}
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
	bgCyan: '\x1b[48;5;45m',
	bgGold: '\x1b[48;5;221m'
} as const;

function isDryuiDevMode(): boolean {
	const flag = process.env['DRYUI_DEV'];
	return flag === '1' || flag === 'true';
}

function devModeBannerLines(): string[] {
	if (!isDryuiDevMode()) return [];
	return [
		paint(' ⚠  DRYUI_DEV=1 — LOCAL SOURCE MODE ', ANSI.bold, ANSI.black, ANSI.bgGold),
		paint('Running from packages/*/src/, not dist/. Unset DRYUI_DEV to match published.', ANSI.gold)
	];
}

const MAIN_MENU_OPTIONS: readonly SelectOption<MainMenuValue>[] = [
	{
		label: 'Install skills + feedback',
		value: 'setup',
		icon: '⌘',
		description: 'Wire DryUI skills, feedback MCP, and the optional Svelte companion.'
	},
	{
		label: 'Start feedback session',
		value: 'feedback',
		icon: '◉',
		description: 'Open the feedback dashboard or print its URL.'
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

function isSvelteCompanionSection(section: SetupGuide['sections'][number]): boolean {
	return section.title.toLowerCase().includes('svelte');
}

export function formatGuide(
	guide: SetupGuide,
	options: { includeSvelteMcp?: boolean } = {}
): string {
	const includeSvelteMcp = options.includeSvelteMcp ?? true;
	const sections = includeSvelteMcp
		? guide.sections
		: guide.sections.filter((section) => !isSvelteCompanionSection(section));
	const lines = [guide.label, '', guide.description, ''];

	for (const [index, section] of sections.entries()) {
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
	const devLines = devModeBannerLines();
	const lines = [
		paint('◈ DryUI', ANSI.bold, ANSI.cyan),
		paint('Interactive command menu', ANSI.dim, ANSI.sky),
		...(devLines.length > 0 ? ['', ...devLines] : []),
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

function renderPromptFrame(question: string, config: SelectPromptOptions = {}): void {
	console.clear();
	for (const line of formatPromptFrameLines(question, config)) {
		console.log(line);
	}
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

function renderEditorInstallProgress(
	editor: SetupGuide,
	contextLines: readonly string[],
	includeSvelteMcp: boolean
): void {
	renderPromptFrame(`Installing ${editor.label} setup...`, { contextLines });
	console.log(
		paint('Installing DryUI skills and updating feedback/editor MCP config.', ANSI.white)
	);
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
			usage: `dryui setup [--editor <${setupGuideIds.join('|')}>] [--claude-hook] [--no-svelte-mcp] [--open-feedback] [--no-open] [--sync-agents] [path]`,
			description: [
				'Interactive setup for DryUI skills, feedback tooling, and the Svelte companion.',
				'In a TTY, this command uses arrow-key menus for high-friction choices and text prompts only when needed.',
				'Without a TTY, use --editor and/or --open-feedback for deterministic output.'
			],
			options: [
				'  --editor <id>       Print skill + feedback setup steps for one editor or agent',
				'  --no-svelte-mcp     Skip registering the official @sveltejs/mcp server (default: on)',
				'  --claude-hook       Run `dryui install-hook` after the Claude guide',
				'  --open-feedback     Open feedback tooling after printing setup steps',
				'  --no-open           When opening feedback, print the URL instead of opening the browser',
				'  --sync-agents       Refresh bundled .claude/agents files in the project'
			],
			examples: [
				'  dryui setup',
				'  dryui setup --editor codex',
				'  dryui setup --editor cursor --no-svelte-mcp',
				'  dryui setup --editor claude-code --claude-hook',
				'  dryui setup --sync-agents',
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

async function promptAfterAction(
	returnTarget: 'main' | 'editor' = 'main'
): Promise<'main' | 'editor'> {
	if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
		return returnTarget;
	}

	const previousRawMode = Boolean(input.isRaw);
	if (!safeSetRawMode(false)) {
		// Stdin is unusable (e.g. EIO after Ctrl-C in some terminals). The user
		// already asked to stop, so exit cleanly instead of crashing on resume().
		process.exit(0);
	}
	try {
		input.resume();
	} catch (error) {
		if (isStdinIoError(error)) {
			process.exit(0);
		}
		throw error;
	}
	console.log('');

	const prompt =
		returnTarget === 'editor'
			? paint(
					'Press Enter to return to the editor list, type m for the main menu, or x to exit: ',
					ANSI.dim,
					ANSI.sky
				)
			: paint('Press Enter to return to the main menu, or type x to exit: ', ANSI.dim, ANSI.sky);

	let rl: ReturnType<typeof createInterface>;
	try {
		rl = createInterface({ input, output });
	} catch (error) {
		if (isStdinIoError(error)) {
			process.exit(0);
		}
		throw error;
	}

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
		safeSetRawMode(previousRawMode);
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

async function runFeedbackSession(
	noOpen: boolean,
	exitOnComplete: boolean,
	launcherOptions: Omit<
		NonNullable<Parameters<typeof runLauncher>[1]>,
		'cwd' | 'exitOnComplete'
	> = {}
): Promise<void> {
	const args = noOpen ? ['--no-open'] : [];
	const launched = await runLauncher(args, { exitOnComplete, ...launcherOptions });
	if (launched) return;

	const result = await getFeedbackUiResult(args, exitOnComplete ? 'toon' : 'text');
	if (exitOnComplete) {
		runCommand(result, 'toon');
	} else {
		emitCommandResult(result);
	}
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

async function runInteractiveFeedbackSetup(): Promise<void> {
	const action = await promptSelect('How would you like to start feedback?', FEEDBACK_MENU_OPTIONS);

	if (action === 'back') {
		return;
	}

	if (action === 'exit') {
		process.exit(0);
	}

	await runFeedbackSession(action === 'print', false, {
		runtime: {
			onProgress: ({ noOpen }) => renderFeedbackLaunchProgress(noOpen)
		}
	});
	await promptAfterAction();
}

async function runInteractiveSetup(args: string[], defaultSvelteMcp: boolean): Promise<void> {
	while (true) {
		const action = await promptSelect('What would you like to do?', MAIN_MENU_OPTIONS);

		switch (action) {
			case 'setup':
				await runInteractiveEditorSetup(args, defaultSvelteMcp);
				break;
			case 'feedback':
				await runInteractiveFeedbackSetup();
				break;
			case 'exit':
				process.exit(0);
		}
	}
}

function resolveIncludeSvelteMcp(args: string[]): boolean {
	return !hasFlag(args, '--no-svelte-mcp');
}

function syncClaudeAgentsResult(args: string[]): CommandResult {
	const positionals = args.filter((arg) => !arg.startsWith('--'));
	const target = resolve(positionals[0] ?? process.cwd());
	const result = ensureClaudeAgents(target, { force: true });

	if (!result.sourceFound) {
		return {
			output: '',
			error: `Could not find bundled Claude agents in this DryUI install.`,
			exitCode: 1
		};
	}

	const lines = [`claude-agents: synced`, `target: ${target}`];
	const changes = [
		...result.copied.map((name) => `+ ${name}`),
		...result.updated.map((name) => `~ ${name}`)
	];
	if (changes.length === 0) {
		lines.push('changes: none');
		lines.push('status: up-to-date');
	} else {
		lines.push(`changes[${changes.length}]:`);
		for (const change of changes) lines.push(`  ${change}`);
	}

	return { output: lines.join('\n'), error: null, exitCode: 0 };
}

export async function runSetup(args: string[]): Promise<void> {
	if (hasFlag(args, '--help') || hasFlag(args, '-h')) {
		setupHelp();
	}

	if (hasFlag(args, '--sync-agents')) {
		runCommand(syncClaudeAgentsResult(args), 'text');
	}

	const includeSvelteMcp = resolveIncludeSvelteMcp(args);

	const editor = getFlag(args, '--editor');
	if (editor) {
		if (!isSetupGuideId(editor)) {
			console.error(`Unknown editor: ${editor}`);
			process.exit(1);
		}
		console.log(formatGuide(getSetupGuide(editor), { includeSvelteMcp }));
		if (editor === 'claude-code' && hasFlag(args, '--claude-hook')) {
			emitCommandResult(getInstallHookResult([], 'text'));
		}
		if (hasFlag(args, '--install')) {
			console.error('');
			console.error('`dryui setup --install` was removed.');
			console.error(
				'Run the printed skill/MCP setup steps above, or use your agent to apply them.'
			);
			process.exit(2);
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

	await runInteractiveSetup(args, includeSvelteMcp);
}
