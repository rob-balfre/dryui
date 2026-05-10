import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type DryuiConsumerPackage =
	| '@dryui/ui'
	| '@dryui/primitives'
	| '@dryui/feedback'
	| '@dryui/feedback-server'
	| '@dryui/lint';

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
		'@dryui/feedback-server',
		'lucide-svelte',
		'dryuiLint({ strict: true })',
		'dryuiLayoutCss()',
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

export const REQUIRED_DRYUI_PACKAGES: readonly DryuiConsumerPackage[] = [
	'@dryui/ui',
	'@dryui/primitives',
	'@dryui/feedback',
	'@dryui/feedback-server',
	'@dryui/lint'
];

const PACKAGE_JSON = 'package.json';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DRYUI_SKILLS_SOURCE = 'skills';
const AGENT_SKILL_TARGETS = [
	'skills',
	'.agents/skills',
	'.claude/skills',
	'.codex/skills'
] as const;

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
	if (readdirSync(projectDir).length > 0) {
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

function copyProjectDirectory(
	projectDir: string,
	sourcePath: string,
	targetPath: string,
	files: string[]
): void {
	const absSource = resolve(repoRoot, sourcePath);
	if (!existsSync(absSource)) {
		throw new Error(`E2E scaffold source missing at ${absSource}`);
	}
	const absTarget = resolve(projectDir, targetPath);
	mkdirSync(dirname(absTarget), { recursive: true });
	cpSync(absSource, absTarget, {
		recursive: true,
		filter: (path) => !path.endsWith('/.DS_Store')
	});
	files.push(targetPath);
}

function copyDryuiAgentSkillBundle(projectDir: string, files: string[]): void {
	for (const target of AGENT_SKILL_TARGETS) {
		copyProjectDirectory(projectDir, DRYUI_SKILLS_SOURCE, target, files);
	}
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
					'@dryui/ui': packages['@dryui/ui'],
					'lucide-svelte': '^1.0.1'
				},
				devDependencies: {
					'@dryui/feedback': packages['@dryui/feedback'],
					'@dryui/feedback-server': packages['@dryui/feedback-server'],
					'@dryui/lint': packages['@dryui/lint'],
					'@dryui/primitives': packages['@dryui/primitives'],
					'@types/node': '^25.6.2',
					'@sveltejs/kit': '^2.59.0',
					'@sveltejs/vite-plugin-svelte': '^7.0.0',
					svelte: '^5.55.5',
					'svelte-check': '^4.4.7',
					typescript: '^6.0.3',
					vite: '^8.0.10'
				},
				overrides: {
					'@dryui/feedback': packages['@dryui/feedback'],
					'@dryui/feedback-server': packages['@dryui/feedback-server'],
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
	return {
		name: 'dryui-e2e-adapter',
		async adapt() {}
	};
}

export default {
	preprocess: [dryuiLint({ strict: true, exclude: ['/.svelte-kit/'] }), vitePreprocess()],
	kit: {
		adapter: dryuiE2eAdapter()
	}
};
`;

const VITE_CONFIG = `import { sveltekit } from '@sveltejs/kit/vite';
import { dryuiLayoutCss } from '@dryui/lint';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [dryuiLayoutCss(), sveltekit()]
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
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div>%sveltekit.body%</div>
	</body>
</html>
`;

const APP_CSS = `:root {
	color-scheme: light dark;
}

html {
	min-block-size: 100%;
}

body {
	min-block-size: 100%;
	margin: 0;
	container-type: inline-size;
	container-name: page;
	font-family: var(--dry-font-sans);
}

body > div {
	min-block-size: 100%;
}

button,
input,
textarea,
select {
	font: inherit;
}

a {
	color: inherit;
}
`;

const LAYOUT_CSS = `/* Add [data-layout="<name>"] blocks here as routes need them. */
`;

const ROOT_LAYOUT = `<script lang="ts">
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';
	import '../app.css';
	import '../layout.css';

	let { children } = $props();
</script>

{@render children()}
`;

const HOME_PAGE = `<script lang="ts">
	import { Heading } from '@dryui/ui/heading';
</script>

<main data-layout="home">
	<Heading level={1}>Hello DryUI</Heading>
</main>
`;

const AGENTS_MD = `# AGENTS.md

Generated DryUI E2E consumer project.

- Before editing UI, load \`skills/dryui-build/SKILL.md\`.
- For setup context only, use \`skills/dryui-init/SKILL.md\`.
- Canonical DryUI skills are vendored into \`skills/\`, \`.agents/skills/\`, \`.claude/skills/\`, and \`.codex/skills/\` so isolated Codex and Claude runs do not depend on machine-local skill installs.
- Keep route layout hooks in \`src/layout.css\`; keep visual styling in route/component CSS using DryUI tokens.
`;

const CLAUDE_MD = `# CLAUDE.md

Generated DryUI E2E consumer project.

Load \`skills/dryui-build/SKILL.md\` before implementing the requested UI. The same DryUI skills are also copied to \`.claude/skills/\` for Claude Code skill discovery.
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
	writeProjectFile(projectDir, 'AGENTS.md', AGENTS_MD, filesWritten);
	writeProjectFile(projectDir, 'CLAUDE.md', CLAUDE_MD, filesWritten);
	copyDryuiAgentSkillBundle(projectDir, filesWritten);
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
