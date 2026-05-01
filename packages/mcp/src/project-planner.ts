import { existsSync, readFileSync, readdirSync, statSync, type Dirent } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';

export type DryuiFramework = 'sveltekit' | 'svelte' | 'unknown';
export type DryuiPackageManager = 'bun' | 'pnpm' | 'npm' | 'yarn' | 'unknown';
export type DryuiProjectStatus = 'ready' | 'partial' | 'unsupported';
export type DryuiPlanStepKind =
	| 'install-package'
	| 'run-command'
	| 'edit-file'
	| 'create-file'
	| 'note'
	| 'blocked';
export type DryuiPlanStepStatus = 'done' | 'pending' | 'info' | 'blocked';

export interface ProjectPlannerComponentDef {
	readonly import: string;
	readonly example: string;
}

export interface ProjectPlannerSpec {
	readonly themeImports: {
		readonly default: string;
		readonly dark: string;
	};
	readonly components: Record<string, ProjectPlannerComponentDef>;
}

export interface ProjectDetection {
	readonly inputPath: string;
	readonly root: string | null;
	readonly packageJsonPath: string | null;
	readonly framework: DryuiFramework;
	readonly packageManager: DryuiPackageManager;
	readonly status: DryuiProjectStatus;
	readonly dependencies: {
		readonly ui: boolean;
		readonly primitives: boolean;
		readonly lint: boolean;
		readonly feedback: boolean;
	};
	readonly files: {
		readonly appHtml: string | null;
		readonly appCss: string | null;
		readonly layoutCss: string | null;
		readonly rootLayout: string | null;
		readonly rootPage: string | null;
		readonly svelteConfig: string | null;
		readonly viteConfig: string | null;
	};
	readonly theme: {
		readonly defaultImported: boolean;
		readonly darkImported: boolean;
		readonly layoutCssImported: boolean;
		readonly themeAuto: boolean;
	};
	readonly lint: {
		readonly preprocessorWired: boolean;
		readonly layoutCssPluginWired: boolean;
	};
	readonly feedback: {
		readonly layoutPath: string | null;
	};
	readonly warnings: readonly string[];
}

export interface ProjectPlanStep {
	readonly kind: DryuiPlanStepKind;
	readonly status: DryuiPlanStepStatus;
	readonly title: string;
	readonly description: string;
	readonly path?: string;
	readonly command?: string;
	readonly snippet?: string;
}

export interface InstallPlan {
	readonly detection: ProjectDetection;
	readonly steps: readonly ProjectPlanStep[];
}

export interface AddPlan {
	readonly detection: ProjectDetection;
	readonly installPlan: InstallPlan;
	readonly targetType: 'component';
	readonly name: string;
	readonly importStatement: string | null;
	readonly snippet: string;
	readonly target: string | null;
	readonly steps: readonly ProjectPlanStep[];
	readonly warnings: readonly string[];
}

export interface PlanAddOptions {
	readonly cwd?: string;
	readonly target?: string;
	readonly subpath?: boolean;
	readonly withTheme?: boolean;
}

export interface DetectProjectOptions {
	readonly strictTarget?: boolean;
}

interface PackageJsonShape {
	readonly dependencies?: Record<string, string>;
	readonly devDependencies?: Record<string, string>;
}

interface PackageDetection {
	readonly packageJsonPath: string | null;
	readonly root: string | null;
	readonly dependencyNames: Set<string>;
	readonly framework: DryuiFramework;
}

interface DescendantProjectCandidate {
	readonly packageJsonPath: string;
	readonly root: string;
	readonly dependencyNames: Set<string>;
	readonly framework: DryuiFramework;
}

const DESCENDANT_PROJECT_SEARCH_MAX_DEPTH = 2;
const PROJECT_WALK_IGNORED_DIRS = new Set([
	'.git',
	'.svelte-kit',
	'build',
	'coverage',
	'dist',
	'node_modules'
]);

const DIR_OVERRIDES: Readonly<Record<string, string>> = {
	QRCode: 'qr-code'
};

function componentDir(name: string): string {
	return DIR_OVERRIDES[name] ?? name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function findUp(start: string, fileName: string): string | null {
	let current = start;
	while (true) {
		const candidate = resolve(current, fileName);
		if (existsSync(candidate)) return candidate;
		const parent = dirname(current);
		if (parent === current) return null;
		current = parent;
	}
}

function findUpAny(start: string, fileNames: readonly string[]): string | null {
	let current = start;
	while (true) {
		for (const fileName of fileNames) {
			const candidate = resolve(current, fileName);
			if (existsSync(candidate)) return candidate;
		}
		const parent = dirname(current);
		if (parent === current) return null;
		current = parent;
	}
}

function detectPackageManager(root: string | null): DryuiPackageManager {
	if (!root) return 'unknown';
	const lockfilePath = findUpAny(root, [
		'bun.lock',
		'bun.lockb',
		'pnpm-lock.yaml',
		'package-lock.json',
		'yarn.lock'
	]);
	if (!lockfilePath) return 'unknown';
	if (lockfilePath.endsWith('bun.lock') || lockfilePath.endsWith('bun.lockb')) return 'bun';
	if (lockfilePath.endsWith('pnpm-lock.yaml')) return 'pnpm';
	if (lockfilePath.endsWith('package-lock.json')) return 'npm';
	if (lockfilePath.endsWith('yarn.lock')) return 'yarn';
	return 'unknown';
}

export function detectPackageManagerFromEnv(): DryuiPackageManager {
	const ua = process.env.npm_config_user_agent ?? '';
	if (ua.startsWith('bun/')) return 'bun';
	if (ua.startsWith('pnpm/')) return 'pnpm';
	if (ua.startsWith('yarn/')) return 'yarn';
	if (ua.startsWith('npm/')) return 'npm';
	return 'npm';
}

function readPackageJson(packageJsonPath: string | null): PackageJsonShape | null {
	if (!packageJsonPath) return null;
	return JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJsonShape;
}

function getDependencyNames(pkg: PackageJsonShape | null): Set<string> {
	return new Set([
		...Object.keys(pkg?.dependencies ?? {}),
		...Object.keys(pkg?.devDependencies ?? {})
	]);
}

function detectFramework(dependencyNames: Set<string>): DryuiFramework {
	if (dependencyNames.has('@sveltejs/kit')) return 'sveltekit';
	if (dependencyNames.has('svelte')) return 'svelte';
	return 'unknown';
}

function detectPackageAt(
	start: string,
	options: { readonly strictTarget?: boolean } = {}
): PackageDetection {
	let packageJsonPath: string | null;
	if (options.strictTarget) {
		const candidate = resolve(start, 'package.json');
		packageJsonPath = existsSync(candidate) ? candidate : null;
	} else {
		packageJsonPath = findUp(start, 'package.json');
	}
	const root = packageJsonPath ? dirname(packageJsonPath) : null;
	const dependencyNames = getDependencyNames(readPackageJson(packageJsonPath));
	return {
		packageJsonPath,
		root,
		dependencyNames,
		framework: detectFramework(dependencyNames)
	};
}

function findDescendantSvelteProjects(
	start: string,
	maxDepth = DESCENDANT_PROJECT_SEARCH_MAX_DEPTH
): DescendantProjectCandidate[] {
	if (start === homedir()) return [];
	const candidates: DescendantProjectCandidate[] = [];

	function visit(current: string, depth: number): void {
		if (depth >= maxDepth) return;

		let entries: Dirent[];
		try {
			entries = readdirSync(current, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			if (PROJECT_WALK_IGNORED_DIRS.has(entry.name)) continue;

			const childRoot = resolve(current, entry.name);
			const childPackageJson = resolve(childRoot, 'package.json');
			if (existsSync(childPackageJson)) {
				const dependencyNames = getDependencyNames(readPackageJson(childPackageJson));
				const framework = detectFramework(dependencyNames);
				if (framework !== 'unknown') {
					candidates.push({
						packageJsonPath: childPackageJson,
						root: childRoot,
						dependencyNames,
						framework
					});
				}
			}

			visit(childRoot, depth + 1);
		}
	}

	visit(start, 0);
	return candidates;
}

function selectDescendantProject(
	candidates: readonly DescendantProjectCandidate[]
): DescendantProjectCandidate | null {
	const sveltekitCandidates = candidates.filter((candidate) => candidate.framework === 'sveltekit');
	if (sveltekitCandidates.length === 1) return sveltekitCandidates[0] ?? null;
	if (sveltekitCandidates.length > 1) return null;

	return candidates.length === 1 ? (candidates[0] ?? null) : null;
}

function hasImport(filePath: string | null, importPath: string): boolean {
	if (!filePath) return false;
	return readFileSync(filePath, 'utf-8').includes(importPath);
}

function hasThemeAuto(appHtmlPath: string | null): boolean {
	if (!appHtmlPath) return false;
	return readFileSync(appHtmlPath, 'utf-8').includes('theme-auto');
}

function hasAnyImport(filePaths: ReadonlyArray<string | null>, importPath: string): boolean {
	return filePaths.some((filePath) => hasImport(filePath, importPath));
}

function importsAppCss(rootLayoutPath: string | null): boolean {
	if (!rootLayoutPath) return false;
	const content = readFileSync(rootLayoutPath, 'utf-8');
	return content.includes('app.css');
}

function importsLayoutCss(rootLayoutPath: string | null): boolean {
	if (!rootLayoutPath) return false;
	const content = readFileSync(rootLayoutPath, 'utf-8');
	return content.includes('layout.css');
}

const FEEDBACK_LAYOUT_SEARCH_MAX_DEPTH = 2;
const FEEDBACK_IMPORT_PATTERN = /from\s+['"]@dryui\/feedback['"]/;

function layoutImportsFeedback(layoutPath: string): boolean {
	try {
		return FEEDBACK_IMPORT_PATTERN.test(readFileSync(layoutPath, 'utf-8'));
	} catch {
		return false;
	}
}

function findFeedbackLayout(root: string | null): string | null {
	if (!root) return null;
	const routesDir = resolve(root, 'src/routes');
	if (!existsSync(routesDir)) return null;

	function visit(current: string, depth: number): string | null {
		if (depth > FEEDBACK_LAYOUT_SEARCH_MAX_DEPTH) return null;

		const layoutPath = resolve(current, '+layout.svelte');
		if (layoutImportsFeedback(layoutPath)) return layoutPath;

		for (const entry of readdirSync(current, { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;
			if (PROJECT_WALK_IGNORED_DIRS.has(entry.name)) continue;
			const found = visit(resolve(current, entry.name), depth + 1);
			if (found) return found;
		}

		return null;
	}

	return visit(routesDir, 0);
}

function buildStatus(
	framework: DryuiFramework,
	hasPackageJson: boolean,
	stepsNeeded: number
): DryuiProjectStatus {
	if (!hasPackageJson || framework === 'unknown') return 'unsupported';
	return stepsNeeded === 0 ? 'ready' : 'partial';
}

function installCommand(
	packageManager: DryuiPackageManager,
	packageName: string,
	options: { dev?: boolean } = {}
): string {
	const dev = options.dev ?? false;
	switch (packageManager) {
		case 'bun':
			return dev ? `bun add -d ${packageName}` : `bun add ${packageName}`;
		case 'pnpm':
			return dev ? `pnpm add -D ${packageName}` : `pnpm add ${packageName}`;
		case 'yarn':
			return dev ? `yarn add -D ${packageName}` : `yarn add ${packageName}`;
		default:
			return dev ? `npm install -D ${packageName}` : `npm install ${packageName}`;
	}
}

export const SVELTE_CONFIG_NAMES = [
	'svelte.config.js',
	'svelte.config.ts',
	'svelte.config.mjs',
	'svelte.config.cjs'
] as const;

export const VITE_CONFIG_NAMES = [
	'vite.config.ts',
	'vite.config.js',
	'vite.config.mts',
	'vite.config.mjs'
] as const;

export function isSvelteConfigPath(filePath: string): boolean {
	return SVELTE_CONFIG_NAMES.some((name) => filePath.endsWith(name));
}

function findSvelteConfig(root: string | null): string | null {
	if (!root) return null;
	for (const name of SVELTE_CONFIG_NAMES) {
		const candidate = resolve(root, name);
		if (existsSync(candidate)) return candidate;
	}
	return null;
}

function findViteConfig(root: string | null): string | null {
	if (!root) return null;
	for (const name of VITE_CONFIG_NAMES) {
		const candidate = resolve(root, name);
		if (existsSync(candidate)) return candidate;
	}
	return null;
}

function isLintPreprocessorWired(svelteConfigPath: string | null): boolean {
	if (!svelteConfigPath) return false;
	const content = readFileSync(svelteConfigPath, 'utf-8');
	return content.includes('@dryui/lint') && content.includes('dryuiLint');
}

function isLayoutCssPluginWired(viteConfigPath: string | null): boolean {
	if (!viteConfigPath) return false;
	const content = readFileSync(viteConfigPath, 'utf-8');
	return content.includes('@dryui/lint') && content.includes('dryuiLayoutCss');
}

function buildLintPreprocessorSnippet(): string {
	return [
		"import { dryuiLint } from '@dryui/lint';",
		'',
		'// Merge into your existing config object:',
		'const config = {',
		'  preprocess: [',
		'    dryuiLint({',
		'      strict: true,',
		"      exclude: ['.svelte-kit/', '/dist/']",
		'    }),',
		'    // keep any existing preprocessors after this',
		'  ],',
		'  // ... rest of your config (kit, compilerOptions, etc.)',
		'};'
	].join('\n');
}

function buildLayoutCssPluginSnippet(): string {
	return [
		"import { dryuiLayoutCss } from '@dryui/lint';",
		'',
		'// Merge into your existing Vite config:',
		'export default defineConfig({',
		'  plugins: [dryuiLayoutCss(), sveltekit()]',
		'});'
	].join('\n');
}

function buildThemeImportLines(spec: Pick<ProjectPlannerSpec, 'themeImports'>): string {
	return `  import '${spec.themeImports.default}';\n  import '${spec.themeImports.dark}';`;
}

function buildThemeImportSnippet(spec: Pick<ProjectPlannerSpec, 'themeImports'>): string {
	return ['<script>', buildThemeImportLines(spec), '</script>'].join('\n');
}

function buildLayoutCssImportSnippet(): string {
	return ['<script>', "  import '../layout.css';", '</script>'].join('\n');
}

function buildRootLayoutSnippet(
	spec: Pick<ProjectPlannerSpec, 'themeImports'>,
	options: { readonly includeAppCss?: boolean } = {}
): string {
	const imports = [
		buildThemeImportLines(spec),
		...(options.includeAppCss ? ["  import '../app.css';"] : []),
		"  import '../layout.css';"
	];
	return [
		'<script>',
		...imports,
		'',
		'  let { children } = $props();',
		'</script>',
		'',
		'{@render children()}'
	].join('\n');
}

function buildThemeImportCssSnippet(spec: Pick<ProjectPlannerSpec, 'themeImports'>): string {
	return [`@import '${spec.themeImports.default}';`, `@import '${spec.themeImports.dark}';`].join(
		'\n'
	);
}

function getSuggestedTarget(root: string | null, explicitTarget?: string): string | null {
	if (explicitTarget) return resolve(root ?? process.cwd(), explicitTarget);
	if (!root) return null;
	const rootPage = resolve(root, 'src/routes/+page.svelte');
	return existsSync(rootPage) ? rootPage : null;
}

function getImportStatement(
	name: string,
	component: ProjectPlannerComponentDef,
	subpath = false
): string {
	if (subpath && component.import === '@dryui/ui') {
		return `import { ${name} } from '${component.import}/${componentDir(name)}';`;
	}
	return `import { ${name} } from '${component.import}';`;
}

function findComponent(
	spec: ProjectPlannerSpec,
	query: string
): { name: string; def: ProjectPlannerComponentDef } | null {
	const exact = spec.components[query];
	if (exact) return { name: query, def: exact };
	const lower = query.toLowerCase();
	for (const [name, def] of Object.entries(spec.components)) {
		if (name.toLowerCase() === lower) return { name, def };
	}
	return null;
}

export function detectProject(
	spec: Pick<ProjectPlannerSpec, 'themeImports'>,
	inputPath?: string,
	options: DetectProjectOptions = {}
): ProjectDetection {
	const candidate = resolve(inputPath ?? process.cwd());
	const explicitFile = existsSync(candidate) && statSync(candidate).isFile();
	const start = explicitFile ? dirname(candidate) : candidate;
	const strictTarget = options.strictTarget ?? false;

	const warnings: string[] = [];
	let detection = detectPackageAt(start, { strictTarget });

	if (!strictTarget && detection.framework === 'unknown' && !explicitFile) {
		const descendants = findDescendantSvelteProjects(start);
		const selected = selectDescendantProject(descendants);
		if (selected) {
			detection = selected;
			warnings.push(
				`Auto-selected nested ${selected.framework} project at ${selected.root} because the provided path is not a Svelte/SvelteKit project.`
			);
		} else if (descendants.length > 1) {
			const sveltekitCount = descendants.filter((c) => c.framework === 'sveltekit').length;
			warnings.push(
				sveltekitCount > 1
					? `Found ${sveltekitCount} nested SvelteKit projects below ${start}; rerun against the intended app directory.`
					: `Found ${descendants.length} nested Svelte/SvelteKit projects below ${start}; rerun against the intended app directory.`
			);
		}
	}

	const { packageJsonPath, root, dependencyNames, framework } = detection;

	const appHtmlPath = root ? resolve(root, 'src/app.html') : null;
	const appCssPath = root ? resolve(root, 'src/app.css') : null;
	const layoutCssPath = root ? resolve(root, 'src/layout.css') : null;
	const rootLayoutPath = root ? resolve(root, 'src/routes/+layout.svelte') : null;
	const rootPagePath = root ? resolve(root, 'src/routes/+page.svelte') : null;
	const appHtml = appHtmlPath && existsSync(appHtmlPath) ? appHtmlPath : null;
	const appCss = appCssPath && existsSync(appCssPath) ? appCssPath : null;
	const layoutCss = layoutCssPath && existsSync(layoutCssPath) ? layoutCssPath : null;
	const rootLayout = rootLayoutPath && existsSync(rootLayoutPath) ? rootLayoutPath : null;
	const rootPage = rootPagePath && existsSync(rootPagePath) ? rootPagePath : null;
	const themeImportFiles =
		rootLayout && importsAppCss(rootLayout) ? [rootLayout, appCss] : [rootLayout];
	const defaultImported = hasAnyImport(themeImportFiles, spec.themeImports.default);
	const darkImported = hasAnyImport(themeImportFiles, spec.themeImports.dark);
	const layoutCssImported = importsLayoutCss(rootLayout);
	const themeAuto = appHtml ? hasThemeAuto(appHtml) : false;
	const svelteConfig = findSvelteConfig(root);
	const viteConfig = findViteConfig(root);
	const lintInstalled = dependencyNames.has('@dryui/lint');
	const lintPreprocessorWired = isLintPreprocessorWired(svelteConfig);
	const layoutCssPluginWired = isLayoutCssPluginWired(viteConfig);
	const feedbackInstalled = dependencyNames.has('@dryui/feedback');
	const stepsNeeded =
		Number(!dependencyNames.has('@dryui/ui')) +
		Number(!defaultImported) +
		Number(!darkImported) +
		Number(!themeAuto) +
		Number(!layoutCss) +
		Number(rootLayout && !layoutCssImported) +
		Number(!lintInstalled) +
		Number(!lintPreprocessorWired) +
		Number(!layoutCssPluginWired);

	if (!packageJsonPath)
		warnings.push(
			strictTarget
				? 'No package.json found at the provided path.'
				: 'No package.json found above the provided path.'
		);
	if (framework === 'unknown')
		warnings.push('DryUI planning currently targets Svelte and SvelteKit projects.');

	return {
		inputPath: start,
		root,
		packageJsonPath,
		framework,
		packageManager: detectPackageManager(root),
		status: buildStatus(framework, Boolean(packageJsonPath), stepsNeeded),
		dependencies: {
			ui: dependencyNames.has('@dryui/ui'),
			primitives: dependencyNames.has('@dryui/primitives'),
			lint: lintInstalled,
			feedback: feedbackInstalled
		},
		files: {
			appHtml,
			appCss,
			layoutCss,
			rootLayout,
			rootPage,
			svelteConfig,
			viteConfig
		},
		theme: {
			defaultImported,
			darkImported,
			layoutCssImported,
			themeAuto
		},
		lint: {
			preprocessorWired: lintPreprocessorWired,
			layoutCssPluginWired
		},
		feedback: {
			layoutPath: feedbackInstalled ? findFeedbackLayout(root) : null
		},
		warnings
	};
}

// ── Scaffold templates ────────────────────────────────────

const SCAFFOLD_PACKAGE_JSON = `{
  "name": "my-dryui-app",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview"
  }
}
`;

const SCAFFOLD_SVELTE_CONFIG = `import adapter from '@sveltejs/adapter-auto';
import { dryuiLint } from '@dryui/lint';

export default {
  preprocess: [
    dryuiLint({
      strict: true,
      forbidRawGrid: true,
      componentsOnly: true,
      exclude: ['.svelte-kit/', '/dist/']
    })
  ],
  kit: {
    adapter: adapter(),
  },
};
`;

const SCAFFOLD_VITE_CONFIG = `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { dryuiLayoutCss } from '@dryui/lint';

export default defineConfig({
  ssr: {
    // SvelteKit needs Svelte component packages bundled into the SSR
    // output rather than imported at runtime.
    noExternal: ['@dryui/ui', '@dryui/primitives']
  },
  plugins: [dryuiLayoutCss(), sveltekit()],
});
`;

const SCAFFOLD_TSCONFIG = `{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "target": "ES2020"
  }
}
`;

const SCAFFOLD_APP_HTML = `<!doctype html>
<html lang="en" class="theme-auto">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`;

const SCAFFOLD_APP_CSS = `/* Global reset with DryUI tokens */
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

const SCAFFOLD_LAYOUT_CSS = `/* Layout-only CSS hooks for app-level spacing and alignment. */
`;

function buildScaffoldRootLayout(spec: Pick<ProjectPlannerSpec, 'themeImports'>): string {
	return `<script>
  import '${spec.themeImports.default}';
  import '${spec.themeImports.dark}';
  import '../app.css';
  import '../layout.css';

  let { children } = $props();
</script>

{@render children()}
`;
}

const SCAFFOLD_STARTER_PAGE = `<script lang="ts">
\timport { Card, Container, Heading, Text } from '@dryui/ui';
</script>

<svelte:head>
\t<title>My App</title>
</svelte:head>

<Container size="md">
\t<Card.Root>
\t\t<Card.Header>
\t\t\t<Heading level={1} variant="display">Hello, World</Heading>
\t\t</Card.Header>
\t\t<Card.Content>
\t\t\t<Text size="lg" color="muted">Your DryUI project is ready. Start building.</Text>
\t\t</Card.Content>
\t</Card.Root>
</Container>
`;

const SCAFFOLD_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="18" fill="#16171f"/>
  <rect x="10" y="10" width="44" height="44" rx="14" fill="#eef2ff"/>
  <path d="M20 20h10v24H20z" fill="#1f2937"/>
  <path d="M34 20h10c4.418 0 8 3.582 8 8v0c0 4.418-3.582 8-8 8h-4v8h-6V20z" fill="#4f46e5"/>
  <circle cx="44" cy="28" r="4" fill="#f59e0b"/>
</svg>
`;

interface ScaffoldFile {
	readonly relativePath: string;
	readonly content: string;
	readonly description: string;
}

function getScaffoldFiles(spec: Pick<ProjectPlannerSpec, 'themeImports'>): ScaffoldFile[] {
	return [
		{
			relativePath: 'package.json',
			content: SCAFFOLD_PACKAGE_JSON,
			description: 'Project manifest with SvelteKit scripts'
		},
		{
			relativePath: 'svelte.config.js',
			content: SCAFFOLD_SVELTE_CONFIG,
			description: 'SvelteKit configuration with adapter-auto'
		},
		{
			relativePath: 'vite.config.ts',
			content: SCAFFOLD_VITE_CONFIG,
			description: 'Vite configuration with SvelteKit plugin'
		},
		{
			relativePath: 'tsconfig.json',
			content: SCAFFOLD_TSCONFIG,
			description: 'TypeScript configuration'
		},
		{
			relativePath: 'src/app.html',
			content: SCAFFOLD_APP_HTML,
			description: 'HTML shell with theme-auto class'
		},
		{
			relativePath: 'src/app.css',
			content: SCAFFOLD_APP_CSS,
			description: 'Foundation CSS reset with DryUI tokens'
		},
		{
			relativePath: 'src/layout.css',
			content: SCAFFOLD_LAYOUT_CSS,
			description: 'Layout-only CSS hooks'
		},
		{
			relativePath: 'src/routes/+layout.svelte',
			content: buildScaffoldRootLayout(spec),
			description: 'Root layout with theme imports'
		},
		{
			relativePath: 'src/routes/+page.svelte',
			content: SCAFFOLD_STARTER_PAGE,
			description: 'Starter page with DryUI components'
		},
		{
			relativePath: 'static/favicon.svg',
			content: SCAFFOLD_FAVICON,
			description: 'DryUI project favicon'
		}
	];
}

const SCAFFOLD_DEV_DEPS =
	'svelte @sveltejs/kit @sveltejs/vite-plugin-svelte @sveltejs/adapter-auto vite';

function buildScaffoldSteps(
	spec: ProjectPlannerSpec,
	root: string,
	packageManager: DryuiPackageManager,
	hasPackageJson: boolean
): ProjectPlanStep[] {
	const steps: ProjectPlanStep[] = [];
	const files = getScaffoldFiles(spec);

	for (const file of files) {
		if (file.relativePath === 'package.json' && hasPackageJson) continue;
		steps.push({
			kind: 'create-file',
			status: 'pending',
			title: `Create ${file.relativePath}`,
			description: file.description,
			path: resolve(root, file.relativePath),
			snippet: file.content
		});
	}

	steps.push({
		kind: 'run-command',
		status: 'pending',
		title: 'Install SvelteKit dependencies',
		description: 'Install Svelte, SvelteKit, Vite, and adapter-auto as dev dependencies.',
		command: installCommand(packageManager, SCAFFOLD_DEV_DEPS, { dev: true })
	});

	steps.push({
		kind: 'install-package',
		status: 'pending',
		title: 'Install @dryui/ui',
		description: 'Add the styled DryUI package to the project.',
		command: installCommand(packageManager, '@dryui/ui')
	});

	steps.push({
		kind: 'install-package',
		status: 'pending',
		title: 'Install @dryui/lint',
		description:
			'Add the DryUI lint package as a dev dependency. The scaffolded svelte.config.js and vite.config.ts already wire dryuiLint and dryuiLayoutCss; installing this package makes those imports resolve.',
		command: installCommand(packageManager, '@dryui/lint', { dev: true })
	});

	return steps;
}

export interface PlanInstallOptions {
	readonly packageManager?: DryuiPackageManager;
	readonly strictTarget?: boolean;
}

export function planInstall(
	spec: ProjectPlannerSpec,
	inputPath?: string,
	options?: PlanInstallOptions
): InstallPlan {
	const detection = detectProject(spec, inputPath, {
		strictTarget: options?.strictTarget ?? false
	});
	const steps: ProjectPlanStep[] = [];

	if (detection.status === 'unsupported') {
		const root = detection.root ?? detection.inputPath;
		const pm =
			options?.packageManager ??
			(detection.packageManager !== 'unknown'
				? detection.packageManager
				: detectPackageManagerFromEnv());
		const scaffoldSteps = buildScaffoldSteps(spec, root, pm, Boolean(detection.packageJsonPath));
		return { detection, steps: scaffoldSteps };
	}

	if (!detection.dependencies.ui) {
		steps.push({
			kind: 'install-package',
			status: 'pending',
			title: 'Install @dryui/ui',
			description: 'Add the styled DryUI package to the current project.',
			command: installCommand(detection.packageManager, '@dryui/ui')
		});
	}

	if (!detection.dependencies.lint) {
		steps.push({
			kind: 'install-package',
			status: 'pending',
			title: 'Install @dryui/lint',
			description:
				'Add the DryUI lint package as a dev dependency. It enforces grid-only layout, bans flexbox/inline-style/width-properties during Svelte preprocessing, and checks src/layout.css during Vite dev/HMR and build.',
			command: installCommand(detection.packageManager, '@dryui/lint', { dev: true })
		});
	}

	if (!detection.theme.defaultImported || !detection.theme.darkImported) {
		if (
			detection.files.appCss &&
			detection.files.rootLayout &&
			importsAppCss(detection.files.rootLayout)
		) {
			steps.push({
				kind: 'edit-file',
				status: 'pending',
				title: 'Add theme imports to app.css',
				description:
					'Prepend the two @import lines from the snippet to the TOP of the existing src/app.css file, before any other CSS rules. Do not create a second file.',
				path: detection.files.appCss,
				snippet: buildThemeImportCssSnippet(spec)
			});
		} else if (!detection.files.rootLayout) {
			const path = detection.root ? resolve(detection.root, 'src/routes/+layout.svelte') : null;
			steps.push({
				kind: 'create-file',
				status: 'pending',
				title: 'Create root layout with theme imports',
				description:
					'Create the file at the path below with the snippet as its full content. The file must include {@render children()} or pages will not render.',
				...(path ? { path } : {}),
				snippet: buildRootLayoutSnippet(spec, { includeAppCss: Boolean(detection.files.appCss) })
			});
		} else {
			steps.push({
				kind: 'edit-file',
				status: 'pending',
				title: 'Add theme imports to the root layout',
				description:
					'Add the two import lines from the snippet into the EXISTING <script> block in this file. Do not create a second <script> block. If no <script> block exists, add one at the top of the file.',
				path: detection.files.rootLayout,
				snippet: buildThemeImportSnippet(spec)
			});
		}
	}

	if (!detection.files.layoutCss) {
		const path = detection.root ? resolve(detection.root, 'src/layout.css') : null;
		steps.push({
			kind: 'create-file',
			status: 'pending',
			title: 'Create layout stylesheet',
			description:
				'Create src/layout.css for layout-only selectors such as [data-layout] and [data-layout-area]. Missing layout.css is warning-only, but new DryUI projects should include it.',
			...(path ? { path } : {}),
			snippet: SCAFFOLD_LAYOUT_CSS
		});
	}

	if (detection.files.rootLayout && !detection.theme.layoutCssImported) {
		steps.push({
			kind: 'edit-file',
			status: 'pending',
			title: 'Import layout.css in the root layout',
			description:
				'Import ../layout.css in src/routes/+layout.svelte after DryUI theme CSS and ../app.css so layout-only rules load last.',
			path: detection.files.rootLayout,
			snippet: buildLayoutCssImportSnippet()
		});
	}

	if (!detection.files.appHtml) {
		steps.push({
			kind: 'blocked',
			status: 'blocked',
			title: 'app.html not found',
			description: 'DryUI expects src/app.html so the document can default to theme-auto mode.'
		});
	} else if (!detection.theme.themeAuto) {
		steps.push({
			kind: 'edit-file',
			status: 'pending',
			title: 'Set html theme mode to auto',
			description:
				'In src/app.html, find the opening <html> tag (e.g. <html lang="en">) and add class="theme-auto" to it, preserving any existing attributes. Result should be like <html lang="en" class="theme-auto">. Do NOT add a second <html> element.',
			path: detection.files.appHtml,
			snippet: 'class="theme-auto"'
		});
	}

	if (!detection.lint.preprocessorWired) {
		if (detection.files.svelteConfig) {
			steps.push({
				kind: 'edit-file',
				status: 'pending',
				title: 'Wire dryuiLint into svelte.config',
				description:
					'Import dryuiLint from @dryui/lint and add it as the FIRST entry in the preprocess array. If the config has no preprocess field, add one. Merge into the existing config object; do NOT create a second config. Without this step, the grid-only layout rules, flex/inline-style/width bans, and other CSS discipline enforced by @dryui/lint will not run.',
				path: detection.files.svelteConfig,
				snippet: buildLintPreprocessorSnippet()
			});
		} else {
			steps.push({
				kind: 'blocked',
				status: 'blocked',
				title: 'svelte.config not found',
				description:
					'DryUI expects a svelte.config.{js,ts,mjs,cjs} at the project root so the @dryui/lint preprocessor can run. Create one and then wire dryuiLint into its preprocess array.'
			});
		}
	}

	if (!detection.lint.layoutCssPluginWired) {
		if (detection.files.viteConfig) {
			steps.push({
				kind: 'edit-file',
				status: 'pending',
				title: 'Wire dryuiLayoutCss into vite.config',
				description:
					'Import dryuiLayoutCss from @dryui/lint and add dryuiLayoutCss() to the Vite plugins array. It runs during vite dev/HMR and vite build, warning only if src/layout.css is missing and throwing on layout.css violations.',
				path: detection.files.viteConfig,
				snippet: buildLayoutCssPluginSnippet()
			});
		} else {
			steps.push({
				kind: 'blocked',
				status: 'blocked',
				title: 'vite.config not found',
				description:
					'DryUI expects a vite.config.{js,ts,mjs,mts} at the project root so dryuiLayoutCss() can enforce src/layout.css during dev and build.'
			});
		}
	}

	if (steps.length === 0) {
		steps.push({
			kind: 'note',
			status: 'done',
			title: 'DryUI install plan is complete',
			description:
				'The project already has @dryui/ui, @dryui/lint, theme imports, theme-auto, src/layout.css, the lint preprocessor, and the layout CSS Vite plugin wired.'
		});
	}

	return { detection, steps };
}

export function planAdd(
	spec: ProjectPlannerSpec,
	query: string,
	options: PlanAddOptions = {}
): AddPlan {
	const installPlan = planInstall(spec, options.cwd);
	const component = findComponent(spec, query);
	if (component) {
		const target = getSuggestedTarget(installPlan.detection.root, options.target);
		const steps: ProjectPlanStep[] = [];
		const warnings = [...installPlan.detection.warnings];
		if (installPlan.steps.some((step) => step.status === 'pending' || step.status === 'blocked')) {
			steps.push({
				kind: 'note',
				status: 'info',
				title: 'Complete install plan first',
				description: 'Apply the install plan before inserting DryUI components into project files.'
			});
		}
		steps.push(
			target
				? {
						kind: 'edit-file',
						status: 'pending',
						title: 'Insert component into the target file',
						description: 'Add the import and snippet below to the chosen Svelte file.',
						path: target,
						snippet: `${getImportStatement(component.name, component.def, options.subpath)}\n\n${component.def.example}`
					}
				: {
						kind: 'note',
						status: 'info',
						title: 'Choose a target Svelte file',
						description:
							'No root page was found. Pick a target file and reuse the import and snippet in this plan.'
					}
		);

		return {
			detection: installPlan.detection,
			installPlan,
			targetType: 'component',
			name: component.name,
			importStatement: getImportStatement(component.name, component.def, options.subpath),
			snippet: component.def.example,
			target,
			steps,
			warnings
		};
	}

	throw new Error(`Unknown component: "${query}"`);
}
