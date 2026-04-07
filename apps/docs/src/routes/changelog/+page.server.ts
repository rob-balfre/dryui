import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PageServerLoad } from './$types';

function isRepoRoot(directory: string): boolean {
	return (
		existsSync(join(directory, 'package.json')) &&
		existsSync(join(directory, 'packages')) &&
		existsSync(join(directory, '.changeset'))
	);
}

function findRepoRoot(): string {
	const candidates = [process.cwd(), dirname(fileURLToPath(import.meta.url))];

	for (const candidate of candidates) {
		let current = resolve(candidate);

		while (true) {
			if (isRepoRoot(current)) {
				return current;
			}

			const parent = dirname(current);

			if (parent === current) {
				break;
			}

			current = parent;
		}
	}

	throw new Error('Could not locate the dryui repo root for the changelog page.');
}

const REPO_ROOT = findRepoRoot();

const CORE_PACKAGE_DESCRIPTIONS: Record<string, string> = {
	'@dryui/primitives': 'Headless, unstyled components built on native browser APIs.',
	'@dryui/ui': 'Styled production-ready components with theme CSS and scoped styles.',
	'@dryui/mcp': 'MCP server for lookup, planning, validation, diagnosis, and workspace audit.',
	'@dryui/cli': 'CLI surface for planning, lookup, validation, and workspace audit workflows.',
	'@dryui/lint': 'Svelte preprocessor enforcing grid-only layout and DryUI CSS rules.'
};

const CATEGORY_LABELS: Record<string, string> = {
	action: 'Action',
	display: 'Display',
	feedback: 'Feedback',
	form: 'Form',
	input: 'Input',
	interaction: 'Interaction',
	layout: 'Layout',
	navigation: 'Navigation',
	overlay: 'Overlay',
	utility: 'Utility',
	visual: 'Visual'
};

const CATEGORY_ORDER = [
	'display',
	'input',
	'overlay',
	'form',
	'visual',
	'navigation',
	'action',
	'layout',
	'feedback',
	'utility',
	'interaction'
] as const;

interface WorkspacePackage {
	name: string;
	version: string;
}

interface ExportMap {
	[key: string]: unknown;
}

interface PackageJson {
	devDependencies?: Record<string, string>;
	exports?: ExportMap;
}

interface SpecComponent {
	category: string;
}

interface McpSpec {
	components: Record<string, SpecComponent>;
}

interface PendingChangeset {
	name: string;
	body: string;
}

function readText(relativePath: string): string {
	return readFileSync(join(REPO_ROOT, relativePath), 'utf8');
}

function readJson<T>(relativePath: string): T {
	return JSON.parse(readText(relativePath)) as T;
}

function readWorkspacePackages(): WorkspacePackage[] {
	const packagesDir = join(REPO_ROOT, 'packages');

	return readdirSync(packagesDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => readJson<WorkspacePackage>(`packages/${entry.name}/package.json`))
		.sort((left, right) => left.name.localeCompare(right.name));
}

function countExportedEntries(exports: ExportMap | undefined): number {
	if (!exports) {
		return 0;
	}

	return Object.keys(exports).filter(
		(key) => key !== '.' && !key.includes('*') && !key.endsWith('.css') && !key.startsWith('./internal/')
	).length;
}

function readPendingChangesets(): PendingChangeset[] {
	const changesetsDir = join(REPO_ROOT, '.changeset');

	return readdirSync(changesetsDir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
		.sort((left, right) => left.name.localeCompare(right.name))
		.map((entry) => {
			const source = readText(`.changeset/${entry.name}`);
			const [, , body = ''] = source.split('---');

			return {
				name: entry.name.replace(/\.md$/, ''),
				body: body.trim()
			};
		})
		.filter((changeset) => changeset.body.length > 0);
}

function formatPackageLine(pkg: WorkspacePackage, description?: string): string {
	return description
		? `- \`${pkg.name}\` \`${pkg.version}\` - ${description}`
		: `- \`${pkg.name}\` \`${pkg.version}\``;
}

function buildContent(): string {
	const rootPackage = readJson<PackageJson>('package.json');
	const uiPackage = readJson<PackageJson>('packages/ui/package.json');
	const primitivesPackage = readJson<PackageJson>('packages/primitives/package.json');
	const spec = readJson<McpSpec>('packages/mcp/src/spec.json');
	const packages = readWorkspacePackages();
	const pendingChangesets = readPendingChangesets();
	const corePackages = packages.filter((pkg) => pkg.name in CORE_PACKAGE_DESCRIPTIONS);
	const companionPackages = packages.filter((pkg) => !(pkg.name in CORE_PACKAGE_DESCRIPTIONS));
	const categoryCounts = new Map<string, number>();

	for (const component of Object.values(spec.components)) {
		categoryCounts.set(component.category, (categoryCounts.get(component.category) ?? 0) + 1);
	}

	const categoryLines = CATEGORY_ORDER.filter((category) => categoryCounts.has(category)).map(
		(category) => `- ${CATEGORY_LABELS[category]}: \`${categoryCounts.get(category)}\``
	);

	const pendingLines =
		pendingChangesets.length > 0
			? pendingChangesets.flatMap((changeset) => [
					`### \`${changeset.name}\``,
					'',
					changeset.body,
					''
				])
			: ['- No unreleased changesets are currently checked into `.changeset/`.'];

	return [
		'# Changelog',
		'',
		'This page is generated from the current repo state so versions, component counts, and pending release notes stay aligned with the codebase.',
		'',
		'## Current packages',
		'',
		'### Core',
		'',
		...corePackages.map((pkg) => formatPackageLine(pkg, CORE_PACKAGE_DESCRIPTIONS[pkg.name])),
		'',
		'### Companion workspaces',
		'',
		...companionPackages.map((pkg) => formatPackageLine(pkg)),
		'',
		'## Current UI surface',
		'',
		`- \`@dryui/ui\` currently exposes \`${countExportedEntries(uiPackage.exports)}\` documented component entries.`,
		`- \`@dryui/primitives\` currently exposes \`${countExportedEntries(primitivesPackage.exports)}\` primitive entries.`,
		`- The shared MCP spec currently tracks \`${Object.keys(spec.components).length}\` UI components for agent lookup.`,
		'',
		'### UI categories',
		'',
		...categoryLines,
		'',
		'## Current defaults',
		'',
		`- Svelte \`${rootPackage.devDependencies?.svelte ?? 'unknown'}\` in the workspace.`,
		'- `theme-auto` remains the default app/docs theme mode.',
		'- `@dryui/lint` enforces grid-only layout rules and bans inline styles/flexbox in scoped component CSS.',
		'- MCP and CLI surfaces stay aligned around planning, lookup, validation, diagnosis, and workspace audit workflows.',
		'',
		'## Pending changesets',
		'',
		...pendingLines
	].join('\n');
}

export const load: PageServerLoad = () => ({
	content: buildContent()
});
