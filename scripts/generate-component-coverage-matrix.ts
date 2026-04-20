import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { componentMeta, docsNavComponentNames } from '../packages/mcp/src/component-catalog.js';

type RiskTier = 'tier0' | 'tier1' | 'tier2';

interface SpecComponentEntry {
	import?: string;
	category?: string;
	description?: string;
	compound?: boolean;
	tags?: string[];
}

interface ComponentMatrixEntry {
	name: string;
	slug: string;
	importPackage: string;
	category: string;
	description: string;
	compound: boolean;
	tier: RiskTier;
	docsRoute: string | null;
	browserSpecs: string[];
	browserSupport: string[];
	unitTests: string[];
	docsDemos: string[];
	docsVisualTests: string[];
	signals: {
		hasBrowserSpec: boolean;
		hasUnitTest: boolean;
		hasDocsDemo: boolean;
		hasDocsRoute: boolean;
		hasDocsVisualTest: boolean;
	};
}

const repoRoot = path.resolve(import.meta.dir, '..');
const specPath = path.join(repoRoot, 'packages/mcp/src/spec.json');
const outputJsonPath = path.join(repoRoot, 'reports/component-coverage-matrix.json');
const outputMarkdownPath = path.join(repoRoot, 'reports/component-coverage-matrix.md');

const TIER_0 = new Set([
	'Button',
	'Input',
	'Textarea',
	'Checkbox',
	'RadioGroup',
	'Toggle',
	'Field',
	'Select',
	'Combobox',
	'MultiSelectCombobox',
	'FileSelect',
	'Dialog',
	'Drawer',
	'Popover',
	'Tooltip',
	'HoverCard',
	'DropdownMenu',
	'ContextMenu',
	'Menubar',
	'MegaMenu',
	'DatePicker',
	'DateRangePicker',
	'Calendar',
	'RangeCalendar'
]);

const TIER_1 = new Set([
	'NotificationCenter',
	'Feedback',
	'ThemeWizard',
	'Tree',
	'Carousel',
	'Transfer',
	'RichTextEditor',
	'Chart',
	'StudioShell',
	'StudioAI'
]);

function toKebab(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function relativePath(filePath: string): string {
	return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

async function listFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await listFiles(fullPath)));
			continue;
		}
		files.push(fullPath);
	}
	return files;
}

function tierFor(name: string): RiskTier {
	if (TIER_0.has(name)) return 'tier0';
	if (TIER_1.has(name)) return 'tier1';
	return 'tier2';
}

function buildMatchers(name: string, slug: string): RegExp[] {
	const escapedName = escapeRegex(name);
	const escapedSlug = escapeRegex(slug);
	return [
		new RegExp(`packages/(?:ui|primitives)/src/${escapedSlug}/`),
		new RegExp(`/components/${escapedSlug}\\b`),
		new RegExp(`\\bname\\s*:\\s*['"]${escapedName}['"]`),
		new RegExp(`\\b${escapedName}Demo\\b`),
		new RegExp(`\\b${escapedName}Harness\\b`),
		new RegExp(`<${escapedName}(?:[\\s>.])`),
		new RegExp(`\\b${escapedName}\\.`),
		new RegExp(`\\b${escapedName}Props\\b`),
		new RegExp(`\\bimport\\s*\\{[\\s\\S]*?\\b${escapedName}\\b[\\s\\S]*?\\}\\s*from`, 'm'),
		new RegExp(`\\bfrom\\s+['"][^'"]*${escapedSlug}[^'"]*['"]`)
	];
}

function matchesComponent(filePath: string, content: string, name: string, slug: string): boolean {
	const rel = relativePath(filePath);
	const demoStem = `${name}Demo.svelte`;
	const routeSlug = `/components/${slug}`;

	if (
		rel.endsWith(`/${slug}.browser.test.ts`) ||
		rel.includes(`/${slug}-`) ||
		rel.endsWith(`/${slug}.test.ts`) ||
		rel.endsWith(`/${demoStem}`) ||
		content.includes(routeSlug)
	) {
		return true;
	}

	return buildMatchers(name, slug).some((pattern) => pattern.test(content));
}

function summarizeTier(entries: ComponentMatrixEntry[], tier: RiskTier) {
	const components = entries.filter((entry) => entry.tier === tier);
	return {
		tier,
		total: components.length,
		withBrowserSpec: components.filter((entry) => entry.signals.hasBrowserSpec).length,
		withUnitTest: components.filter((entry) => entry.signals.hasUnitTest).length,
		withDocsDemo: components.filter((entry) => entry.signals.hasDocsDemo).length,
		withDocsRoute: components.filter((entry) => entry.signals.hasDocsRoute).length,
		withDocsVisualTest: components.filter((entry) => entry.signals.hasDocsVisualTest).length
	};
}

function formatCount(value: string[]): string {
	return value.length === 0 ? '0' : String(value.length);
}

function formatPresence(value: boolean): string {
	return value ? 'yes' : 'no';
}

function uniqueSorted(values: string[]): string[] {
	return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function renderMarkdown(entries: ComponentMatrixEntry[]): string {
	const tierSummaries = ['tier0', 'tier1', 'tier2'].map((tier) =>
		summarizeTier(entries, tier as RiskTier)
	);
	const tier0WithoutBrowserSpecs = entries
		.filter((entry) => entry.tier === 'tier0' && !entry.signals.hasBrowserSpec)
		.map((entry) => entry.name);
	const componentsWithoutTests = entries
		.filter((entry) => !entry.signals.hasBrowserSpec && !entry.signals.hasUnitTest)
		.map((entry) => entry.name);
	const componentsWithoutDocsSurface = entries
		.filter((entry) => !entry.signals.hasDocsDemo && !entry.signals.hasDocsRoute)
		.map((entry) => entry.name);

	const lines = [
		'# Component Coverage Matrix',
		'',
		`Generated: ${new Date().toISOString()}`,
		'',
		'Scope: public `@dryui/ui` components from `packages/mcp/src/spec.json`.',
		'',
		'## Summary By Tier',
		'',
		'| Tier | Components | Browser Specs | Unit Tests | Docs Demos | Docs Routes | Docs Visual Tests |',
		'| --- | ---: | ---: | ---: | ---: | ---: | ---: |'
	];

	for (const summary of tierSummaries) {
		lines.push(
			`| ${summary.tier} | ${summary.total} | ${summary.withBrowserSpec} | ${summary.withUnitTest} | ${summary.withDocsDemo} | ${summary.withDocsRoute} | ${summary.withDocsVisualTest} |`
		);
	}

	lines.push('', '## High-Risk Gaps', '');
	lines.push(
		`- Tier 0 components without a dedicated browser spec: ${tier0WithoutBrowserSpecs.length === 0 ? 'none' : tier0WithoutBrowserSpecs.join(', ')}`
	);
	lines.push(
		`- Components without browser or unit tests: ${componentsWithoutTests.length === 0 ? 'none' : componentsWithoutTests.join(', ')}`
	);
	lines.push(
		`- Components without a docs route or docs demo: ${componentsWithoutDocsSurface.length === 0 ? 'none' : componentsWithoutDocsSurface.join(', ')}`
	);

	lines.push('', '## Full Matrix', '');
	lines.push(
		'| Component | Tier | Category | Browser Specs | Unit Tests | Docs Demos | Docs Route | Docs Visual |'
	);
	lines.push('| --- | --- | --- | ---: | ---: | ---: | --- | --- |');

	for (const entry of entries) {
		lines.push(
			`| ${entry.name} | ${entry.tier} | ${entry.category} | ${formatCount(entry.browserSpecs)} | ${formatCount(entry.unitTests)} | ${formatCount(entry.docsDemos)} | ${entry.docsRoute ?? 'none'} | ${formatPresence(entry.signals.hasDocsVisualTest)} |`
		);
	}

	lines.push('', '## Detailed File Matches', '');

	for (const entry of entries) {
		lines.push(`### ${entry.name}`, '');
		lines.push(`- Tier: ${entry.tier}`);
		lines.push(`- Category: ${entry.category}`);
		lines.push(
			`- Browser specs: ${entry.browserSpecs.length === 0 ? 'none' : entry.browserSpecs.join(', ')}`
		);
		lines.push(
			`- Browser support files: ${entry.browserSupport.length === 0 ? 'none' : entry.browserSupport.join(', ')}`
		);
		lines.push(
			`- Unit tests: ${entry.unitTests.length === 0 ? 'none' : entry.unitTests.join(', ')}`
		);
		lines.push(
			`- Docs demos: ${entry.docsDemos.length === 0 ? 'none' : entry.docsDemos.join(', ')}`
		);
		lines.push(`- Docs route: ${entry.docsRoute ?? 'none'}`);
		lines.push(
			`- Docs visual tests: ${entry.docsVisualTests.length === 0 ? 'none' : entry.docsVisualTests.join(', ')}`
		);
		lines.push('');
	}

	return lines.join('\n');
}

const docsNavSet = new Set(docsNavComponentNames);
const spec = JSON.parse(await Bun.file(specPath).text()) as {
	components: Record<string, SpecComponentEntry>;
};

const browserSpecFiles = (await listFiles(path.join(repoRoot, 'tests/browser')))
	.filter((file) => file.endsWith('.browser.test.ts'))
	.sort();
const browserSupportFiles = (await listFiles(path.join(repoRoot, 'tests/browser')))
	.filter((file) => !file.endsWith('.browser.test.ts'))
	.sort();
const unitTestFiles = (await listFiles(repoRoot))
	.filter((file) => file.endsWith('.test.ts'))
	.filter((file) => !file.includes('/tests/browser/') && !file.includes('/tests/playwright/'))
	.sort();
const docsDemoFiles = (await listFiles(path.join(repoRoot, 'apps/docs/src/lib/demos')))
	.filter((file) => file.endsWith('.svelte') || file.endsWith('.ts'))
	.sort();
const docsVisualFiles = (await listFiles(path.join(repoRoot, 'tests/playwright')))
	.filter((file) => file.endsWith('.ts'))
	.sort();

const browserSpecContents = await Promise.all(
	browserSpecFiles.map(async (file) => [file, await Bun.file(file).text()] as const)
);
const browserSupportContents = await Promise.all(
	browserSupportFiles.map(async (file) => [file, await Bun.file(file).text()] as const)
);
const unitTestContents = await Promise.all(
	unitTestFiles.map(async (file) => [file, await Bun.file(file).text()] as const)
);
const docsDemoContents = await Promise.all(
	docsDemoFiles.map(async (file) => [file, await Bun.file(file).text()] as const)
);
const docsVisualContents = await Promise.all(
	docsVisualFiles.map(async (file) => [file, await Bun.file(file).text()] as const)
);

const entries = Object.entries(spec.components)
	.filter(([, definition]) => definition.import === '@dryui/ui')
	.map(([name, definition]) => {
		const slug = toKebab(name);
		const category = definition.category ?? componentMeta[name]?.category ?? 'unknown';
		const description = definition.description ?? componentMeta[name]?.description ?? '';
		const tier = tierFor(name);
		const docsRoute = docsNavSet.has(name) ? `/components/${slug}` : null;
		const browserSpecs = uniqueSorted(
			browserSpecContents
				.filter(([file, content]) => matchesComponent(file, content, name, slug))
				.map(([file]) => relativePath(file))
		);
		const browserSupport = uniqueSorted(
			browserSupportContents
				.filter(([file, content]) => matchesComponent(file, content, name, slug))
				.map(([file]) => relativePath(file))
		);
		const unitTests = uniqueSorted(
			unitTestContents
				.filter(([file, content]) => matchesComponent(file, content, name, slug))
				.map(([file]) => relativePath(file))
		);
		const docsDemos = uniqueSorted(
			docsDemoContents
				.filter(([file, content]) => matchesComponent(file, content, name, slug))
				.map(([file]) => relativePath(file))
		);
		const docsVisualTests = uniqueSorted(
			docsVisualContents
				.filter(([file, content]) => matchesComponent(file, content, name, slug))
				.map(([file]) => relativePath(file))
		);
		if (docsRoute) {
			docsVisualTests.push('tests/playwright/docs-visual.spec.ts');
		}

		return {
			name,
			slug,
			importPackage: definition.import ?? '@dryui/ui',
			category,
			description,
			compound: Boolean(definition.compound),
			tier,
			docsRoute,
			browserSpecs,
			browserSupport,
			unitTests,
			docsDemos,
			docsVisualTests: uniqueSorted(docsVisualTests),
			signals: {
				hasBrowserSpec: browserSpecs.length > 0,
				hasUnitTest: unitTests.length > 0,
				hasDocsDemo: docsDemos.length > 0,
				hasDocsRoute: docsRoute !== null,
				hasDocsVisualTest: docsVisualTests.length > 0
			}
		} satisfies ComponentMatrixEntry;
	})
	.sort((a, b) => {
		const tierOrder = { tier0: 0, tier1: 1, tier2: 2 };
		return tierOrder[a.tier] - tierOrder[b.tier] || a.name.localeCompare(b.name);
	});

const summary = {
	totalComponents: entries.length,
	byTier: ['tier0', 'tier1', 'tier2'].map((tier) => summarizeTier(entries, tier as RiskTier)),
	tier0WithoutBrowserSpecs: entries
		.filter((entry) => entry.tier === 'tier0' && !entry.signals.hasBrowserSpec)
		.map((entry) => entry.name),
	componentsWithoutTests: entries
		.filter((entry) => !entry.signals.hasBrowserSpec && !entry.signals.hasUnitTest)
		.map((entry) => entry.name),
	componentsWithoutDocsSurface: entries
		.filter((entry) => !entry.signals.hasDocsDemo && !entry.signals.hasDocsRoute)
		.map((entry) => entry.name)
};

const jsonPayload = {
	generatedAt: new Date().toISOString(),
	scope: 'public @dryui/ui components from packages/mcp/src/spec.json',
	summary,
	components: entries
};

await Bun.write(outputJsonPath, JSON.stringify(jsonPayload, null, 2) + '\n');
await Bun.write(outputMarkdownPath, renderMarkdown(entries));

console.log(`Wrote ${relativePath(outputJsonPath)}`);
console.log(`Wrote ${relativePath(outputMarkdownPath)}`);
console.log(`Total components: ${entries.length}`);
console.log(
	`Tier 0 without browser specs: ${summary.tier0WithoutBrowserSpecs.length === 0 ? 'none' : summary.tier0WithoutBrowserSpecs.join(', ')}`
);
