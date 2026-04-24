// Legacy add-mode snippet builder for DryUI CLI.

import { findComponent } from './info.js';
import type { ComponentDef, Spec } from './types.js';
import { indent, componentDir } from '@dryui/mcp/spec-formatters';
import type {
	AddPlan,
	InstallPlan,
	ProjectDetection,
	ProjectPlanStep
} from '@dryui/mcp/project-planner';

interface AddOptions {
	subpath?: boolean;
	withTheme?: boolean;
}

function importStatement(name: string, def: ComponentDef, subpath = false): string {
	if (subpath && def.import === '@dryui/ui') {
		return `import { ${name} } from '${def.import}/${componentDir(name)}';`;
	}

	return `import { ${name} } from '${def.import}';`;
}

function renderSnippet(name: string, def: ComponentDef, spec: Spec, options: AddOptions): string {
	const lines: string[] = ['<script lang="ts">'];

	if (options.withTheme && def.import === '@dryui/ui') {
		lines.push(`  import '${spec.themeImports.default}';`);
		lines.push(`  import '${spec.themeImports.dark}';`);
	}

	lines.push(`  ${importStatement(name, def, options.subpath)}`);
	lines.push('</script>');
	lines.push('');
	lines.push(def.example);

	return lines.join('\n');
}

function yesNo(value: boolean): string {
	return value ? 'yes' : 'no';
}

function formatStep(step: ProjectPlanStep, index: number): string[] {
	const lines = [`${index + 1}. [${step.status}] ${step.title}`];
	lines.push(`   ${step.description}`);
	if (step.path) {
		lines.push(`   File: ${step.path}`);
	}
	if (step.command) {
		lines.push(`   Command: ${step.command}`);
	}
	if (step.snippet) {
		lines.push('   Snippet:');
		lines.push(indent(step.snippet, 6));
	}
	return lines;
}

function formatDetectionSummary(detection: ProjectDetection): string[] {
	const lines = [
		`Input: ${detection.inputPath}`,
		`Root: ${detection.root ?? '(not found)'}`,
		`Status: ${detection.status}`,
		`Framework: ${detection.framework}`,
		`Package manager: ${detection.packageManager}`,
		`Design brief: ${detection.design.present ? (detection.design.path ?? 'yes') : 'not found'}`,
		'',
		'Files:',
		`  package.json: ${detection.packageJsonPath ?? '(not found)'}`,
		`  svelte.config: ${detection.files.svelteConfig ?? '(not found)'}`,
		`  app.html: ${detection.files.appHtml ?? '(not found)'}`,
		`  layout: ${detection.files.rootLayout ?? '(not found)'}`,
		`  page: ${detection.files.rootPage ?? '(not found)'}`,
		'',
		'Dependencies:',
		`  @dryui/ui: ${yesNo(detection.dependencies.ui)}`,
		`  @dryui/primitives: ${yesNo(detection.dependencies.primitives)}`,
		`  @dryui/lint: ${yesNo(detection.dependencies.lint)}`,
		'',
		'Theme:',
		`  default imported: ${yesNo(detection.theme.defaultImported)}`,
		`  dark imported: ${yesNo(detection.theme.darkImported)}`,
		`  theme-auto: ${yesNo(detection.theme.themeAuto)}`,
		'',
		'Lint:',
		`  preprocessor wired: ${yesNo(detection.lint.preprocessorWired)}`
	];

	if (detection.warnings.length > 0) {
		lines.push('');
		lines.push('Warnings:');
		for (const warning of detection.warnings) {
			lines.push(`  - ${warning}`);
		}
	}

	return lines;
}

export function formatProjectDetection(detection: ProjectDetection): string {
	return ['DryUI project detection', '', ...formatDetectionSummary(detection)].join('\n');
}

export function formatInstallPlan(plan: InstallPlan): string {
	const lines = ['DryUI install plan', '', ...formatDetectionSummary(plan.detection), '', 'Steps:'];
	if (plan.steps.length === 0) {
		lines.push('  (none)');
		return lines.join('\n');
	}

	for (const [index, step] of plan.steps.entries()) {
		lines.push(...formatStep(step, index), '');
	}

	return lines.slice(0, -1).join('\n');
}

export function formatAddPlan(plan: AddPlan): string {
	const lines = [
		'DryUI add plan',
		'',
		...formatDetectionSummary(plan.detection),
		'',
		`Name: ${plan.name}`,
		`Target type: ${plan.targetType}`,
		`Target: ${plan.target ?? '(choose a target)'}`,
		`Import: ${plan.importStatement ?? '(source-owned output)'}`,
		'',
		'Install steps:'
	];

	for (const [index, step] of plan.installPlan.steps.entries()) {
		lines.push(...formatStep(step, index), '');
	}

	if (plan.installPlan.steps.length === 0) {
		lines.push('  (none)', '');
	}

	lines.push('Add steps:');
	if (plan.steps.length === 0) {
		lines.push('  (none)');
	} else {
		for (const [index, step] of plan.steps.entries()) {
			lines.push(...formatStep(step, index), '');
		}
		lines.pop();
	}

	if (plan.warnings.length > 0) {
		lines.push('', 'Warnings:');
		for (const warning of plan.warnings) {
			lines.push(`  - ${warning}`);
		}
	}

	return lines.join('\n');
}

export function buildAddSnippet(
	query: string,
	spec: Spec,
	options: AddOptions = {}
): { output: string; error: string | null; exitCode: number } {
	const component = findComponent(spec, query);
	if (!component) {
		return {
			output: '',
			error: `Unknown component: "${query}"`,
			exitCode: 1
		};
	}

	const { name, def } = component;
	return {
		output: renderSnippet(name, def, spec, options),
		error: null,
		exitCode: 0
	};
}
