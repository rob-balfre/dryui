import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { RULE_CATALOG, type RuleCatalogId } from '../packages/lint/src/rule-catalog.js';

export interface SkillRuleContractDiagnostic {
	readonly file: string;
	readonly reason: string;
}

interface TextClaim {
	readonly file: string;
	readonly label: string;
	readonly patterns: readonly RegExp[];
}

interface CatalogClaim {
	readonly id: RuleCatalogId;
	readonly label: string;
	readonly patterns: readonly RegExp[];
}

interface SkillRuleContract {
	readonly name: string;
	readonly textClaims: readonly TextClaim[];
	readonly catalogClaims: readonly CatalogClaim[];
}

const LAYOUT_RULE_CONTRACT: SkillRuleContract = {
	name: 'layout rules',
	catalogClaims: [
		{
			id: 'dryui/no-layout-component',
			label: 'layout components are rejected in favor of data-layout and src/layout.css',
			patterns: [/data-layout/, /src\/layout\.css/]
		},
		{
			id: 'dryui/no-inline-style',
			label: 'inline style attributes are rejected',
			patterns: [/inline style/i]
		},
		{
			id: 'dryui/no-style-directive',
			label: 'Svelte style directives are rejected',
			patterns: [/style: directives/i]
		},
		{
			id: 'dryui/no-flex',
			label: 'page-level flex is sent to src/layout.css',
			patterns: [/src\/layout\.css/]
		},
		{
			id: 'dryui/no-raw-grid',
			label: 'page-level grid is sent to src/layout.css and data-layout hooks',
			patterns: [/src\/layout\.css/, /data-layout/]
		},
		{
			id: 'dryui/no-media-sizing',
			label: 'responsive sizing uses container queries',
			patterns: [/@container|container queries/i]
		},
		{
			id: 'dryui/layout-css-at-rule',
			label: 'layout.css at-rules are limited to container wrappers',
			patterns: [/@container|container/i]
		},
		{
			id: 'dryui/layout-css-selector',
			label: 'layout.css selectors use data-layout hooks',
			patterns: [/\[data-layout\]/, /\[data-layout-area\]/]
		},
		{
			id: 'dryui/layout-css-property',
			label: 'layout.css properties are layout-only',
			patterns: [/display/, /grid/, /flex/, /container/]
		},
		{
			id: 'dryui/layout-css-value',
			label: 'layout.css values are layout-safe',
			patterns: [/grid/, /flex/, /container/]
		}
	],
	textClaims: [
		{
			file: 'skills/dryui/SKILL.md',
			label: 'primary Skill layout rule',
			patterns: [
				/DryUI does not ship a layout component/,
				/src\/layout\.css/,
				/data-layout/,
				/data-layout-area/,
				/display: grid/,
				/display: flex/,
				/@container/,
				/never `@media`|never @media/,
				/style=/,
				/style:/
			]
		},
		{
			file: 'skills/dryui/rules/composition.md',
			label: 'composition layout rule',
			patterns: [
				/Page Layout in `src\/layout\.css`/,
				/\[data-layout\]/,
				/\[data-layout-area\]/,
				/No page-level grid\/flex/i,
				/no inline styles/i,
				/no layout components/i
			]
		}
	]
};

function catalogText(id: RuleCatalogId): string {
	const entry = RULE_CATALOG[id];
	return [entry.message, 'suggestedFix' in entry ? entry.suggestedFix : ''].join('\n');
}

function missingPatterns(patterns: readonly RegExp[], content: string): RegExp[] {
	return patterns.filter((pattern) => !pattern.test(content));
}

export async function checkSkillRuleContracts(
	root = join(import.meta.dir, '..')
): Promise<SkillRuleContractDiagnostic[]> {
	const diagnostics: SkillRuleContractDiagnostic[] = [];

	for (const claim of LAYOUT_RULE_CONTRACT.catalogClaims) {
		const missing = missingPatterns(claim.patterns, catalogText(claim.id));
		for (const pattern of missing) {
			diagnostics.push({
				file: 'packages/lint/src/rule-catalog.ts',
				reason: `${LAYOUT_RULE_CONTRACT.name}: ${claim.id} no longer states "${claim.label}" (missing ${pattern})`
			});
		}
	}

	for (const claim of LAYOUT_RULE_CONTRACT.textClaims) {
		const absolutePath = join(root, claim.file);
		let content: string;
		try {
			content = await readFile(absolutePath, 'utf8');
		} catch (error) {
			diagnostics.push({
				file: claim.file,
				reason: `${LAYOUT_RULE_CONTRACT.name}: cannot read ${claim.label}: ${String(error)}`
			});
			continue;
		}

		const missing = missingPatterns(claim.patterns, content);
		for (const pattern of missing) {
			diagnostics.push({
				file: relative(root, absolutePath),
				reason: `${LAYOUT_RULE_CONTRACT.name}: ${claim.label} is missing ${pattern}`
			});
		}
	}

	return diagnostics;
}
