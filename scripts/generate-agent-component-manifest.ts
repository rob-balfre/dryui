/**
 * Builds the compact agent contracts shipped with the dryui-build skill.
 *
 * Source of truth stays in the docs-generated component page data and the lint
 * package rule catalog. The skill copies keep only the fields agents need for
 * deterministic lookup and prop checks: imports, quick starts, CSS hooks, a11y
 * notes, parts, prop names/types/value enums, and lint rule explanations.
 * Svelte `children` snippet props are intentionally omitted because agents
 * should use normal component content instead of passing a `children` prop.
 *
 * Usage:
 *   bun scripts/generate-agent-component-manifest.ts
 *   bun scripts/generate-agent-component-manifest.ts --check
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RULE_CATALOG } from '../packages/lint/src/rule-catalog.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const sourcePath = resolve(repoRoot, 'apps/docs/src/lib/generated/component-pages.json');
const componentOutputPath = resolve(repoRoot, 'skills/dryui-build/data/component-manifest.json');
const lintOutputPath = resolve(repoRoot, 'skills/dryui-build/data/lint-rules.json');
const checkOnly = process.argv.includes('--check');

const themeImportPattern = /^\s*import\s+['"]@dryui\/ui\/themes\/(?:default|dark)\.css['"];\s*$/;

const componentDiscoveryTerms: Record<string, readonly string[]> = {
	Alert: ['banner', 'callout', 'inline alert', 'notice', 'status message'],
	AppFrame: [
		'app chrome',
		'app shell',
		'browser chrome',
		'chrome',
		'frame',
		'preview frame',
		'top bar',
		'topbar',
		'window chrome'
	],
	Avatar: ['avatar', 'initials', 'profile image', 'profile photo', 'user image', 'user photo'],
	Badge: ['badge', 'label', 'status badge', 'status label'],
	Breadcrumb: ['breadcrumbs', 'crumbs', 'hierarchy navigation', 'wayfinding'],
	Chip: ['choice chip', 'filter chip', 'filter pill', 'pill', 'selection chip', 'token'],
	ChipGroup: ['badge row', 'chip row', 'filter row', 'inline filters', 'pill group', 'tag row'],
	FlipCard: ['card', 'card face', 'flippable card', 'interactive card'],
	HoverCard: ['card', 'hover card', 'preview card', 'profile card'],
	Link: ['anchor', 'nav link', 'navigation link'],
	LogoMark: ['brand badge', 'brand mark', 'category badge', 'logo badge'],
	MegaMenu: [
		'app nav',
		'header nav',
		'mega nav',
		'mega navbar',
		'nav bar',
		'navigation',
		'navigation menu',
		'navbar',
		'site nav'
	],
	Menubar: ['app menu', 'header nav', 'menu bar', 'nav bar', 'navigation', 'navbar', 'top menu'],
	NavigationMenu: [
		'app nav',
		'flyout nav',
		'header navigation',
		'nav bar',
		'nav menu',
		'navigation',
		'navbar',
		'site nav'
	],
	Pagination: ['page navigation', 'pager'],
	Sidebar: ['app chrome', 'app nav', 'navigation rail', 'side nav', 'sidebar navigation'],
	Spotlight: ['card', 'card highlight', 'panel highlight', 'surface highlight'],
	Stepper: ['progress navigation', 'step navigation', 'wizard navigation'],
	TableOfContents: ['anchor navigation', 'contents navigation', 'in-page navigation', 'toc'],
	Tabs: ['section navigation', 'tab navigation', 'tabs'],
	Toast: ['callout', 'notification', 'status message'],
	Toolbar: ['action bar', 'app chrome', 'command bar', 'topbar', 'toolbar']
};

interface SourceProp {
	readonly type: string;
	readonly required?: boolean;
	readonly bindable?: boolean;
	readonly default?: string;
	readonly acceptedValues?: readonly string[];
}

interface SourcePart {
	readonly props: Record<string, SourceProp>;
}

interface SourceComponent {
	readonly name: string;
	readonly slug: string;
	readonly description: string;
	readonly category: string;
	readonly sourcePackage: string;
	readonly compound: boolean;
	readonly props: Record<string, SourceProp> | null;
	readonly parts: Record<string, SourcePart> | null;
	readonly forwardedProps?: {
		readonly examples?: readonly string[];
		readonly note: string;
	} | null;
	readonly a11y: readonly string[];
	readonly cssVars: Record<string, string>;
	readonly dataAttributes: readonly { readonly name: string; readonly description?: string }[];
	readonly rootImport: string;
	readonly subpathImport: string;
	readonly quickStartCode: string;
}

interface SourceManifest {
	readonly layoutHints: readonly string[];
	readonly components: Record<string, SourceComponent>;
}

interface AgentProp {
	readonly type: string;
	readonly required?: true;
	readonly bindable?: true;
	readonly default?: string;
	readonly values?: readonly string[];
}

interface AgentPart {
	readonly props: Record<string, AgentProp>;
	readonly requiredProps?: readonly string[];
}

interface AgentComponent {
	readonly slug: string;
	readonly category: string;
	readonly package: string;
	readonly kind: 'simple' | 'compound';
	readonly description: string;
	readonly rootImport: string;
	readonly subpathImport: string;
	readonly quickStartCode: string;
	readonly requiredProps?: readonly string[];
	readonly avoidProps: readonly string[];
	readonly discoveryTerms?: readonly string[];
	readonly a11y: readonly string[];
	readonly cssVars: Record<string, string>;
	readonly dataAttributes: readonly string[];
	readonly forwardedProps?: {
		readonly examples?: readonly string[];
		readonly note: string;
	};
	readonly props?: Record<string, AgentProp>;
	readonly parts?: Record<string, AgentPart>;
}

interface AgentManifest {
	readonly schemaVersion: 1;
	readonly source: string;
	readonly description: string;
	readonly componentCount: number;
	readonly layoutHints: readonly string[];
	readonly components: Record<string, AgentComponent>;
}

interface AgentLintRule {
	readonly severity: string;
	readonly category: string;
	readonly message: string;
	readonly suggestedFix?: string;
}

interface AgentLintManifest {
	readonly schemaVersion: 1;
	readonly source: string;
	readonly description: string;
	readonly ruleCount: number;
	readonly rules: Record<string, AgentLintRule>;
}

function readSource(): SourceManifest {
	return JSON.parse(readFileSync(sourcePath, 'utf8')) as SourceManifest;
}

function compactType(type: string): string {
	return type
		.replace(/\s+/g, ' ')
		.replace(/^\|\s*/, '')
		.trim();
}

function compactProp(prop: SourceProp): AgentProp {
	const out: Record<string, unknown> = {
		type: compactType(prop.type)
	};

	if (prop.required) out.required = true;
	if (prop.bindable) out.bindable = true;
	if (prop.default !== undefined) out.default = prop.default;
	if (prop.acceptedValues && prop.acceptedValues.length > 0) {
		out.values = [...prop.acceptedValues];
	}

	return out as AgentProp;
}

function compactProps(props: Record<string, SourceProp>): Record<string, AgentProp> {
	const out: Record<string, AgentProp> = {};
	for (const [name, prop] of Object.entries(props)) {
		if (name === 'children') continue;
		out[name] = compactProp(prop);
	}
	return out;
}

function uniqueSorted(values: readonly string[]): readonly string[] {
	return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((left, right) =>
		left.localeCompare(right)
	);
}

function compactParts(parts: Record<string, SourcePart>): Record<string, AgentPart> {
	const out: Record<string, AgentPart> = {};
	for (const [name, part] of Object.entries(parts)) {
		const props = compactProps(part.props);
		const requiredProps = listRequiredProps(part.props);
		out[name] = requiredProps.length > 0 ? { props, requiredProps } : { props };
	}
	return out;
}

function listRequiredProps(props: Record<string, SourceProp> | null): readonly string[] {
	if (!props) return [];
	return Object.entries(props)
		.filter(([name, prop]) => name !== 'children' && prop.required)
		.map(([name]) => name)
		.sort((left, right) => left.localeCompare(right));
}

function listPropNames(entry: SourceComponent): Set<string> {
	const names = new Set<string>();
	for (const name of Object.keys(entry.props ?? {})) names.add(name);
	for (const part of Object.values(entry.parts ?? {})) {
		for (const name of Object.keys(part.props ?? {})) names.add(name);
	}
	return names;
}

function listAvoidProps(entry: SourceComponent): readonly string[] {
	const propNames = listPropNames(entry);
	const avoid = new Set(['class', 'style', 'children']);
	if (!propNames.has('className')) avoid.add('className');
	return [...avoid].sort((left, right) => left.localeCompare(right));
}

function listDiscoveryTerms(entry: SourceComponent): readonly string[] {
	const terms = [...(componentDiscoveryTerms[entry.name] ?? [])];
	if (entry.category === 'navigation') terms.push('nav', 'navigation', 'wayfinding');
	return uniqueSorted(terms);
}

function stripQuickStartThemeImports(code: string): string {
	return code
		.split('\n')
		.filter((line) => !themeImportPattern.test(line))
		.join('\n')
		.replace('<script lang="ts">\n\n', '<script lang="ts">\n');
}

function compactForwardedProps(
	forwardedProps: SourceComponent['forwardedProps'],
	avoidProps: readonly string[]
): AgentComponent['forwardedProps'] | null {
	if (!forwardedProps) return null;
	const avoid = new Set(avoidProps);
	const examples = (forwardedProps.examples ?? []).filter((example) => !avoid.has(example));
	const out: Record<string, unknown> = {
		note: forwardedProps.note
	};
	if (examples.length > 0) out.examples = examples;
	return out as AgentComponent['forwardedProps'];
}

function compactComponent(entry: SourceComponent): AgentComponent {
	const avoidProps = listAvoidProps(entry);
	const discoveryTerms = listDiscoveryTerms(entry);
	const base: Record<string, unknown> = {
		slug: entry.slug,
		category: entry.category,
		package: entry.sourcePackage,
		kind: entry.compound ? 'compound' : 'simple',
		description: entry.description,
		rootImport: entry.rootImport,
		subpathImport: entry.subpathImport,
		quickStartCode: stripQuickStartThemeImports(entry.quickStartCode),
		avoidProps,
		a11y: entry.a11y,
		cssVars: entry.cssVars,
		dataAttributes: entry.dataAttributes.map((attribute) => attribute.name)
	};

	const requiredProps = listRequiredProps(entry.props);
	if (requiredProps.length > 0) base.requiredProps = requiredProps;
	if (discoveryTerms.length > 0) base.discoveryTerms = discoveryTerms;
	const forwardedProps = compactForwardedProps(entry.forwardedProps, avoidProps);
	if (forwardedProps) base.forwardedProps = forwardedProps;
	if (entry.props) {
		const props = compactProps(entry.props);
		if (Object.keys(props).length > 0) base.props = props;
	}
	if (entry.parts) base.parts = compactParts(entry.parts);

	return base as AgentComponent;
}

function buildManifest(): AgentManifest {
	const source = readSource();
	const components = Object.values(source.components).sort((left, right) =>
		left.name.localeCompare(right.name)
	);
	const out: Record<string, AgentComponent> = {};

	for (const entry of components) {
		out[entry.name] = compactComponent(entry);
	}

	return {
		schemaVersion: 1,
		source: relative(repoRoot, sourcePath),
		description:
			'Compact DryUI component contract for agent lookup and deterministic prop/value checks.',
		componentCount: components.length,
		layoutHints: source.layoutHints,
		components: out
	};
}

function buildLintManifest(): AgentLintManifest {
	const rules: Record<string, AgentLintRule> = {};
	for (const [id, entry] of Object.entries(RULE_CATALOG).sort(([left], [right]) =>
		left.localeCompare(right)
	)) {
		const rule: Record<string, string> = {
			severity: entry.severity,
			category: entry.category ?? 'correctness',
			message: entry.message
		};
		if ('suggestedFix' in entry && entry.suggestedFix) rule.suggestedFix = entry.suggestedFix;
		rules[id] = rule as AgentLintRule;
	}

	return {
		schemaVersion: 1,
		source: 'packages/lint/src/rule-catalog.ts',
		description: 'Compact DryUI lint rule catalog for agent explanations and repair hints.',
		ruleCount: Object.keys(rules).length,
		rules
	};
}

function renderJson(value: unknown): string {
	return `${JSON.stringify(value, null, 2)}\n`;
}

function checkOutput(path: string, rendered: string): boolean {
	const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
	if (current === rendered) return true;
	console.error(`generate-agent-component-manifest: ${relative(repoRoot, path)} is out of date`);
	return false;
}

function writeOutput(path: string, rendered: string): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, rendered);
	console.log(`generate-agent-component-manifest: wrote ${relative(repoRoot, path)}`);
}

const outputs = [
	{ path: componentOutputPath, rendered: renderJson(buildManifest()) },
	{ path: lintOutputPath, rendered: renderJson(buildLintManifest()) }
];

if (checkOnly) {
	const ok = outputs.every((output) => checkOutput(output.path, output.rendered));
	if (!ok) {
		process.exit(1);
	}
	console.log('generate-agent-component-manifest: agent manifests are up to date');
} else {
	for (const output of outputs) writeOutput(output.path, output.rendered);
}
