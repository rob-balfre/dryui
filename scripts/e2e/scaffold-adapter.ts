import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type DryuiConsumerPackage = '@dryui/ui' | '@dryui/primitives' | '@dryui/feedback' | '@dryui/lint';

export const DRYUI_INIT_SKILL_CONTRACT = {
	sourcePath: 'skills/dryui-init/SKILL.md',
	anchor: 'golden-consumer-setup-contract',
	adapterRole: 'E2E scaffold Adapter for the dryui-init setup Interface',
	requiredSkillMarkers: [
		'## Golden Consumer Setup Contract',
		'concrete Adapter',
		'npx skills add rob-balfre/dryui',
		'@dryui/ui',
		'@dryui/lint',
		'@dryui/feedback',
		'<Feedback',
		'dryuiLint({ strict: true })',
		'dryuiLayoutCss()',
		'<html class="theme-auto">',
		'src/routes/+layout.svelte',
		'src/layout.css'
	] as const
} as const;

interface TarballManifestPackage {
	readonly version: unknown;
	readonly tarball: unknown;
}

interface TarballManifest {
	readonly packages?: Record<string, TarballManifestPackage>;
}

export interface ScaffoldDryuiConsumerProjectOptions {
	readonly projectDir: string;
	readonly tarballsDir: string;
	readonly logPath?: string;
	readonly install?: boolean;
}

export interface ScaffoldDryuiConsumerProjectResult {
	readonly projectDir: string;
	readonly manifestPath: string;
	readonly contractSourcePath: string;
	readonly contractAnchor: string;
	readonly filesWritten: readonly string[];
	readonly installed: boolean;
}

const REQUIRED_DRYUI_PACKAGES: readonly DryuiConsumerPackage[] = [
	'@dryui/ui',
	'@dryui/primitives',
	'@dryui/feedback',
	'@dryui/lint'
];

const PACKAGE_JSON = 'package.json';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function fileDependency(tarballPath: string): string {
	return `file:${tarballPath}`;
}

function readManifest(tarballsDir: string): {
	manifestPath: string;
	packages: Record<DryuiConsumerPackage, string>;
} {
	const manifestPath = resolve(tarballsDir, 'manifest.json');
	if (!existsSync(manifestPath)) {
		throw new Error(`tarballs manifest missing at ${manifestPath}`);
	}

	const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as TarballManifest;
	const packages = {} as Record<DryuiConsumerPackage, string>;

	for (const name of REQUIRED_DRYUI_PACKAGES) {
		const entry = manifest.packages?.[name];
		if (!entry || typeof entry.tarball !== 'string' || entry.tarball.length === 0) {
			throw new Error(`tarballs manifest is missing ${name}`);
		}
		const tarballPath = resolve(entry.tarball);
		if (!existsSync(tarballPath)) {
			throw new Error(`tarball for ${name} does not exist at ${tarballPath}`);
		}
		packages[name] = fileDependency(tarballPath);
	}

	return { manifestPath, packages };
}

function verifyDryuiInitSkillContract(): void {
	const skillPath = resolve(repoRoot, DRYUI_INIT_SKILL_CONTRACT.sourcePath);
	if (!existsSync(skillPath)) {
		throw new Error(`dryui-init setup contract missing at ${skillPath}`);
	}

	const skill = readFileSync(skillPath, 'utf8');
	const missing = DRYUI_INIT_SKILL_CONTRACT.requiredSkillMarkers.filter(
		(marker) => !skill.includes(marker)
	);
	if (missing.length > 0) {
		throw new Error(
			`${DRYUI_INIT_SKILL_CONTRACT.adapterRole} drift: ${DRYUI_INIT_SKILL_CONTRACT.sourcePath} is missing ${missing
				.map((marker) => JSON.stringify(marker))
				.join(', ')}`
		);
	}
}

function ensureEmptyProjectDir(projectDir: string): void {
	mkdirSync(projectDir, { recursive: true });
	const stat = statSync(projectDir);
	if (!stat.isDirectory()) {
		throw new Error(`E2E scaffold target is not a directory: ${projectDir}`);
	}
	const entries = readdirSync(projectDir);
	if (entries.length > 0) {
		throw new Error(`E2E scaffold target must be empty: ${projectDir}`);
	}
}

function writeProjectFile(
	projectDir: string,
	path: string,
	content: string,
	files: string[]
): void {
	const absPath = resolve(projectDir, path);
	mkdirSync(dirname(absPath), { recursive: true });
	writeFileSync(absPath, content);
	files.push(path);
}

function installDependencies(projectDir: string): string {
	const result = spawnSync('bun', ['install'], {
		cwd: projectDir,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	});
	const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`bun install exited ${result.status}\n${output}`);
	}
	return output;
}

function scaffoldPackageJson(packages: Record<DryuiConsumerPackage, string>): string {
	return (
		JSON.stringify(
			{
				name: 'dryui-e2e-consumer',
				version: '0.0.0',
				private: true,
				type: 'module',
				scripts: {
					dev: 'vite dev',
					build: 'vite build',
					preview: 'vite preview',
					check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json'
				},
				dependencies: {
					'@dryui/feedback': packages['@dryui/feedback'],
					'@dryui/primitives': packages['@dryui/primitives'],
					'@dryui/ui': packages['@dryui/ui'],
					'lucide-svelte': '^1.0.1'
				},
				devDependencies: {
					'@dryui/lint': packages['@dryui/lint'],
					'@sveltejs/kit': '^2.59.0',
					'@sveltejs/vite-plugin-svelte': '^7.0.0',
					svelte: '^5.55.5',
					'svelte-check': '^4.4.7',
					typescript: '^6.0.3',
					vite: '^8.0.10'
				},
				overrides: {
					'@dryui/feedback': packages['@dryui/feedback'],
					'@dryui/primitives': packages['@dryui/primitives'],
					'@dryui/ui': packages['@dryui/ui'],
					'@dryui/lint': packages['@dryui/lint']
				}
			},
			null,
			2
		) + '\n'
	);
}

const SVELTE_CONFIG = `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { dryuiLint } from '@dryui/lint';

function dryuiE2eAdapter() {
\treturn {
\t\tname: 'dryui-e2e-adapter',
\t\tasync adapt() {}
\t};
}

export default {
\tpreprocess: [dryuiLint({ strict: true, exclude: ['/.svelte-kit/'] }), vitePreprocess()],
\tkit: {
\t\tadapter: dryuiE2eAdapter()
\t}
};
`;

const VITE_CONFIG = `import { sveltekit } from '@sveltejs/kit/vite';
import { dryuiLayoutCss } from '@dryui/lint';
import { defineConfig } from 'vite';

export default defineConfig({
\tplugins: [dryuiLayoutCss(), sveltekit()]
});
`;

const TSCONFIG = `{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true
  }
}
`;

const APP_HTML = `<!doctype html>
<html lang="en" class="theme-auto">
\t<head>
\t\t<meta charset="utf-8" />
\t\t<meta name="viewport" content="width=device-width, initial-scale=1" />
\t\t%sveltekit.head%
\t</head>
\t<body data-sveltekit-preload-data="hover">
\t\t<div>%sveltekit.body%</div>
\t</body>
</html>
`;

const APP_CSS = `:root {
\tcolor-scheme: light dark;
}

html {
\tmin-block-size: 100%;
\tbackground: var(--dry-color-bg-base);
}

body {
\tmin-block-size: 100%;
\tmargin: 0;
\tcontainer-type: inline-size;
\tcontainer-name: page;
\tbackground: var(--dry-color-bg-base);
\tcolor: var(--dry-color-text-strong);
\tfont-family:
\t\tvar(--dry-font-sans, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
\t\tRoboto, "Helvetica Neue", Arial, sans-serif);
}

body > div {
\tmin-block-size: 100%;
}

button,
input,
textarea,
select {
\tfont: inherit;
}

a {
\tcolor: inherit;
}
`;

const LAYOUT_CSS = `[data-layout='home'] {
\tdisplay: grid;
\tmin-block-size: 100svh;
\tgrid-template-columns: minmax(1rem, 1fr) minmax(0, 72ch) minmax(1rem, 1fr);
\talign-items: center;
\tpadding-block: var(--dry-space-8);
}

[data-layout='home'] > [data-layout-area='intro'] {
\tgrid-column: 2;
}

@container page (min-width: 48rem) {
\t[data-layout='home'] {
\t\tgrid-template-columns: minmax(2rem, 1fr) minmax(0, 76ch) minmax(2rem, 1fr);
\t}
}
`;

const ROOT_LAYOUT = `<script lang="ts">
\timport '@dryui/ui/themes/default.css';
\timport '@dryui/ui/themes/dark.css';
\timport '../app.css';
\timport '../layout.css';
\timport { Feedback } from '@dryui/feedback';

\tlet { children } = $props();
</script>

{@render children?.()}

<Feedback serverUrl="http://localhost:4748" />
`;

const HOME_PAGE = `<script lang="ts">
\timport { Button } from '@dryui/ui/button';
\timport { Heading } from '@dryui/ui/heading';
\timport { Text } from '@dryui/ui/text';
</script>

<svelte:head>
\t<title>DryUI E2E Scaffold</title>
</svelte:head>

<main data-layout="home">
\t<section class="intro-panel" data-layout-area="intro">
\t\t<p class="eyebrow">DryUI E2E</p>
\t\t<Heading level={1}>DryUI scaffold ready</Heading>
\t\t<Text>A minimal SvelteKit consumer wired to local DryUI tarballs.</Text>
\t\t<Button>Start building</Button>
\t</section>
</main>

<style>
\t.intro-panel {
\t\tpadding: clamp(1.5rem, 4vw, 3rem);
\t\tborder: 1px solid var(--dry-color-stroke-weak);
\t\tborder-radius: var(--dry-radius-card, 0.75rem);
\t\tbackground: var(--dry-color-bg-raised);
\t\tbox-shadow: var(--dry-shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.08));
\t}

\t.eyebrow {
\t\tmargin: 0 0 0.75rem;
\t\tcolor: var(--dry-color-text-weak);
\t\tfont-size: 0.78rem;
\t\tfont-weight: 700;
\t\tletter-spacing: 0;
\t\ttext-transform: uppercase;
\t}
</style>
`;

export function scaffoldDryuiConsumerProject(
	options: ScaffoldDryuiConsumerProjectOptions
): ScaffoldDryuiConsumerProjectResult {
	const projectDir = resolve(options.projectDir);
	const tarballsDir = resolve(options.tarballsDir);
	const install = options.install !== false;
	const filesWritten: string[] = [];
	const logLines: string[] = [];
	verifyDryuiInitSkillContract();
	const { manifestPath, packages } = readManifest(tarballsDir);

	ensureEmptyProjectDir(projectDir);

	writeProjectFile(projectDir, PACKAGE_JSON, scaffoldPackageJson(packages), filesWritten);
	writeProjectFile(projectDir, 'svelte.config.js', SVELTE_CONFIG, filesWritten);
	writeProjectFile(projectDir, 'vite.config.ts', VITE_CONFIG, filesWritten);
	writeProjectFile(projectDir, 'tsconfig.json', TSCONFIG, filesWritten);
	writeProjectFile(projectDir, 'src/app.html', APP_HTML, filesWritten);
	writeProjectFile(projectDir, 'src/app.css', APP_CSS, filesWritten);
	writeProjectFile(projectDir, 'src/layout.css', LAYOUT_CSS, filesWritten);
	writeProjectFile(projectDir, 'src/routes/+layout.svelte', ROOT_LAYOUT, filesWritten);
	writeProjectFile(projectDir, 'src/routes/+page.svelte', HOME_PAGE, filesWritten);

	logLines.push(
		`contract: ${DRYUI_INIT_SKILL_CONTRACT.sourcePath}#${DRYUI_INIT_SKILL_CONTRACT.anchor}`
	);
	logLines.push(`adapter: ${DRYUI_INIT_SKILL_CONTRACT.adapterRole}`);
	logLines.push(`manifest: ${manifestPath}`);
	logLines.push(`project: ${projectDir}`);
	logLines.push(`files: ${filesWritten.join(', ')}`);

	let installOutput = '';
	if (install) {
		installOutput = installDependencies(projectDir);
		logLines.push('');
		logLines.push('$ bun install');
		logLines.push(installOutput.trim());
	} else {
		logLines.push('');
		logLines.push('bun install skipped');
	}

	if (options.logPath) {
		mkdirSync(dirname(resolve(options.logPath)), { recursive: true });
		writeFileSync(resolve(options.logPath), logLines.join('\n').trimEnd() + '\n');
	}

	return {
		projectDir,
		manifestPath,
		contractSourcePath: DRYUI_INIT_SKILL_CONTRACT.sourcePath,
		contractAnchor: DRYUI_INIT_SKILL_CONTRACT.anchor,
		filesWritten,
		installed: install
	};
}
