// dryui init — Bootstrap a SvelteKit + DryUI project

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import type { Spec } from './types.js';
import {
	planInstall,
	detectPackageManagerFromEnv,
	isSvelteConfigPath,
	VITE_CONFIG_NAMES,
	type DryuiPackageManager,
	type ProjectPlanStep,
	type InstallPlan
} from '@dryui/mcp/project-planner';
import {
	ensureClaudeAgents,
	FEEDBACK_SERVER_URL,
	findViteConfig,
	installPackage,
	mountFeedbackInLayout,
	patchViteConfigFeedbackNoExternal,
	type InstallPackageOptions,
	type MountFeedbackOptions
} from './launch-utils.js';
import {
	checkManifestFreshness,
	detectDryuiWorkspace,
	injectOverridesIntoPackageJson,
	loadDevTarballsManifest,
	rewriteInstallCommandArgs,
	wrapInstallPackage,
	type DevTarballsManifest
} from './dev-tarballs.js';
import { runEditorInstall } from './setup-installers.js';

type ConcretePackageManager = Exclude<DryuiPackageManager, 'unknown'>;

interface InitOptions {
	targetPath: string;
	userPath: string | null;
	packageManager: DryuiPackageManager;
	noFeedback: boolean;
	noCodex: boolean;
	devTarballsDir: string | null;
}

interface InitRuntime {
	runCommand?: (command: string, args: readonly string[], cwd: string) => boolean;
	installPackage?: (options: InstallPackageOptions) => boolean;
	mountFeedback?: (options: MountFeedbackOptions) => boolean;
	patchViteConfig?: (configPath: string) => boolean;
	findViteConfig?: (root: string) => string | null;
	promptInstallImpeccable?: () => Promise<boolean>;
	installImpeccable?: (cwd: string) => boolean;
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
	console.log('Usage: dryui init [path] [--pm bun|npm|pnpm|yarn] [--no-feedback] [--no-codex]');
	console.log('');
	console.log('Bootstrap a SvelteKit + DryUI project.');
	console.log('');
	console.log('Options:');
	console.log('  [path]             Target directory (default: current directory)');
	console.log('  --pm <manager>     Package manager: bun, npm, pnpm, yarn (auto-detected)');
	console.log('  --no-feedback      Skip installing @dryui/feedback and mounting <Feedback />');
	console.log('  --no-codex         Skip wiring DryUI MCP servers into ~/.codex/config.toml');
	// --dev-tarballs <dir> is an internal flag used by the repo's E2E harness; it's not
	// documented here on purpose. See packages/cli/src/commands/dev-tarballs.ts.
	process.exit(exitCode);
}

function failInitArgs(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

function expandHomePath(path: string): string {
	const home = process.env['HOME'] || homedir();
	if (path === '~') return home;
	if (path.startsWith('~/') || path.startsWith('~\\')) {
		return resolve(home, path.slice(2));
	}
	return path;
}

export function resolveInitTargetPath(path: string): string {
	return resolve(process.cwd(), expandHomePath(path));
}

function parseInitArgs(args: string[]): InitOptions {
	let targetPath = process.cwd();
	let userPath: string | null = null;
	let packageManager: DryuiPackageManager | null = null;
	let noFeedback = false;
	let noCodex = false;
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
			// Legacy no-op. Init no longer launches feedback mode automatically.
		} else if (arg === '--no-feedback') {
			noFeedback = true;
		} else if (arg === '--no-codex') {
			noCodex = true;
		} else if (arg === '--skip-impeccable') {
			// Deprecated no-op: init no longer installs impeccable by default.
		} else if (arg === '--dev-tarballs') {
			if (!next || next.startsWith('-')) {
				failInitArgs('--dev-tarballs requires a directory');
			}
			devTarballsDir = resolve(process.cwd(), next);
			i++;
		} else if (arg.startsWith('-')) {
			failInitArgs(`unknown option: ${arg}`);
		} else if (!arg.startsWith('-')) {
			targetPath = resolveInitTargetPath(arg);
			userPath = arg;
		}
	}

	return {
		targetPath,
		userPath,
		packageManager: packageManager ?? detectPackageManagerFromEnv(),
		noFeedback,
		noCodex,
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

// Keep CSS imports in the root layout in cascade order: DryUI themes first,
// then app.css token overrides, then layout.css whitespace hooks.
function fixLayoutImportOrder(snippet: string): string {
	const match = snippet.match(/<script[^>]*>([\s\S]*?)<\/script>/);
	if (!match) return snippet;
	const scriptOpen = match[0].slice(0, match[0].indexOf(match[1]!));
	const body = match[1]!;
	const themeImportLines: string[] = [];
	const otherLines: string[] = [];
	let appCssLine: string | null = null;
	let layoutCssLine: string | null = null;
	for (const rawLine of body.split('\n')) {
		if (/import\s+['"]@dryui\/ui\/themes\//.test(rawLine)) {
			themeImportLines.push(rawLine);
			continue;
		}
		if (/import\s+['"][^'"]*layout\.css['"]/.test(rawLine)) {
			layoutCssLine = rawLine;
			continue;
		}
		if (/import\s+['"][^'"]*app\.css['"]/.test(rawLine)) {
			appCssLine = rawLine;
			continue;
		}
		otherLines.push(rawLine);
	}
	if (themeImportLines.length === 0) return snippet;

	const reordered = [...otherLines];
	// Drop any leading blanks otherLines started with so imports sit tight under <script>.
	while (reordered.length > 0 && reordered[0]!.trim() === '') reordered.shift();
	const cssLines = [appCssLine, layoutCssLine].filter((line): line is string => line !== null);
	const rebuiltBody = ['', ...themeImportLines, ...cssLines, ...reordered].join('\n');
	return snippet.replace(match[0], `${scriptOpen}${rebuiltBody}</script>`);
}

function isViteConfigPath(filePath: string): boolean {
	return VITE_CONFIG_NAMES.some((name) => filePath.endsWith(name));
}

function insertLayoutScriptSnippet(content: string, snippet: string): string | null {
	const imports = snippet
		.replace(/<\/?script>/g, '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
	const missingImports = imports.filter((line) => !content.includes(line.replace(/^\s+/, '')));
	if (missingImports.length === 0) return null;

	const scriptMatch = content.match(/<script[^>]*>/);
	let updated: string;
	if (scriptMatch) {
		const insertPos = (scriptMatch.index ?? 0) + scriptMatch[0].length;
		updated = `${content.slice(0, insertPos)}\n${missingImports.join('\n')}${content.slice(insertPos)}`;
	} else {
		updated = `<script>\n${missingImports.join('\n')}\n</script>\n\n${content}`;
	}
	return fixLayoutImportOrder(updated);
}

function insertLayoutCssVitePlugin(content: string): string | null {
	if (content.includes('dryuiLayoutCss')) return null;

	const importLine = "import { dryuiLayoutCss } from '@dryui/lint';";
	let updated = content;
	const importMatches = [...content.matchAll(/^import[^;]*;/gm)];
	const lastImport = importMatches.at(-1);
	if (lastImport?.index !== undefined) {
		const pos = lastImport.index + lastImport[0].length;
		updated = updated.slice(0, pos) + '\n' + importLine + updated.slice(pos);
	} else {
		updated = importLine + '\n' + updated;
	}

	if (/plugins\s*:\s*\[/.test(updated)) {
		return updated.replace(/plugins\s*:\s*\[/, 'plugins: [dryuiLayoutCss(), ');
	}

	if (/(defineConfig\s*\(\s*\{|export\s+default\s*\{|const\s+config\s*=\s*\{)/.test(updated)) {
		return updated.replace(
			/(defineConfig\s*\(\s*\{|export\s+default\s*\{|const\s+config\s*=\s*\{)/,
			'$1\n\tplugins: [dryuiLayoutCss()],'
		);
	}

	return null;
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
		if (step.snippet.includes('layout.css')) {
			const updated = insertLayoutScriptSnippet(content, step.snippet);
			if (!updated) return;
			writeFileSync(step.path, updated, 'utf-8');
			log(`  ~ ${step.title}`);
			return;
		}
		if (content.includes('@dryui/ui/themes/default.css')) return;
		const scriptMatch = content.match(/<script[^>]*>/);
		if (scriptMatch) {
			const insertPos = (scriptMatch.index ?? 0) + scriptMatch[0].length;
			const updated =
				content.slice(0, insertPos) +
				'\n' +
				step.snippet.replace(/<\/?script>/g, '') +
				content.slice(insertPos);
			writeFileSync(step.path, fixLayoutImportOrder(updated), 'utf-8');
		} else {
			writeFileSync(step.path, fixLayoutImportOrder(step.snippet + '\n\n' + content), 'utf-8');
		}
		log(`  ~ ${step.title}`);
		return;
	}

	if (isViteConfigPath(step.path)) {
		if (!step.snippet.includes('dryuiLayoutCss')) return;
		const updated = insertLayoutCssVitePlugin(content);
		if (!updated) return;
		writeFileSync(step.path, updated, 'utf-8');
		log(`  ~ ${step.title}`);
		return;
	}

	if (isSvelteConfigPath(step.path)) {
		if (content.includes('dryuiLint')) return;

		const importLine = "import { dryuiLint } from '@dryui/lint';";
		const lintEntry =
			"dryuiLint({ strict: true, exclude: ['.svelte-kit/', '/dist/', 'node_modules/'] })";

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

function setupClaudeAgents(targetPath: string): boolean {
	const result = ensureClaudeAgents(targetPath);
	if (result.copied.length > 0) {
		log(`  + .claude/agents/ (${result.copied.join(', ')})`);
	}
	return result.sourceFound;
}

// Wire the dryui + dryui-feedback MCP servers into ~/.codex/config.toml so a
// fresh `codex` session in this project sees them without any manual setup.
// The bundled DryUI plugin (which ships the dryui skill) still needs the
// `codex plugin marketplace add` + `/plugins` install flow; init prints a
// one-liner pointing at it. Skipped with `--no-codex`, or when the test
// harness sets DRYUI_SKIP_CODEX_SETUP=1 to keep tests off the real ~/.codex.
function setupCodexMcp(targetPath: string): boolean {
	if (
		process.env['DRYUI_SKIP_CODEX_SETUP'] === '1' ||
		process.env['DRYUI_SKIP_CODEX_SETUP'] === 'true'
	) {
		return true;
	}
	// Prefer $HOME over `homedir()` so test harnesses that swap HOME (via
	// `withHome`) land on the temp directory instead of the developer's real
	// `~/.codex/config.toml`. Real users have $HOME set anyway.
	const home = process.env['HOME'] || homedir();
	const result = runEditorInstall('codex', {
		cwd: targetPath,
		homeDir: home,
		includeSvelteMcp: true
	});
	if (!result) return false;
	const writes = result.steps.filter(
		(step) => step.status === 'created' || step.status === 'merged'
	);
	const failures = result.steps.filter((step) => step.status === 'failed');
	if (writes.length > 0) {
		log(`  + ~/.codex/config.toml (${writes.length} MCP servers wired)`);
	}
	for (const step of failures) {
		warn(
			`  Warning: ${step.label} failed (${step.detail}). Run \`dryui setup --editor codex --install\` to retry.`
		);
	}
	return result.ok;
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
		noFeedback,
		noCodex,
		devTarballsDir: explicitDevTarballsDir
	} = parseInitArgs(args);
	const runCommand = runtime.runCommand ?? runProcessCommand;

	let devTarballsDir = explicitDevTarballsDir;
	const skipWorkspaceDetect =
		process.env['DRYUI_SKIP_WORKSPACE_DETECT'] === '1' ||
		process.env['DRYUI_SKIP_WORKSPACE_DETECT'] === 'true';
	if (devTarballsDir === null && !skipWorkspaceDetect) {
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

	if (isScaffold && installsSucceeded && !noFeedback) {
		const concretePm: ConcretePackageManager =
			packageManager === 'unknown' ? 'npm' : packageManager;
		const baseInstall = runtime.installPackage ?? installPackage;
		const effectiveInstall = devTarballsManifest
			? wrapInstallPackage(baseInstall, devTarballsManifest)
			: baseInstall;
		setupFeedback(targetPath, concretePm, {
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

	if (isScaffold && installsSucceeded && !noCodex) {
		setupCodexMcp(targetPath);
	}

	const cwdIsTarget = resolve(process.cwd()) === resolve(targetPath);

	// A child process cannot chdir its parent shell, so print the path the user
	// needs to step into before starting the DryUI CLI for the new project.
	log('');
	log(isScaffold ? '  Bootstrap completed successfully.' : '  Done! DryUI is set up.');
	log('');
	log('  Next steps:');
	if (!cwdIsTarget) {
		// Preserve the user-typed path verbatim so absolute inputs aren't sliced.
		log(`    cd ${userPath ?? targetPath}`);
	}
	log('    dryui');
	log('');
}
