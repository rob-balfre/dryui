#!/usr/bin/env bun
/**
 * Generates llms.txt and llms-components.txt for the docs site from spec.json.
 * Run: bun src/generate-llms-txt.ts
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aiSurface } from './ai-surface.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../../');

const specPath = resolve(__dirname, 'spec.json');
const llmsOutputPath = resolve(repoRoot, 'apps/docs/static/llms.txt');
const llmsComponentsOutputPath = resolve(repoRoot, 'apps/docs/static/llms-components.txt');

interface PropDef {
	readonly type: string;
	readonly required?: boolean;
	readonly bindable?: boolean;
	readonly default?: string;
	readonly acceptedValues?: string[];
	readonly description?: string;
	readonly note?: string;
}

interface DataAttributeDef {
	readonly name: string;
	readonly description?: string;
	readonly values?: string[];
}

interface PartDef {
	readonly props: Record<string, PropDef>;
	readonly forwardedProps?: ForwardedPropsDef | null;
}

interface ForwardedPropsDef {
	readonly baseType: string;
	readonly via: 'rest';
	readonly element?: string;
	readonly examples?: string[];
	readonly omitted?: string[];
	readonly note: string;
}

interface StructureDef {
	readonly tree: string[];
	readonly note?: string;
}

interface ComponentSpec {
	readonly import: string;
	readonly description: string;
	readonly category: string;
	readonly tags: string[];
	readonly compound: boolean;
	readonly props?: Record<string, PropDef>;
	readonly parts?: Record<string, PartDef>;
	readonly forwardedProps?: ForwardedPropsDef | null;
	readonly structure?: StructureDef | null;
	readonly a11y?: string[];
	readonly cssVars?: Record<string, string>;
	readonly dataAttributes?: DataAttributeDef[];
	readonly example: string;
}

interface Spec {
	readonly version: string;
	readonly package: string;
	readonly themeImports: {
		readonly default: string;
		readonly dark: string;
	};
	readonly components: Record<string, ComponentSpec>;
	readonly ai?: {
		readonly tools: readonly { readonly name: string; readonly description: string }[];
		readonly prompts: readonly { readonly name: string; readonly description: string }[];
		readonly cliCommands: readonly { readonly name: string; readonly description: string }[];
	};
}

function isSpec(value: unknown): value is Spec {
	return (
		typeof value === 'object' &&
		value !== null &&
		'version' in value &&
		'components' in value &&
		'themeImports' in value
	);
}

const _parsed: unknown = JSON.parse(await readFile(specPath, 'utf8'));
if (!isSpec(_parsed)) throw new Error('Invalid spec.json structure');
const spec: Spec = _parsed;
const ai = spec.ai ?? aiSurface;

function formatProps(props: Record<string, PropDef>): string {
	const entries = Object.entries(props);
	if (entries.length === 0) return '';
	return entries
		.map(([name, def]) => {
			const parts = [`${name} (${def.type})`];
			if (def.description) parts.push(def.description);
			if (def.acceptedValues?.length) parts.push(`accepted ${def.acceptedValues.join(', ')}`);
			if (def.default !== undefined) parts.push(`default ${def.default}`);
			if (def.required) parts.push('required');
			if (def.bindable) parts.push('bindable');
			if (def.note) parts.push(def.note);
			return parts.join(', ');
		})
		.join(' | ');
}

function componentDir(name: string): string {
	const overrides: Record<string, string> = {
		QRCode: 'qr-code'
	};

	return overrides[name] ?? name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function subpathImport(name: string, comp: ComponentSpec): string | null {
	if (comp.import !== '@dryui/ui') return null;
	return `${comp.import}/${componentDir(name)}`;
}

function hasRootPart(comp: ComponentSpec): boolean {
	return Boolean(comp.parts?.Root);
}

function formatDataAttributes(dataAttributes?: DataAttributeDef[]): string {
	if (!dataAttributes?.length) return 'none';
	return dataAttributes
		.map((attr) => {
			const details = [
				attr.description,
				attr.values?.length ? `values ${attr.values.join(', ')}` : null
			]
				.filter(Boolean)
				.join(', ');
			return details ? `${attr.name} (${details})` : attr.name;
		})
		.join(' | ');
}

function formatComponent(name: string, comp: ComponentSpec): string {
	const lines: string[] = [];

	lines.push(`### ${name}`);
	lines.push(comp.description + '.');
	lines.push(`Import: ${comp.import}`);
	const subpath = subpathImport(name, comp);
	if (subpath) {
		lines.push(`Subpath import: ${subpath}`);
	}

	if (comp.compound && comp.parts) {
		const partNames = Object.keys(comp.parts);
		lines.push(`Parts: ${partNames.join(', ')}`);
		if (!hasRootPart(comp)) {
			lines.push('Namespace parts only: no Root wrapper');
		}

		// Collect all props across parts
		const allProps: string[] = [];
		for (const [partName, part] of Object.entries(comp.parts)) {
			const propStr = formatProps(part.props);
			if (propStr) {
				allProps.push(`${partName}: ${propStr}`);
			}
		}
		if (allProps.length > 0) {
			lines.push(`Props: ${allProps.join(' | ')}`);
		}
	} else if (!comp.compound && comp.props) {
		const propStr = formatProps(comp.props);
		if (propStr) {
			lines.push(`Props: ${propStr}`);
		}
	}

	lines.push(`Data attributes: ${formatDataAttributes(comp.dataAttributes)}`);
	if (comp.a11y?.length) {
		lines.push(`Accessibility: ${comp.a11y.join(' | ')}`);
	}

	if (comp.example) {
		// Use the first line of the example as a concise snippet
		const exampleLine = comp.example.split('\n')[0];
		lines.push(`Example: ${exampleLine}`);
	}

	return lines.join('\n');
}

function formatDetailedComponent(name: string, comp: ComponentSpec): string {
	const lines: string[] = [];

	lines.push(`## ${name}`);
	lines.push(`Package: ${comp.import}`);
	lines.push(`Category: ${comp.category}`);
	lines.push(`Tags: ${comp.tags.join(', ')}`);
	lines.push(
		comp.compound ? `Kind: ${hasRootPart(comp) ? 'compound' : 'namespaced'}` : 'Kind: simple'
	);
	lines.push(`Root import: import { ${name} } from '${comp.import}'`);

	const subpath = subpathImport(name, comp);
	if (subpath) {
		lines.push(`Subpath import: import { ${name} } from '${subpath}'`);
	}

	if (comp.compound && comp.parts) {
		lines.push('Parts:');
		for (const [partName, part] of Object.entries(comp.parts)) {
			const partProps = formatProps(part.props);
			lines.push(`- ${name}.${partName}`);
			lines.push(`  Props: ${partProps || 'none'}`);
			if (part.forwardedProps) {
				lines.push(`  Native props: ${part.forwardedProps.note}`);
			}
		}
		if (hasRootPart(comp) && comp.structure?.tree.length) {
			lines.push('Structure:');
			for (const node of comp.structure.tree) {
				lines.push(`  ${node}`);
			}
		}
	} else if (comp.props) {
		lines.push(`Props: ${formatProps(comp.props) || 'none'}`);
		if (comp.forwardedProps) {
			lines.push(`Native props: ${comp.forwardedProps.note}`);
		}
	}

	const cssVars = Object.keys(comp.cssVars ?? {});
	lines.push(`CSS variables: ${cssVars.length > 0 ? cssVars.join(', ') : 'none'}`);
	lines.push(`Data attributes: ${formatDataAttributes(comp.dataAttributes)}`);
	lines.push(`Accessibility: ${comp.a11y?.length ? comp.a11y.join(' | ') : 'none'}`);

	if (comp.example) {
		lines.push('Example:');
		lines.push('```svelte');
		lines.push(comp.example);
		lines.push('```');
	}

	return lines.join('\n');
}

// Group components by category
const byCategory: Record<string, [string, ComponentSpec][]> = {};
for (const [name, comp] of Object.entries(spec.components)) {
	const cat = comp.category;
	if (!byCategory[cat]) byCategory[cat] = [];
	byCategory[cat].push([name, comp]);
}

const categoryOrder = [
	'action',
	'input',
	'form',
	'layout',
	'navigation',
	'overlay',
	'display',
	'feedback',
	'interaction',
	'utility'
];

const orderedCategories = [
	...categoryOrder.filter((category) => byCategory[category]),
	...Object.keys(byCategory).filter((category) => !categoryOrder.includes(category))
];

const totalComponents = Object.keys(spec.components).length;
const mcpTools = ai.tools.map((entry) => entry.name) as readonly string[];
const cliCommands = ai.cliCommands.map((entry) => entry.name) as readonly string[];

function buildLlmsText(spec: Spec): string {
	const sections: string[] = [];

	sections.push(`# DryUI

> ${totalComponents} zero-dependency Svelte 5 components with headless primitives, styled defaults, and an AI surface for scope-driven discovery and path-driven validation.

## Packages

- @dryui/primitives: Headless, unstyled components
- @dryui/ui: Styled components with CSS variables and theme system
- @dryui/mcp: MCP server with collapsed ask/check tools for discovery, setup guidance, and validation
- @dryui/cli: CLI for detect, install, project-aware add, lookup, source retrieval, composition guidance, and validation

## AI Surface

- MCP tools: ${mcpTools.join(', ')}
- CLI commands: ${cliCommands.join(', ')}

## Installation

\`\`\`
bun add @dryui/ui
\`\`\`

## Theme Setup

\`\`\`html
<!-- In your root layout or app entry -->
<link rel="stylesheet" href="${spec.themeImports.default}" />
<link rel="stylesheet" href="${spec.themeImports.dark}" />
\`\`\`

\`\`\`html
<!-- Preferred default: follow the browser/OS theme -->
<html class="theme-auto" />
\`\`\`

Use \`data-theme="light"\` or \`data-theme="dark"\` only for explicit overrides. If you build a theme toggle, persist the explicit override and keep system mode as the fallback.

## Components
`);

	for (const category of orderedCategories) {
		const components = byCategory[category];
		if (!components) continue;

		const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
		sections.push(`### Category: ${categoryTitle}\n`);

		for (const [name, comp] of components) {
			sections.push(formatComponent(name, comp));
			sections.push('');
		}
	}

	sections.push(`## CSS Variables

All components support CSS variable theming. Override at the :root level or component level:

\`\`\`css
:root {
  --dry-btn-radius: 8px;
  --dry-btn-bg: #6366f1;
}
\`\`\`

## CLI

The CLI is the default entry point for working with DryUI. Start with bare \`dryui\` for editor integration and feedback onboarding, then use it for project bootstrapping, deterministic project detection, install planning, project-aware add planning, source retrieval, composition guidance, and validation.

Install once with \`bun install -g @dryui/cli@latest\` (or \`npm install -g @dryui/cli@latest\`). Every command outputs TOON (token-optimized, agent-friendly) by default. Pass \`--text\` for human-readable plain text, \`--json\` where supported, or \`--full\` to disable truncation.

Current command surface: ${cliCommands.join(', ')}.

\`\`\`
dryui
dryui init my-app
dryui detect <project-path>
dryui install <project-path>
dryui add --project --target <file> Card
dryui info <component>
dryui list --category layout
dryui compose "date input"
dryui review src/routes/+page.svelte
dryui diagnose src/app.css
dryui doctor --changed
dryui lint --max-severity warning
\`\`\`

No global install? Prefix any command with \`bunx @dryui/cli …\` or \`npx -y @dryui/cli …\` — same behaviour, slower on each call.

## MCP Server & Skill

After the CLI is working, DryUI also ships an MCP server (live tools) and a skill (conventions) for supported editors. All MCP output uses TOON (token-optimized) format with contextual next-step suggestions.

### Install

- **Claude Code**: \`claude plugin marketplace add rob-balfre/dryui && claude plugin install dryui@dryui\` (plugin bundles skill + MCP)
- **Codex**: public install today is \`$skill-installer install https://github.com/rob-balfre/dryui/tree/main/packages/ui/skills/dryui\` then \`codex mcp add dryui -- npx -y @dryui/mcp\`. If you're working inside the DryUI repo, install the repo-local plugin from \`/plugins\` via \`.agents/plugins/marketplace.json\`
- **Copilot / Cursor / Windsurf**: \`npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui\` + add MCP config
- **Zed**: MCP only (reads AGENTS.md for conventions)

MCP config for tools that need it manually: \`"command": "npx", "args": ["-y", "@dryui/mcp"]\` — root key varies by tool (mcpServers for Cursor/Windsurf, servers for Copilot, context_servers for Zed).

Available MCP tools:
${ai.tools.map((tool) => `- ${tool.name}: ${tool.description}`).join('\n')}`);

	return sections.join('\n');
}

function buildLlmsComponentsText(spec: Spec): string {
	const sections: string[] = [];

	sections.push(`# DryUI component reference

> Machine-readable component import, props, styling hook, and example index for ${totalComponents} DryUI components.

Theme imports:
- ${spec.themeImports.default}
- ${spec.themeImports.dark}
`);

	for (const category of orderedCategories) {
		const components = byCategory[category];
		if (!components) continue;

		sections.push(`### ${category}`);
		sections.push('');

		for (const [name, comp] of components) {
			sections.push(formatDetailedComponent(name, comp));
			sections.push('');
		}
	}

	return sections.join('\n');
}

const llmsText = buildLlmsText(spec);
const llmsComponentsText = buildLlmsComponentsText(spec);

await Promise.all([
	writeFile(llmsOutputPath, llmsText),
	writeFile(llmsComponentsOutputPath, llmsComponentsText)
]);

console.log(`Generated llms.txt at ${llmsOutputPath}`);
console.log(`Generated llms-components.txt at ${llmsComponentsOutputPath}`);
console.log(`  ${totalComponents} components documented`);
