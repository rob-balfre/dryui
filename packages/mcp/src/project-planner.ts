import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type DryuiFramework = 'sveltekit' | 'svelte' | 'unknown';
export type DryuiPackageManager = 'bun' | 'pnpm' | 'npm' | 'yarn' | 'unknown';
export type DryuiProjectStatus = 'ready' | 'partial' | 'unsupported';
export type DryuiPlanStepKind =
	| 'install-package'
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
	};
	readonly files: {
		readonly appHtml: string | null;
		readonly appCss: string | null;
		readonly rootLayout: string | null;
		readonly rootPage: string | null;
	};
	readonly theme: {
		readonly defaultImported: boolean;
		readonly darkImported: boolean;
		readonly themeAuto: boolean;
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

interface PackageJsonShape {
	readonly dependencies?: Record<string, string>;
	readonly devDependencies?: Record<string, string>;
}

const DIR_OVERRIDES: Readonly<Record<string, string>> = {
	QRCode: 'qr-code'
};

function componentDir(name: string): string {
	return DIR_OVERRIDES[name] ?? name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function resolveStart(inputPath?: string): string {
	const candidate = resolve(inputPath ?? process.cwd());
	return existsSync(candidate) && statSync(candidate).isFile() ? dirname(candidate) : candidate;
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

function buildStatus(
	framework: DryuiFramework,
	hasPackageJson: boolean,
	stepsNeeded: number
): DryuiProjectStatus {
	if (!hasPackageJson || framework === 'unknown') return 'unsupported';
	return stepsNeeded === 0 ? 'ready' : 'partial';
}

function installCommand(packageManager: DryuiPackageManager): string {
	switch (packageManager) {
		case 'bun':
			return 'bun add @dryui/ui';
		case 'pnpm':
			return 'pnpm add @dryui/ui';
		case 'yarn':
			return 'yarn add @dryui/ui';
		default:
			return 'npm install @dryui/ui';
	}
}

function buildThemeImportLines(spec: Pick<ProjectPlannerSpec, 'themeImports'>): string {
	return `  import '${spec.themeImports.default}';\n  import '${spec.themeImports.dark}';`;
}

function buildThemeImportSnippet(spec: Pick<ProjectPlannerSpec, 'themeImports'>): string {
	return ['<script>', buildThemeImportLines(spec), '</script>'].join('\n');
}

function buildRootLayoutSnippet(spec: Pick<ProjectPlannerSpec, 'themeImports'>): string {
	return [
		'<script>',
		buildThemeImportLines(spec),
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
	inputPath?: string
): ProjectDetection {
	const start = resolveStart(inputPath);
	const packageJsonPath = findUp(start, 'package.json');
	const root = packageJsonPath ? dirname(packageJsonPath) : null;
	const dependencyNames = getDependencyNames(readPackageJson(packageJsonPath));
	const framework = detectFramework(dependencyNames);
	const appHtmlPath = root ? resolve(root, 'src/app.html') : null;
	const appCssPath = root ? resolve(root, 'src/app.css') : null;
	const rootLayoutPath = root ? resolve(root, 'src/routes/+layout.svelte') : null;
	const rootPagePath = root ? resolve(root, 'src/routes/+page.svelte') : null;
	const appHtml = appHtmlPath && existsSync(appHtmlPath) ? appHtmlPath : null;
	const appCss = appCssPath && existsSync(appCssPath) ? appCssPath : null;
	const rootLayout = rootLayoutPath && existsSync(rootLayoutPath) ? rootLayoutPath : null;
	const rootPage = rootPagePath && existsSync(rootPagePath) ? rootPagePath : null;
	const themeImportFiles =
		rootLayout && importsAppCss(rootLayout) ? [rootLayout, appCss] : [rootLayout];
	const defaultImported = hasAnyImport(themeImportFiles, spec.themeImports.default);
	const darkImported = hasAnyImport(themeImportFiles, spec.themeImports.dark);
	const stepsNeeded =
		Number(!dependencyNames.has('@dryui/ui')) +
		Number(!defaultImported) +
		Number(!darkImported) +
		Number(!(appHtml && hasThemeAuto(appHtml)));
	const warnings: string[] = [];

	if (!packageJsonPath) warnings.push('No package.json found above the provided path.');
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
			primitives: dependencyNames.has('@dryui/primitives')
		},
		files: {
			appHtml,
			appCss,
			rootLayout,
			rootPage
		},
		theme: {
			defaultImported,
			darkImported,
			themeAuto: hasThemeAuto(appHtml)
		},
		warnings
	};
}

export function planInstall(spec: ProjectPlannerSpec, inputPath?: string): InstallPlan {
	const detection = detectProject(spec, inputPath);
	const steps: ProjectPlanStep[] = [];

	if (detection.status === 'unsupported') {
		steps.push({
			kind: 'blocked',
			status: 'blocked',
			title: 'Project detection incomplete',
			description:
				detection.warnings.join(' ') ||
				'DryUI install planning requires a Svelte or SvelteKit project with a package.json.'
		});
		return { detection, steps };
	}

	if (!detection.dependencies.ui) {
		steps.push({
			kind: 'install-package',
			status: 'pending',
			title: 'Install @dryui/ui',
			description: 'Add the styled DryUI package to the current project.',
			command: installCommand(detection.packageManager)
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
				snippet: buildRootLayoutSnippet(spec)
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
			snippet: '<html lang="en" class="theme-auto">'
		});
	}

	if (steps.length === 0) {
		steps.push({
			kind: 'note',
			status: 'done',
			title: 'DryUI install plan is complete',
			description: 'The project already has @dryui/ui, theme imports, and theme-auto configured.'
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
