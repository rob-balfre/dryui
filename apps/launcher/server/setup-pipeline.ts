import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname, relative, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import type { CliId, PackageManager, SetupStepId } from './types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_DIST_PATH = resolve(__dirname, '..', '..', '..', 'packages', 'mcp', 'dist', 'index.js');
const MCP_SRC_PATH = resolve(__dirname, '..', '..', '..', 'packages', 'mcp', 'src', 'index.ts');
const STARTER_TEMPLATE_DIR = resolve(__dirname, 'templates');
const DEFAULT_SHELL_CANDIDATES = ['/bin/zsh', '/bin/bash', '/bin/sh', 'sh'] as const;

export interface StepResult {
	success: boolean;
	output?: string;
	error?: string;
}

export type ProgressCallback = (
	step: SetupStepId,
	status: 'running' | 'done' | 'failed',
	output?: string
) => void;

interface SetupContext {
	path: string;
	cli: CliId;
	packageManager: PackageManager;
	onProgress: ProgressCallback;
}

export interface PipelineResult {
	success: boolean;
	failedStep?: SetupStepId;
	error?: string;
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
}

function quoteShellArg(value: string): string {
	if (value.length === 0) {
		return "''";
	}

	return `'${value.replace(/'/g, `'\\''`)}'`;
}

function buildCommandString(command: string, args: string[]): string {
	return [command, ...args].map(quoteShellArg).join(' ');
}

function shellExists(command: string): boolean {
	return !command.includes('/') || existsSync(command);
}

export function resolveShellCommand(
	preferredShell: string | undefined = process.env['SHELL'],
	fallbacks: readonly string[] = DEFAULT_SHELL_CANDIDATES
): { command: string; args: string[] } {
	const shell =
		[preferredShell, ...fallbacks].find(
			(candidate) => Boolean(candidate) && shellExists(candidate!)
		) ?? 'sh';
	const loginArgs = shell.includes('zsh') || shell.includes('bash') ? ['-l', '-c'] : ['-c'];
	return { command: shell, args: loginArgs };
}

function getShellCommand(): { command: string; args: string[] } {
	return resolveShellCommand();
}

function getCommandEnv(): NodeJS.ProcessEnv {
	const home = process.env['HOME'];
	const pathEntries = new Set(
		[
			process.env['PATH'] ?? '',
			home ? join(home, '.bun', 'bin') : '',
			'/opt/homebrew/bin',
			'/usr/local/bin',
			'/usr/bin',
			'/bin',
			'/usr/sbin',
			'/sbin'
		]
			.join(':')
			.split(':')
			.filter(Boolean)
	);

	return {
		...process.env,
		PATH: [...pathEntries].join(':'),
		NO_COLOR: '1'
	};
}

const LOCAL_PRIMITIVES_PACKAGE = fileURLToPath(
	new URL('../../../packages/primitives', import.meta.url)
);
const LOCAL_UI_PACKAGE = fileURLToPath(new URL('../../../packages/ui', import.meta.url));

async function readPackageMetadata(
	packagePath: string
): Promise<{ name?: string; version?: string } | null> {
	try {
		const raw = await readFile(join(packagePath, 'package.json'), 'utf-8');
		return JSON.parse(raw) as { name?: string; version?: string };
	} catch {
		return null;
	}
}

async function findPackageManifestForResolvedEntry(
	entryPath: string,
	packageName: string
): Promise<string | null> {
	let currentDir = dirname(entryPath);

	while (true) {
		const manifestPath = join(currentDir, 'package.json');
		if (await fileExists(manifestPath)) {
			try {
				const raw = await readFile(manifestPath, 'utf-8');
				const pkg = JSON.parse(raw) as { name?: string };
				if (pkg.name === packageName) {
					return manifestPath;
				}
			} catch {}
		}

		const parentDir = dirname(currentDir);
		if (parentDir === currentDir) {
			return null;
		}

		currentDir = parentDir;
	}
}

function getNodeModulesManifestPath(projectPath: string, packageName: string): string {
	return join(projectPath, 'node_modules', ...packageName.split('/'), 'package.json');
}

async function resolvePackageManifest(
	projectPath: string,
	packageName: string
): Promise<string | null> {
	try {
		const projectRequire = createRequire(join(projectPath, 'package.json'));
		const entryPath = projectRequire.resolve(packageName);
		return findPackageManifestForResolvedEntry(entryPath, packageName);
	} catch {
		const manifestPath = getNodeModulesManifestPath(projectPath, packageName);
		return (await fileExists(manifestPath)) ? manifestPath : null;
	}
}

export async function getInstalledPackageVersion(
	projectPath: string,
	packageName: string
): Promise<string | null> {
	const manifestPath = await resolvePackageManifest(projectPath, packageName);
	if (!manifestPath) {
		return null;
	}

	try {
		const raw = await readFile(manifestPath, 'utf-8');
		const pkg = JSON.parse(raw) as { version?: string };
		return pkg.version ?? null;
	} catch {
		return null;
	}
}

export async function getLocalDryuiVersion(): Promise<string | null> {
	const metadata = await readPackageMetadata(LOCAL_UI_PACKAGE);
	if (metadata?.name !== '@dryui/ui') {
		return null;
	}

	return metadata.version ?? null;
}

async function getDryuiInstallArgs(
	pm: (typeof PM_INSTALL)[PackageManager],
	mode: 'install' | 'update'
): Promise<string[]> {
	const installArgs = mode === 'update' ? pm.updateArgs : pm.addArgs;
	const primitivesMetadata = await readPackageMetadata(LOCAL_PRIMITIVES_PACKAGE);
	const uiMetadata = await readPackageMetadata(LOCAL_UI_PACKAGE);

	if (primitivesMetadata?.name === '@dryui/primitives' && uiMetadata?.name === '@dryui/ui') {
		return [...installArgs, `file:${LOCAL_PRIMITIVES_PACKAGE}`, `file:${LOCAL_UI_PACKAGE}`];
	}

	return [...installArgs, '@dryui/ui'];
}

async function runCommand(command: string, args: string[], cwd: string): Promise<StepResult> {
	return new Promise((resolve) => {
		const shell = getShellCommand();
		const renderedCommand = buildCommandString(command, args);
		const child = spawn(shell.command, [...shell.args, renderedCommand], {
			cwd,
			stdio: ['ignore', 'pipe', 'pipe'],
			env: getCommandEnv()
		});

		let stdout = '';
		let stderr = '';

		child.stdout?.on('data', (chunk: Buffer) => {
			stdout += chunk.toString();
		});
		child.stderr?.on('data', (chunk: Buffer) => {
			stderr += chunk.toString();
		});

		child.on('error', (err) => {
			resolve({ success: false, error: err.message });
		});

		child.on('close', (code) => {
			const combinedOutput = [stdout.trim(), stderr.trim()].filter(Boolean).join('\n');
			if (code === 0) {
				resolve({ success: true, output: combinedOutput || renderedCommand });
			} else {
				resolve({
					success: false,
					output: combinedOutput,
					error: combinedOutput || `Command failed: ${renderedCommand} (exit ${code ?? 'unknown'})`
				});
			}
		});
	});
}

const PM_INSTALL: Record<
	PackageManager,
	{ command: string; addArgs: string[]; updateArgs: string[] }
> = {
	bun: { command: 'bun', addArgs: ['add'], updateArgs: ['update'] },
	npm: { command: 'npm', addArgs: ['install'], updateArgs: ['update'] },
	pnpm: { command: 'pnpm', addArgs: ['add'], updateArgs: ['update'] }
};

async function hasSvelteKit(projectPath: string): Promise<boolean> {
	try {
		const raw = await readFile(join(projectPath, 'package.json'), 'utf-8');
		const pkg = JSON.parse(raw) as {
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
		};
		const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
		return Boolean(allDeps['@sveltejs/kit']);
	} catch {
		return false;
	}
}

async function readStarterTemplate(relativePath: string): Promise<string> {
	return readFile(join(STARTER_TEMPLATE_DIR, relativePath), 'utf-8');
}

export async function getStarterPageSource(): Promise<string> {
	return readStarterTemplate('starter-page.svelte');
}

function getStarterFaviconSource(): string {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="18" fill="#16171f"/>
  <rect x="10" y="10" width="44" height="44" rx="14" fill="#eef2ff"/>
  <path d="M20 20h10v24H20z" fill="#1f2937"/>
  <path d="M34 20h10c4.418 0 8 3.582 8 8v0c0 4.418-3.582 8-8 8h-4v8h-6V20z" fill="#4f46e5"/>
  <circle cx="44" cy="28" r="4" fill="#f59e0b"/>
</svg>
`;
}

async function stepScaffoldSvelteKit(ctx: SetupContext): Promise<StepResult> {
	await mkdir(ctx.path, { recursive: true });

	// Ensure package.json has "type": "module" for ESM config files (always, even if SvelteKit exists)
	const pkgJsonPath = join(ctx.path, 'package.json');
	if (await fileExists(pkgJsonPath)) {
		try {
			const raw = await readFile(pkgJsonPath, 'utf-8');
			const pkg = JSON.parse(raw) as Record<string, unknown>;
			if (pkg['type'] !== 'module') {
				pkg['type'] = 'module';
				await writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
			}
		} catch {}
	}

	if (await hasSvelteKit(ctx.path)) {
		return { success: true, output: 'SvelteKit already installed' };
	}

	const pm = PM_INSTALL[ctx.packageManager];

	const result = await runCommand(
		pm.command,
		[
			...pm.addArgs,
			'svelte@latest',
			'@sveltejs/kit@latest',
			'@sveltejs/vite-plugin-svelte@latest',
			'@sveltejs/adapter-auto@latest',
			'vite@latest'
		],
		ctx.path
	);
	if (!result.success) return result;

	// Ensure package.json has "type": "module" and standard scripts after install creates it
	if (await fileExists(pkgJsonPath)) {
		try {
			const raw = await readFile(pkgJsonPath, 'utf-8');
			const pkg = JSON.parse(raw) as Record<string, unknown>;
			if (pkg['type'] !== 'module') {
				pkg['type'] = 'module';
			}
			const scripts = (pkg['scripts'] ?? {}) as Record<string, string>;
			scripts['dev'] ??= 'vite dev';
			scripts['build'] ??= 'vite build';
			scripts['preview'] ??= 'vite preview';
			pkg['scripts'] = scripts;
			await writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
		} catch {}
	}

	// Create minimal SvelteKit project structure
	const svelteConfigPath = join(ctx.path, 'svelte.config.js');
	if (!(await fileExists(svelteConfigPath))) {
		await writeFile(
			svelteConfigPath,
			[
				`import adapter from '@sveltejs/adapter-auto';`,
				``,
				`export default {`,
				`  kit: {`,
				`    adapter: adapter(),`,
				`  },`,
				`};`,
				``
			].join('\n'),
			'utf-8'
		);
	}

	const viteConfigPath = join(ctx.path, 'vite.config.js');
	if (!(await fileExists(viteConfigPath))) {
		await writeFile(
			viteConfigPath,
			[
				`import { sveltekit } from '@sveltejs/kit/vite';`,
				`import { defineConfig } from 'vite';`,
				``,
				`export default defineConfig({`,
				`  plugins: [sveltekit()],`,
				`  resolve: {`,
				`    preserveSymlinks: true,`,
				`  },`,
				`  optimizeDeps: {`,
				`    exclude: ['@dryui/primitives', '@dryui/ui'],`,
				`  },`,
				`  ssr: {`,
				`    noExternal: ['@dryui/primitives', '@dryui/ui'],`,
				`  },`,
				`});`,
				``
			].join('\n'),
			'utf-8'
		);
	}

	const srcDir = join(ctx.path, 'src');
	await mkdir(join(srcDir, 'routes'), { recursive: true });

	const appHtmlPath = join(srcDir, 'app.html');
	if (!(await fileExists(appHtmlPath))) {
		await writeFile(
			appHtmlPath,
			[
				`<!doctype html>`,
				`<html lang="en" class="theme-auto">`,
				`  <head>`,
				`    <meta charset="utf-8" />`,
				`    <meta name="viewport" content="width=device-width, initial-scale=1" />`,
				`    <link rel="icon" href="/favicon.svg" />`,
				`    %sveltekit.head%`,
				`  </head>`,
				`  <body data-sveltekit-preload-data="hover">`,
				`    <div style="display: contents">%sveltekit.body%</div>`,
				`  </body>`,
				`</html>`,
				``
			].join('\n'),
			'utf-8'
		);
	} else {
		let content = await readFile(appHtmlPath, 'utf-8');
		if (!content.includes('href="/favicon.svg"')) {
			content = content.replace(
				`    <meta name="viewport" content="width=device-width, initial-scale=1" />`,
				`    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <link rel="icon" href="/favicon.svg" />`
			);
			await writeFile(appHtmlPath, content, 'utf-8');
		}
	}

	const faviconPath = join(ctx.path, 'static', 'favicon.svg');
	await mkdir(dirname(faviconPath), { recursive: true });
	if (!(await fileExists(faviconPath))) {
		await writeFile(faviconPath, getStarterFaviconSource(), 'utf-8');
	}

	const pagePath = join(srcDir, 'routes', '+page.svelte');
	if (!(await fileExists(pagePath))) {
		await writeFile(pagePath, `${await getStarterPageSource()}\n`, 'utf-8');
	}

	return { success: true, output: 'Installed Svelte & SvelteKit, created project structure' };
}

/**
 * When packages are installed via file: links, their package.json exports
 * point to ./src/ (TypeScript source). Vite can't process these raw files
 * through PostCSS, so we patch the installed exports to point to ./dist/.
 */
const DRYUI_FILE_LINK_PACKAGES = ['@dryui/primitives', '@dryui/ui'] as const;

async function patchFileLinkedExports(
	projectPath: string,
	packageNames: readonly string[] = DRYUI_FILE_LINK_PACKAGES
): Promise<void> {
	for (const pkgName of packageNames) {
		const manifestPath = await resolvePackageManifest(projectPath, pkgName);
		if (!manifestPath) continue;

		try {
			const raw = await readFile(manifestPath, 'utf-8');
			const pkg = JSON.parse(raw);
			const exports = pkg.exports;
			if (!exports) continue;

			// Check if the main export points to src/ (file: link artifact)
			const mainExport = exports['.'];
			const entry = mainExport?.svelte ?? mainExport?.default;
			if (!entry || !entry.includes('/src/')) continue;

			// Check that dist/ exists before patching
			const pkgDir = dirname(manifestPath);
			if (!(await fileExists(join(pkgDir, 'dist')))) continue;

			// Patch all export entries: ./src/foo → ./dist/foo, .ts → .js, preserving .css
			let patched = false;
			for (const [key, value] of Object.entries(exports)) {
				if (typeof value === 'object' && value !== null) {
					const conditions = value as Record<string, string>;
					for (const [cond, path] of Object.entries(conditions)) {
						if (typeof path === 'string' && path.includes('/src/')) {
							let newPath = path.replace('/src/', '/dist/');
							if (newPath.endsWith('.ts') && !newPath.endsWith('.d.ts')) {
								newPath = newPath.replace(/\.ts$/, '.js');
							}
							conditions[cond] = newPath;
							patched = true;
						}
					}
				}
			}

			if (patched) {
				await writeFile(manifestPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
			}
		} catch {}
	}
}

async function stepInstallPackage(ctx: SetupContext): Promise<StepResult> {
	const pm = PM_INSTALL[ctx.packageManager];
	const result = await runCommand(pm.command, await getDryuiInstallArgs(pm, 'install'), ctx.path);
	if (!result.success) {
		return result;
	}

	const installedVersion = await getInstalledPackageVersion(ctx.path, '@dryui/ui');
	if (!installedVersion) {
		return {
			success: false,
			error:
				'The install command finished, but @dryui/ui is still not resolvable from this project.'
		};
	}

	// Patch file:-linked exports to point to dist/ instead of src/
	await patchFileLinkedExports(ctx.path);

	return {
		success: true,
		output: `Installed @dryui/ui ${installedVersion}`
	};
}

async function stepUpdatePackage(ctx: SetupContext): Promise<StepResult> {
	const pm = PM_INSTALL[ctx.packageManager];
	const result = await runCommand(pm.command, await getDryuiInstallArgs(pm, 'update'), ctx.path);
	if (!result.success) {
		return result;
	}

	const installedVersion = await getInstalledPackageVersion(ctx.path, '@dryui/ui');
	if (!installedVersion) {
		return {
			success: false,
			error: 'The update command finished, but @dryui/ui is still not resolvable from this project.'
		};
	}

	// Patch file:-linked exports to point to dist/ instead of src/
	await patchFileLinkedExports(ctx.path);

	return {
		success: true,
		output: `Updated @dryui/ui to ${installedVersion}`
	};
}

const FOUNDATION_CSS = `/* Global reset with DryUI tokens */
*,
*::before,
*::after {
\tbox-sizing: border-box;
\tmargin: 0;
}

html {
\tfont-family: var(--dry-font-sans);
\tcolor: var(--dry-color-text-strong);
\tbackground: var(--dry-color-bg-base);
\t-webkit-font-smoothing: antialiased;
}

body {
\tmargin: 0;
\tmin-height: 100dvh;
}
`;

async function stepAddFoundationCss(ctx: SetupContext): Promise<StepResult> {
	const appCssPath = join(ctx.path, 'src', 'app.css');

	if (await fileExists(appCssPath)) {
		const content = await readFile(appCssPath, 'utf-8');
		if (content.includes('--dry-color-bg-base')) {
			return { success: true, output: 'Foundation CSS already present' };
		}
	}

	await mkdir(join(ctx.path, 'src'), { recursive: true });
	await writeFile(appCssPath, FOUNDATION_CSS, 'utf-8');
	return { success: true, output: 'Created src/app.css with DryUI foundation reset' };
}

async function stepAddThemeImports(ctx: SetupContext): Promise<StepResult> {
	const layoutPath = join(ctx.path, 'src', 'routes', '+layout.svelte');

	const appCssImport = `  import '../app.css';`;
	const themeImports = `  import '@dryui/ui/themes/default.css';\n  import '@dryui/ui/themes/dark.css';`;
	const allImports = `${appCssImport}\n${themeImports}`;

	if (await fileExists(layoutPath)) {
		let content = await readFile(layoutPath, 'utf-8');

		if (content.includes('@dryui/ui/themes/default.css')) {
			// Theme imports already present — ensure app.css import is also present
			if (!content.includes("'../app.css'")) {
				content = content.replace(
					/import '@dryui\/ui\/themes\/default\.css';/,
					`import '../app.css';\n  import '@dryui/ui/themes/default.css';`
				);
				await writeFile(layoutPath, content, 'utf-8');
				return { success: true, output: 'Added app.css import to existing layout' };
			}
			return { success: true, output: 'Theme imports already present' };
		}

		const scriptMatch = content.match(/<script[^>]*>/);
		if (scriptMatch) {
			const insertPos = (scriptMatch.index ?? 0) + scriptMatch[0].length;
			content = content.slice(0, insertPos) + '\n' + allImports + content.slice(insertPos);
		} else {
			content = `<script>\n${allImports}\n</script>\n\n${content}`;
		}

		await writeFile(layoutPath, content, 'utf-8');
		return {
			success: true,
			output: 'Injected theme and foundation CSS imports into +layout.svelte'
		};
	}

	await mkdir(dirname(layoutPath), { recursive: true });
	const newLayout = `<script>\n${allImports}\n\n  let { children } = $props();\n</script>\n\n{@render children()}\n`;
	await writeFile(layoutPath, newLayout, 'utf-8');
	return { success: true, output: 'Created +layout.svelte with theme and foundation CSS imports' };
}

async function stepSetThemeClass(ctx: SetupContext): Promise<StepResult> {
	const appHtmlPath = join(ctx.path, 'src', 'app.html');

	if (!(await fileExists(appHtmlPath))) {
		return { success: true, output: 'No app.html found, skipped' };
	}

	let content = await readFile(appHtmlPath, 'utf-8');

	if (content.includes('theme-auto')) {
		return { success: true, output: 'theme-auto class already set' };
	}

	content = content.replace(/<html([^>]*)>/, (match, attrs: string) => {
		if (attrs.includes('class=')) {
			return match.replace(/class="([^"]*)"/, 'class="$1 theme-auto"');
		}
		return `<html${attrs} class="theme-auto">`;
	});

	await writeFile(appHtmlPath, content, 'utf-8');
	return { success: true, output: 'Added theme-auto class to <html>' };
}

const MCP_CONFIGS: Partial<Record<CliId, { path: string; format: 'json' | 'toml' }>> = {
	'claude-code': { path: '.mcp.json', format: 'json' },
	codex: { path: '.codex/config.toml', format: 'toml' },
	cursor: { path: '.cursor/mcp.json', format: 'json' },
	'gemini-cli': { path: '.gemini/settings.json', format: 'json' }
};

async function getDryuiMcpRuntime(): Promise<{ command: string; args: string[] }> {
	if (await fileExists(MCP_DIST_PATH)) {
		return { command: 'node', args: [MCP_DIST_PATH] };
	}

	return { command: 'bun', args: [MCP_SRC_PATH] };
}

async function stepConfigureMcp(ctx: SetupContext): Promise<StepResult> {
	const config = MCP_CONFIGS[ctx.cli];
	if (!config) {
		return { success: true, output: `No MCP config path known for ${ctx.cli}, skipped` };
	}

	const configPath = join(ctx.path, config.path);
	const runtime = await getDryuiMcpRuntime();

	if (config.format === 'json') {
		let existing: Record<string, unknown> = {};
		if (await fileExists(configPath)) {
			try {
				existing = JSON.parse(await readFile(configPath, 'utf-8'));
			} catch {
				existing = {};
			}
		}

		const mcpServers = (existing['mcpServers'] ?? {}) as Record<string, unknown>;
		mcpServers['dryui'] = {
			type: 'stdio',
			command: runtime.command,
			args: runtime.args
		};
		existing['mcpServers'] = mcpServers;

		await mkdir(dirname(configPath), { recursive: true });
		await writeFile(configPath, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
		return { success: true, output: `Configured DryUI MCP server in ${config.path}` };
	}

	if (config.format === 'toml') {
		const tomlArgs = runtime.args.map((arg) => `"${arg}"`).join(', ');
		const tomlBlock = `\n[mcp_servers.dryui]\ncommand = "${runtime.command}"\nargs = [${tomlArgs}]\n`;
		let existing = '';
		if (await fileExists(configPath)) {
			existing = await readFile(configPath, 'utf-8');
			if (existing.includes('[mcp_servers.dryui]')) {
				return { success: true, output: 'DryUI MCP already configured in config.toml' };
			}
		}
		await mkdir(dirname(configPath), { recursive: true });
		await writeFile(configPath, existing + tomlBlock, 'utf-8');
		return { success: true, output: `Configured DryUI MCP server in ${config.path}` };
	}

	return { success: true, output: 'Unknown config format, skipped' };
}

interface InstanceScriptBounds {
	openTagStart: number;
	openTagEnd: number;
	closeTagStart: number;
	attributes: string;
}

function getInstanceScriptBounds(content: string): InstanceScriptBounds | null {
	const scriptRegex = /<script\b([^>]*)>/g;
	let match: RegExpExecArray | null;

	while ((match = scriptRegex.exec(content)) !== null) {
		const attributes = match[1] ?? '';
		if (/\bmodule\b/.test(attributes)) {
			continue;
		}

		const openTagStart = match.index;
		const openTagEnd = openTagStart + match[0].length;
		const closeTagStart = content.indexOf('</script>', openTagEnd);
		if (closeTagStart === -1) {
			return null;
		}

		return {
			openTagStart,
			openTagEnd,
			closeTagStart,
			attributes
		};
	}

	return null;
}

async function runSteps(
	ctx: SetupContext,
	steps: { id: SetupStepId; fn: (ctx: SetupContext) => Promise<StepResult> }[]
): Promise<PipelineResult> {
	for (const step of steps) {
		ctx.onProgress(step.id, 'running');

		try {
			const result = await step.fn(ctx);
			if (result.success) {
				ctx.onProgress(step.id, 'done', result.output);
				continue;
			}

			ctx.onProgress(step.id, 'failed', result.error);
			return {
				success: false,
				failedStep: step.id,
				error: result.error
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			ctx.onProgress(step.id, 'failed', message);
			return {
				success: false,
				failedStep: step.id,
				error: message
			};
		}
	}

	return { success: true };
}

export async function runInstallPipeline(ctx: SetupContext): Promise<PipelineResult> {
	const steps: { id: SetupStepId; fn: (ctx: SetupContext) => Promise<StepResult> }[] = [
		{ id: 'scaffold-sveltekit', fn: stepScaffoldSvelteKit },
		{ id: 'install-package', fn: stepInstallPackage },
		{ id: 'add-foundation-css', fn: stepAddFoundationCss },
		{ id: 'add-theme-imports', fn: stepAddThemeImports },
		{ id: 'set-theme-class', fn: stepSetThemeClass },
		{ id: 'configure-mcp', fn: stepConfigureMcp }
	];

	return runSteps(ctx, steps);
}

export async function runUpdatePipeline(
	ctx: SetupContext,
	oldVersion: string,
	newVersion: string
): Promise<PipelineResult> {
	const CLI_COMMANDS: Record<string, { command: string; args: string[] }> = {
		'claude-code': { command: 'claude', args: ['--print', '--output-format', 'stream-json'] },
		codex: { command: 'codex', args: ['exec', '--json', '--skip-git-repo-check'] },
		'gemini-cli': { command: 'gemini', args: ['--output-format', 'stream-json', '--prompt'] },
		'copilot-cli': { command: 'copilot', args: ['--output-format', 'json', '-p'] },
		opencode: { command: 'opencode', args: ['run', '--format', 'json'] },
		cursor: { command: 'agent', args: ['-p', '--output-format', 'stream-json'] }
	};

	const steps: { id: SetupStepId; fn: (ctx: SetupContext) => Promise<StepResult> }[] = [
		{ id: 'update-package', fn: stepUpdatePackage },
		{
			id: 'run-migration',
			fn: async (pipelineCtx) => {
				const cliCmd = CLI_COMMANDS[pipelineCtx.cli];
				if (!cliCmd) {
					return { success: true, output: 'No CLI command configured, skipped migration' };
				}

				const prompt = `DryUI was updated from ${oldVersion} to ${newVersion}. Check for breaking changes and fix any affected components in this project.`;
				return runCommand(cliCmd.command, [...cliCmd.args, prompt], pipelineCtx.path);
			}
		},
		{ id: 'verify-mcp', fn: stepConfigureMcp }
	];

	return runSteps(ctx, steps);
}

function toImportSpecifier(fromFilePath: string, toFilePath: string): string {
	const relPath = relative(dirname(fromFilePath), toFilePath).replace(/\\/g, '/');
	return relPath.startsWith('.') ? relPath : `./${relPath}`;
}

export async function applyTheme(
	projectPath: string,
	defaultCss: string,
	darkCss: string
): Promise<void> {
	const srcDir = join(projectPath, 'src');
	await mkdir(srcDir, { recursive: true });

	const themeCssPath = join(srcDir, 'theme.css');
	const themeContent = defaultCss + '\n\n' + darkCss;
	await writeFile(themeCssPath, themeContent, 'utf-8');

	const layoutPath = join(srcDir, 'routes', '+layout.svelte');
	if (!(await fileExists(layoutPath))) {
		return;
	}

	let content = await readFile(layoutPath, 'utf-8');

	if (/import\s+['"][^'"]*theme\.css['"]/.test(content)) {
		return;
	}

	const importPath = toImportSpecifier(layoutPath, themeCssPath);
	const importLine = `  import '${importPath}';`;

	// Insert after the last @dryui/ui/themes/ import line
	const themeImportRegex = /^.*@dryui\/ui\/themes\/.*$/gm;
	let lastMatchEnd = -1;
	let match: RegExpExecArray | null;
	while ((match = themeImportRegex.exec(content)) !== null) {
		lastMatchEnd = match.index + match[0].length;
	}

	if (lastMatchEnd !== -1) {
		content = content.slice(0, lastMatchEnd) + `\n${importLine}` + content.slice(lastMatchEnd);
	} else {
		// No DryUI theme import found — insert after the <script> tag
		const scriptBounds = getInstanceScriptBounds(content);
		if (scriptBounds) {
			content =
				content.slice(0, scriptBounds.openTagEnd) +
				`\n${importLine}` +
				content.slice(scriptBounds.openTagEnd);
		} else {
			content = `<script>\n${importLine}\n</script>\n\n${content}`;
		}
	}

	await writeFile(layoutPath, content, 'utf-8');
}
