// dryui init — Bootstrap a SvelteKit + DryUI project

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Spec } from './types.js';
import {
	planInstall,
	detectPackageManagerFromEnv,
	isSvelteConfigPath,
	type DryuiPackageManager,
	type ProjectPlanStep
} from '@dryui/mcp/project-planner';

interface InitOptions {
	targetPath: string;
	packageManager: DryuiPackageManager;
}

function parseInitArgs(args: string[]): InitOptions {
	let targetPath = process.cwd();
	let packageManager: DryuiPackageManager | null = null;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]!;
		const next = args[i + 1];
		if (arg === '--pm' && next) {
			if (next === 'bun' || next === 'pnpm' || next === 'npm' || next === 'yarn') {
				packageManager = next;
			}
			i++;
		} else if (!arg.startsWith('-')) {
			targetPath = resolve(process.cwd(), arg);
		}
	}

	return {
		targetPath,
		packageManager: packageManager ?? detectPackageManagerFromEnv()
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

function executeCreateFile(step: ProjectPlanStep): void {
	if (!step.path || !step.snippet) return;
	mkdirSync(dirname(step.path), { recursive: true });
	writeFileSync(step.path, step.snippet, 'utf-8');
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

export function runInit(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log('Usage: dryui init [path] [--pm bun|npm|pnpm|yarn]');
		console.log('');
		console.log('Bootstrap a SvelteKit + DryUI project.');
		console.log('');
		console.log('Options:');
		console.log('  [path]           Target directory (default: current directory)');
		console.log('  --pm <manager>   Package manager: bun, npm, pnpm, yarn (auto-detected)');
		process.exit(0);
	}

	const { targetPath, packageManager } = parseInitArgs(args);

	if (!existsSync(targetPath)) {
		mkdirSync(targetPath, { recursive: true });
	}

	const plan = planInstall(spec, targetPath, { packageManager });

	const firstStep = plan.steps[0];
	if (
		plan.steps.length === 1 &&
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

	for (const step of plan.steps) {
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
				const ok = runShellCommand(step.command, targetPath);
				if (!ok) {
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
		const relPath = targetPath.startsWith(process.cwd())
			? targetPath.slice(process.cwd().length + 1)
			: targetPath;
		log(`    cd ${relPath}`);
	}
	log(`    ${devCommand}`);
	log('');
}
