// dryui init — Bootstrap a SvelteKit + DryUI project

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { Spec } from './types.js';
import {
	planInstall,
	detectPackageManagerFromEnv,
	isSvelteConfigPath,
	type DryuiPackageManager,
	type ProjectPlanStep,
	type InstallPlan
} from '@dryui/mcp/project-planner';
import { isInteractiveTTY } from '../run.js';
import {
	FEEDBACK_SERVER_URL,
	findViteConfig,
	installPackage,
	mountFeedbackInLayout,
	patchViteConfigFeedbackNoExternal,
	type InstallPackageOptions,
	type MountFeedbackOptions,
	type PortHolder
} from './launch-utils.js';
import { runUserProjectLauncher } from './launcher.js';
import {
	checkManifestFreshness,
	detectDryuiWorkspace,
	injectOverridesIntoPackageJson,
	loadDevTarballsManifest,
	rewriteInstallCommandArgs,
	wrapInstallPackage,
	type DevTarballsManifest
} from './dev-tarballs.js';

type ConcretePackageManager = Exclude<DryuiPackageManager, 'unknown'>;

interface InitOptions {
	targetPath: string;
	userPath: string | null;
	packageManager: DryuiPackageManager;
	noLaunch: boolean;
	noFeedback: boolean;
	skipImpeccable: boolean;
	devTarballsDir: string | null;
}

interface InitRuntime {
	runCommand?: (command: string, args: readonly string[], cwd: string) => boolean;
	installPackage?: (options: InstallPackageOptions) => boolean;
	mountFeedback?: (options: MountFeedbackOptions) => boolean;
	patchViteConfig?: (configPath: string) => boolean;
	findViteConfig?: (root: string) => string | null;
	isInteractiveTTY?: () => boolean;
	promptLaunch?: () => Promise<boolean>;
	promptInstallImpeccable?: () => Promise<boolean>;
	installImpeccable?: (cwd: string) => boolean;
	promptKillPortHolder?: (holder: PortHolder, port: number) => Promise<boolean>;
	runLauncher?: (
		cwd: string,
		spec: Spec,
		runtime: { promptKillPortHolder: (holder: PortHolder, port: number) => Promise<boolean> }
	) => Promise<void>;
}

interface ParsedInstallCommand {
	command: string;
	args: string[];
	display: string;
}

const PACKAGE_MANAGERS = ['bun', 'pnpm', 'npm', 'yarn'] as const;

function isPackageManager(value: string): value is ConcretePackageManager {
	return PACKAGE_MANAGERS.includes(value as ConcretePackageManager);
}

function printInitHelp(exitCode = 0): never {
	console.log(
		'Usage: dryui init [path] [--pm bun|npm|pnpm|yarn] [--no-launch] [--no-feedback] [--skip-impeccable]'
	);
	console.log('');
	console.log('Bootstrap a SvelteKit + DryUI project.');
	console.log('');
	console.log('Options:');
	console.log('  [path]             Target directory (default: current directory)');
	console.log('  --pm <manager>     Package manager: bun, npm, pnpm, yarn (auto-detected)');
	console.log('  --no-launch        Skip the feedback-mode launch prompt after scaffold');
	console.log('  --no-feedback      Skip installing @dryui/feedback and mounting <Feedback />');
	console.log('  --skip-impeccable  Skip installing impeccable design skills after scaffold');
	// --dev-tarballs <dir> is an internal flag used by the repo's E2E harness; it's not
	// documented here on purpose. See packages/cli/src/commands/dev-tarballs.ts.
	process.exit(exitCode);
}

function failInitArgs(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

function parseInitArgs(args: string[]): InitOptions {
	let targetPath = process.cwd();
	let userPath: string | null = null;
	let packageManager: DryuiPackageManager | null = null;
	let noLaunch = false;
	let noFeedback = false;
	let skipImpeccable = false;
	let devTarballsDir: string | null = null;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]!;
		const next = args[i + 1];
		if (arg === '--pm') {
			if (!next || next.startsWith('-')) {
				failInitArgs('--pm requires a package manager: bun, npm, pnpm, or yarn');
			}
			if (!isPackageManager(next)) {
				failInitArgs(`unknown package manager for --pm: ${next}`);
			}
			packageManager = next;
			i++;
		} else if (arg === '--no-launch') {
			noLaunch = true;
		} else if (arg === '--no-feedback') {
			noFeedback = true;
		} else if (arg === '--skip-impeccable') {
			skipImpeccable = true;
		} else if (arg === '--dev-tarballs') {
			if (!next || next.startsWith('-')) {
				failInitArgs('--dev-tarballs requires a directory');
			}
			devTarballsDir = resolve(process.cwd(), next);
			i++;
		} else if (arg.startsWith('-')) {
			failInitArgs(`unknown option: ${arg}`);
		} else if (!arg.startsWith('-')) {
			targetPath = resolve(process.cwd(), arg);
			userPath = arg;
		}
	}

	return {
		targetPath,
		userPath,
		packageManager: packageManager ?? detectPackageManagerFromEnv(),
		noLaunch,
		noFeedback,
		skipImpeccable,
		devTarballsDir
	};
}

// init is text-only (no TOON mode) — progress, headings and per-step status
// go to stdout so agents and pipes receive them as normal output. Warnings and
// hard errors should go through console.error (stderr) explicitly.
function log(msg: string): void {
	console.log(msg);
}

function warn(msg: string): void {
	console.error(msg);
}

function runProcessCommand(command: string, args: readonly string[], cwd: string): boolean {
	const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: false });
	return result.status === 0;
}

function formatCommandArg(arg: string): string {
	return /\s/.test(arg) ? JSON.stringify(arg) : arg;
}

function parseInstallCommand(
	command: string,
	manifest: DevTarballsManifest | null
): ParsedInstallCommand | null {
	const tokens = command.trim().split(/\s+/).filter(Boolean);
	const executable = tokens[0];
	if (!executable) return null;
	const rawArgs = tokens.slice(1);
	const args = manifest ? rewriteInstallCommandArgs(rawArgs, manifest) : rawArgs;
	return {
		command: executable,
		args,
		display: [executable, ...args].map(formatCommandArg).join(' ')
	};
}

// The scaffold template from @dryui/mcp/project-planner emits layout imports
// with app.css BEFORE the theme CSS. That silently overwrites every :root token
// override in app.css. Correct order is theme CSS first, app.css last — we
// fix it here at write-time so the scaffold honours its own docs.
function fixLayoutImportOrder(snippet: string): string {
	const match = snippet.match(/<script[^>]*>([\s\S]*?)<\/script>/);
	if (!match) return snippet;
	const scriptOpen = match[0].slice(0, match[0].indexOf(match[1]!));
	const body = match[1]!;
	const themeImportLines: string[] = [];
	const otherLines: string[] = [];
	let appCssLine: string | null = null;
	for (const rawLine of body.split('\n')) {
		if (/import\s+['"]@dryui\/ui\/themes\//.test(rawLine)) {
			themeImportLines.push(rawLine);
			continue;
		}
		if (/import\s+['"][^'"]*app\.css['"]/.test(rawLine)) {
			appCssLine = rawLine;
			continue;
		}
		otherLines.push(rawLine);
	}
	if (themeImportLines.length === 0 || appCssLine === null) return snippet;

	const reordered = [...otherLines];
	// Drop any leading blanks otherLines started with so imports sit tight under <script>.
	while (reordered.length > 0 && reordered[0]!.trim() === '') reordered.shift();
	const rebuiltBody = ['', ...themeImportLines, appCssLine, ...reordered].join('\n');
	return snippet.replace(match[0], `${scriptOpen}${rebuiltBody}</script>`);
}

function executeCreateFile(step: ProjectPlanStep): void {
	if (!step.path || !step.snippet) return;
	mkdirSync(dirname(step.path), { recursive: true });
	const content = step.path.endsWith('+layout.svelte')
		? fixLayoutImportOrder(step.snippet)
		: step.snippet;
	writeFileSync(step.path, content, 'utf-8');
	log(`  + ${step.title.replace('Create ', '')}`);
}

function executeEditFile(step: ProjectPlanStep): void {
	if (!step.path || !step.snippet) return;

	if (!existsSync(step.path)) {
		mkdirSync(dirname(step.path), { recursive: true });
		writeFileSync(step.path, step.snippet, 'utf-8');
		log(`  + ${step.title}`);
		return;
	}

	const content = readFileSync(step.path, 'utf-8');

	if (step.title === 'Set html theme mode to auto') {
		if (content.includes('theme-auto')) return;
		const updated = content.replace(/<html([^>]*)>/, (match, attrs: string) => {
			if (attrs.includes('class=')) {
				return match.replace(/class="([^"]*)"/, 'class="$1 theme-auto"');
			}
			return `<html${attrs} class="theme-auto">`;
		});
		writeFileSync(step.path, updated, 'utf-8');
		log(`  ~ ${step.title}`);
		return;
	}

	if (step.path.endsWith('app.css') && step.snippet.includes('@import')) {
		writeFileSync(step.path, step.snippet + '\n' + content, 'utf-8');
		log(`  ~ ${step.title}`);
		return;
	}

	if (step.path.endsWith('+layout.svelte')) {
		if (content.includes('@dryui/ui/themes/default.css')) return;
		const scriptMatch = content.match(/<script[^>]*>/);
		if (scriptMatch) {
			const insertPos = (scriptMatch.index ?? 0) + scriptMatch[0].length;
			const updated =
				content.slice(0, insertPos) +
				'\n' +
				step.snippet.replace(/<\/?script>/g, '') +
				content.slice(insertPos);
			writeFileSync(step.path, updated, 'utf-8');
		} else {
			writeFileSync(step.path, step.snippet + '\n\n' + content, 'utf-8');
		}
		log(`  ~ ${step.title}`);
		return;
	}

	if (isSvelteConfigPath(step.path)) {
		if (content.includes('dryuiLint')) return;

		const importLine = "import { dryuiLint } from '@dryui/lint';";
		const lintEntry = "dryuiLint({ strict: true, exclude: ['.svelte-kit/', '/dist/'] })";

		let updated = content;

		const importMatches = [...content.matchAll(/^import[^;]*;/gm)];
		const lastImport = importMatches.at(-1);
		if (lastImport?.index !== undefined) {
			const pos = lastImport.index + lastImport[0].length;
			updated = updated.slice(0, pos) + '\n' + importLine + updated.slice(pos);
		} else {
			updated = importLine + '\n' + updated;
		}

		// Branch order matters: the array form is unambiguous, so match it first.
		// The `vitePreprocess(...)` single-call form (with or without args) must match
		// BEFORE the bare-config-object fallback — otherwise the fallback would inject
		// a second `preprocess:` field next to the existing one and produce a
		// duplicate-key config object.
		if (/preprocess\s*:\s*\[/.test(updated)) {
			updated = updated.replace(/preprocess\s*:\s*\[/, `preprocess: [\n\t\t${lintEntry},`);
		} else if (/preprocess\s*:\s*vitePreprocess\s*\(/.test(updated)) {
			updated = updated.replace(
				/preprocess\s*:\s*(vitePreprocess\s*\([^)]*\))/,
				`preprocess: [${lintEntry}, $1]`
			);
		} else if (/preprocess\s*:/.test(updated)) {
			warn(
				`  ? Skipped edit: ${step.title} (manual action needed — unrecognised preprocess shape in ${step.path}; add ${lintEntry} to the preprocess array manually)`
			);
			return;
		} else if (
			/(const\s+config\s*=\s*\{|export\s+default\s*\{|defineConfig\s*\(\s*\{)/.test(updated)
		) {
			updated = updated.replace(
				/(const\s+config\s*=\s*\{|export\s+default\s*\{|defineConfig\s*\(\s*\{)/,
				`$1\n\tpreprocess: [${lintEntry}],`
			);
		} else {
			warn(
				`  ? Skipped edit: ${step.title} (manual action needed — could not locate preprocess field or config object in ${step.path})`
			);
			return;
		}

		writeFileSync(step.path, updated, 'utf-8');
		log(`  ~ ${step.title}`);
		return;
	}

	warn(`  ? Skipped edit: ${step.title} (manual action needed)`);
}

function setupFeedback(
	targetPath: string,
	packageManager: ConcretePackageManager,
	runtime: {
		installPackage: NonNullable<InitRuntime['installPackage']>;
		mountFeedback: NonNullable<InitRuntime['mountFeedback']>;
		patchViteConfig: NonNullable<InitRuntime['patchViteConfig']>;
		findViteConfig: NonNullable<InitRuntime['findViteConfig']>;
	}
): boolean {
	log('');
	log('  Setting up @dryui/feedback...');

	const installed = runtime.installPackage({
		cwd: targetPath,
		packageManager,
		packageNames: ['@dryui/feedback', 'lucide-svelte']
	});
	if (!installed) {
		warn('  Warning: failed to install @dryui/feedback and lucide-svelte. Run it manually.');
		return false;
	}
	log('  + @dryui/feedback + lucide-svelte');

	const layoutPath = resolve(targetPath, 'src/routes/+layout.svelte');
	const mounted = runtime.mountFeedback({ layoutPath, serverUrl: FEEDBACK_SERVER_URL });
	if (mounted) {
		log('  ~ Mounted <Feedback /> in src/routes/+layout.svelte');
	} else {
		warn('  Warning: could not mount <Feedback /> automatically. Add it to your root layout.');
	}

	const viteConfigPath =
		runtime.findViteConfig(targetPath) ?? resolve(targetPath, 'vite.config.ts');
	const patched = runtime.patchViteConfig(viteConfigPath);
	if (patched) {
		log('  ~ Added @dryui/feedback to ssr.noExternal in vite.config');
	} else {
		warn(
			`  Warning: could not patch ${viteConfigPath}. Add @dryui/feedback and lucide-svelte to ssr.noExternal manually.`
		);
	}

	return true;
}

/**
 * Drop the bundled Claude Code subagents (feedback, dryui-layout) into
 * `<project>/.claude/agents/` so the dispatched agent can spawn them. The
 * source dir lives at `<cli-pkg>/agents` (shipped via the cli tarball's
 * `files` array). Resolved relative to the runtime entry rather than CWD so
 * it works whether the cli is invoked from a workspace, a global install, or
 * a tarball.
 */
function setupClaudeAgents(targetPath: string): boolean {
	const cliBin = fileURLToPath(import.meta.url);
	// At runtime the bundled entry is `<cli-pkg>/dist/index.js`; agents live
	// at `<cli-pkg>/agents`. Walk up two levels to reach the package root,
	// then over to the agents dir.
	const sourceDir = resolve(dirname(cliBin), '..', 'agents');
	if (!existsSync(sourceDir)) return false;

	let entries: string[];
	try {
		entries = readdirSync(sourceDir).filter((name) => name.endsWith('.md'));
	} catch {
		return false;
	}
	if (entries.length === 0) return false;

	const targetDir = resolve(targetPath, '.claude', 'agents');
	mkdirSync(targetDir, { recursive: true });

	const written: string[] = [];
	for (const name of entries) {
		const src = resolve(sourceDir, name);
		const dest = resolve(targetDir, name);
		// Don't clobber a project's own customised version of an agent. If a
		// user has edited their `.claude/agents/feedback.md`, leave it alone.
		if (existsSync(dest)) continue;
		try {
			copyFileSync(src, dest);
			written.push(name);
		} catch {
			// Best-effort: if a single file fails, keep going with the rest.
		}
	}

	if (written.length > 0) {
		log(`  + .claude/agents/ (${written.join(', ')})`);
	}
	return true;
}

const IMPECCABLE_INSTALL_TIMEOUT_MS = 60_000;
const IMPECCABLE_RETRY_HINT = 'Install later with: npx impeccable skills install';

function installImpeccableSkillsDefault(cwd: string): boolean {
	const result = spawnSync('npx', ['-y', 'impeccable', 'skills', 'install'], {
		cwd,
		stdio: 'inherit',
		shell: false,
		timeout: IMPECCABLE_INSTALL_TIMEOUT_MS
	});
	if (result.error) return false;
	if (result.signal) return false;
	return result.status === 0;
}

async function confirmPrompt(question: string, defaultYes: boolean): Promise<boolean> {
	const previousRawMode = Boolean(input.isRaw);
	if (typeof input.setRawMode === 'function') {
		input.setRawMode(false);
	}
	input.resume();

	const rl = createInterface({ input, output });
	try {
		const answer = (await rl.question(question)).trim().toLowerCase();
		if (!answer) return defaultYes;
		return answer === 'y' || answer === 'yes';
	} finally {
		rl.close();
		if (typeof input.setRawMode === 'function') {
			input.setRawMode(previousRawMode);
		}
	}
}

function promptInstallImpeccableDefault(): Promise<boolean> {
	return confirmPrompt('  Install impeccable design skills? (Y/n) ', true);
}

function promptLaunchFeedbackDefault(): Promise<boolean> {
	return confirmPrompt('  Run this project in feedback mode now? (Y/n) ', true);
}

async function promptKillPortHolderDefault(holder: PortHolder, port: number): Promise<boolean> {
	if (!isInteractiveTTY()) return false;
	return confirmPrompt(
		`  Port ${port} is busy (PID ${holder.pid}, command: ${holder.command}). Stop it and start this project? (y/N) `,
		false
	);
}

async function runLauncherDefault(
	cwd: string,
	spec: Spec,
	runtime: Pick<InitRuntime, 'promptKillPortHolder'> = {}
): Promise<void> {
	await runUserProjectLauncher([], {
		cwd,
		spec,
		runtime: {
			promptKillPortHolder: runtime.promptKillPortHolder ?? promptKillPortHolderDefault
		}
	});
}

function applyDevTarballsToSteps(
	steps: InstallPlan['steps'],
	manifest: DevTarballsManifest
): ProjectPlanStep[] {
	return steps.map((step) => {
		if (step.kind === 'create-file' && step.path?.endsWith('/package.json') && step.snippet) {
			return { ...step, snippet: injectOverridesIntoPackageJson(step.snippet, manifest) };
		}
		return step;
	});
}

export async function runInit(
	args: string[],
	spec: Spec,
	runtime: InitRuntime = {}
): Promise<void> {
	if (args.includes('--help') || args.includes('-h')) {
		printInitHelp(0);
	}

	const {
		targetPath,
		userPath,
		packageManager,
		noLaunch,
		noFeedback,
		skipImpeccable,
		devTarballsDir: explicitDevTarballsDir
	} = parseInitArgs(args);
	const runCommand = runtime.runCommand ?? runProcessCommand;

	let devTarballsDir = explicitDevTarballsDir;
	if (devTarballsDir === null) {
		const workspace = detectDryuiWorkspace(import.meta.url);
		if (workspace) {
			const freshness = checkManifestFreshness(workspace);
			if (freshness === 'missing') {
				log('  Detected DryUI workspace; tarballs missing, running `bun run e2e:pack`...');
				const ok = runCommand('bun', ['run', 'e2e:pack'], workspace.root);
				if (!ok) {
					log('  e2e:pack failed; falling back to npm versions.');
				}
			} else if (freshness === 'stale') {
				log(
					'  Detected DryUI workspace; dist is newer than tarballs, running `bun run e2e:pack --skip-build`...'
				);
				const ok = runCommand('bun', ['run', 'e2e:pack', '--skip-build'], workspace.root);
				if (!ok) {
					log('  e2e:pack --skip-build failed; using stale tarballs.');
				}
			} else {
				log(`  Detected DryUI workspace; using local tarballs at ${workspace.tarballsDir}`);
			}

			// Use the manifest if it now exists (either pre-existing fresh, or just packed).
			if (existsSync(resolve(workspace.tarballsDir, 'manifest.json'))) {
				devTarballsDir = workspace.tarballsDir;
			}
		}
	}

	const devTarballsManifest: DevTarballsManifest | null = devTarballsDir
		? loadDevTarballsManifest(devTarballsDir)
		: null;

	mkdirSync(targetPath, { recursive: true });

	const plan = planInstall(spec, targetPath, {
		packageManager,
		strictTarget: userPath !== null
	});

	const effectiveSteps = devTarballsManifest
		? applyDevTarballsToSteps(plan.steps, devTarballsManifest)
		: plan.steps;

	const firstStep = effectiveSteps[0];
	if (
		effectiveSteps.length === 1 &&
		firstStep &&
		firstStep.kind === 'note' &&
		firstStep.status === 'done'
	) {
		log('');
		log('  DryUI is already set up in this project.');
		log('');
		return;
	}

	const isScaffold = plan.detection.status === 'unsupported';
	log('');
	log(isScaffold ? '  Scaffolding SvelteKit + DryUI project...' : '  Setting up DryUI...');
	log('');

	let installsSucceeded = true;
	for (const step of effectiveSteps) {
		switch (step.kind) {
			case 'create-file':
				executeCreateFile(step);
				break;
			case 'edit-file':
				executeEditFile(step);
				break;
			case 'run-command':
			case 'install-package': {
				if (!step.command) break;
				const installCommand = parseInstallCommand(step.command, devTarballsManifest);
				if (!installCommand) break;
				log(`  Installing dependencies...`);
				const ok = runCommand(installCommand.command, installCommand.args, targetPath);
				if (!ok) {
					installsSucceeded = false;
					warn(`  Warning: "${installCommand.display}" failed. Run it manually.`);
				}
				break;
			}
			case 'note':
				log(`  ${step.title}`);
				break;
			case 'blocked':
				warn(`  Warning: ${step.title} — ${step.description}`);
				break;
		}
	}

	let feedbackReady = false;
	if (isScaffold && installsSucceeded && !noFeedback) {
		const concretePm: ConcretePackageManager =
			packageManager === 'unknown' ? 'npm' : packageManager;
		const baseInstall = runtime.installPackage ?? installPackage;
		const effectiveInstall = devTarballsManifest
			? wrapInstallPackage(baseInstall, devTarballsManifest)
			: baseInstall;
		feedbackReady = setupFeedback(targetPath, concretePm, {
			installPackage: effectiveInstall,
			mountFeedback: runtime.mountFeedback ?? mountFeedbackInLayout,
			patchViteConfig: runtime.patchViteConfig ?? patchViteConfigFeedbackNoExternal,
			findViteConfig: runtime.findViteConfig ?? findViteConfig
		});
	}

	if (isScaffold && installsSucceeded) {
		// Drop the feedback + dryui-layout subagents into the project's
		// .claude/agents/ so the dispatched session can spawn them. Skipped
		// silently if the source agents dir is missing or empty (e.g., during
		// dev when the cli runs unbuilt).
		setupClaudeAgents(targetPath);
	}

	const tty = (runtime.isInteractiveTTY ?? isInteractiveTTY)();

	if (isScaffold && installsSucceeded && !skipImpeccable) {
		// In interactive mode we ask once (default yes). Non-TTY runs (CI, pipes,
		// `--yes`-style flows) default to yes and proceed silently. `--skip-impeccable`
		// bypasses both paths. On failure we warn but never abort init.
		const shouldInstall = tty
			? await (runtime.promptInstallImpeccable ?? promptInstallImpeccableDefault)()
			: true;
		if (shouldInstall) {
			log('');
			log('  Installing impeccable design skills...');
			const install = runtime.installImpeccable ?? installImpeccableSkillsDefault;
			const ok = install(targetPath);
			if (!ok) {
				warn(`  Warning: impeccable install did not complete. ${IMPECCABLE_RETRY_HINT}`);
			}
		} else {
			log(`  Skipped impeccable. ${IMPECCABLE_RETRY_HINT}`);
		}
	}

	if (isScaffold && feedbackReady && !noLaunch && tty) {
		log('');
		const shouldLaunch = await (runtime.promptLaunch ?? promptLaunchFeedbackDefault)();
		if (shouldLaunch) {
			log('');
			log('  Launching project in feedback mode...');
			log('');
			const launcherRuntime = {
				promptKillPortHolder: runtime.promptKillPortHolder ?? promptKillPortHolderDefault
			};
			if (runtime.runLauncher) {
				await runtime.runLauncher(targetPath, spec, launcherRuntime);
			} else {
				await runLauncherDefault(targetPath, spec, launcherRuntime);
			}
			return;
		}
	}

	const cwdIsTarget = resolve(process.cwd()) === resolve(targetPath);
	const devCommand =
		packageManager === 'bun'
			? 'bun run dev'
			: packageManager === 'pnpm'
				? 'pnpm run dev'
				: packageManager === 'yarn'
					? 'yarn dev'
					: 'npm run dev';

	log('');
	log('  Done! Your DryUI project is ready.');
	log('');
	log('  Next steps:');
	if (!cwdIsTarget) {
		// Preserve the user-typed path verbatim so absolute inputs aren't sliced.
		log(`    cd ${userPath ?? targetPath}`);
	}
	log(`    ${devCommand}`);
	if (isScaffold && feedbackReady) {
		log('');
		log('  Tip: run `bunx @dryui/cli` in the project to start feedback mode alongside dev.');
	}
	log('');
}
