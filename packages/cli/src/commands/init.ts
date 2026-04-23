// dryui init — Bootstrap a SvelteKit + DryUI project

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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
	type MountFeedbackOptions
} from './launch-utils.js';
import { runUserProjectLauncher } from './launcher.js';
import {
	injectOverridesIntoPackageJson,
	loadDevTarballsManifest,
	rewriteInstallCommand,
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
	devTarballsDir: string | null;
}

interface InitRuntime {
	runCommand?: (command: string, cwd: string) => boolean;
	installPackage?: (options: InstallPackageOptions) => boolean;
	mountFeedback?: (options: MountFeedbackOptions) => boolean;
	patchViteConfig?: (configPath: string) => boolean;
	findViteConfig?: (root: string) => string | null;
	isInteractiveTTY?: () => boolean;
	promptLaunch?: () => Promise<boolean>;
	runLauncher?: (cwd: string, spec: Spec) => Promise<void>;
}

function parseInitArgs(args: string[]): InitOptions {
	let targetPath = process.cwd();
	let userPath: string | null = null;
	let packageManager: DryuiPackageManager | null = null;
	let noLaunch = false;
	let noFeedback = false;
	let devTarballsDir: string | null = null;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]!;
		const next = args[i + 1];
		if (arg === '--pm' && next) {
			if (next === 'bun' || next === 'pnpm' || next === 'npm' || next === 'yarn') {
				packageManager = next;
			}
			i++;
		} else if (arg === '--no-launch') {
			noLaunch = true;
		} else if (arg === '--no-feedback') {
			noFeedback = true;
		} else if (arg === '--dev-tarballs' && next) {
			devTarballsDir = resolve(process.cwd(), next);
			i++;
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

function runShellCommand(command: string, cwd: string): boolean {
	const result = spawnSync(command, { cwd, stdio: 'inherit', shell: true });
	return result.status === 0;
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

async function promptLaunchFeedbackDefault(): Promise<boolean> {
	const previousRawMode = Boolean(input.isRaw);
	if (typeof input.setRawMode === 'function') {
		input.setRawMode(false);
	}
	input.resume();

	const rl = createInterface({ input, output });
	try {
		const answer = (await rl.question('  Launch feedback dashboard now? (Y/n) '))
			.trim()
			.toLowerCase();
		if (!answer) return true;
		return answer === 'y' || answer === 'yes';
	} finally {
		rl.close();
		if (typeof input.setRawMode === 'function') {
			input.setRawMode(previousRawMode);
		}
	}
}

async function runLauncherDefault(cwd: string, spec: Spec): Promise<void> {
	await runUserProjectLauncher([], { cwd, spec });
}

function applyDevTarballsToSteps(
	steps: InstallPlan['steps'],
	manifest: DevTarballsManifest
): ProjectPlanStep[] {
	return steps.map((step) => {
		if (step.kind === 'create-file' && step.path?.endsWith('/package.json') && step.snippet) {
			return { ...step, snippet: injectOverridesIntoPackageJson(step.snippet, manifest) };
		}
		if ((step.kind === 'run-command' || step.kind === 'install-package') && step.command) {
			return { ...step, command: rewriteInstallCommand(step.command, manifest) };
		}
		return step;
	});
}

export async function runInit(
	args: string[],
	spec: Spec,
	runtime: InitRuntime = {}
): Promise<void> {
	if (args[0] === '--help') {
		console.log('Usage: dryui init [path] [--pm bun|npm|pnpm|yarn] [--no-launch] [--no-feedback]');
		console.log('');
		console.log('Bootstrap a SvelteKit + DryUI project.');
		console.log('');
		console.log('Options:');
		console.log('  [path]           Target directory (default: current directory)');
		console.log('  --pm <manager>   Package manager: bun, npm, pnpm, yarn (auto-detected)');
		console.log('  --no-launch      Skip the feedback dashboard launch prompt after scaffold');
		console.log('  --no-feedback    Skip installing @dryui/feedback and mounting <Feedback />');
		// --dev-tarballs <dir> is an internal flag used by the repo's E2E harness; it's not
		// documented here on purpose. See packages/cli/src/commands/dev-tarballs.ts.
		process.exit(0);
	}

	const { targetPath, userPath, packageManager, noLaunch, noFeedback, devTarballsDir } =
		parseInitArgs(args);
	const runCommand = runtime.runCommand ?? runShellCommand;

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
				log(`  Installing dependencies...`);
				const ok = runCommand(step.command, targetPath);
				if (!ok) {
					installsSucceeded = false;
					warn(`  Warning: "${step.command}" failed. Run it manually.`);
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

	const tty = (runtime.isInteractiveTTY ?? isInteractiveTTY)();
	if (isScaffold && feedbackReady && !noLaunch && tty) {
		log('');
		const shouldLaunch = await (runtime.promptLaunch ?? promptLaunchFeedbackDefault)();
		if (shouldLaunch) {
			log('');
			log('  Launching feedback dashboard...');
			log('');
			await (runtime.runLauncher ?? runLauncherDefault)(targetPath, spec);
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
		log(
			'  Tip: run `bunx @dryui/cli` in the project to open the feedback dashboard alongside dev.'
		);
	}
	log('');
}
