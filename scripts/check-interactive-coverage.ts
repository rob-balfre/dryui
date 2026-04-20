import path from 'node:path';

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

const INTERACTIVE_COMPONENTS = [...new Set([...TIER_0, ...TIER_1])].sort((a, b) =>
	a.localeCompare(b)
);
const componentSlugToName = new Map(INTERACTIVE_COMPONENTS.map((name) => [toSlug(name), name]));

export interface CoveragePolicyResult {
	ok: boolean;
	changedFiles: string[];
	touchedComponents: string[];
	hasCoverageEvidence: boolean;
	hasExemption: boolean;
	message: string;
}

function normalizePath(filePath: string): string {
	return filePath.replaceAll(path.sep, '/').trim();
}

function toSlug(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

export function collectTouchedInteractiveComponents(changedFiles: string[]): string[] {
	const touched = new Set<string>();

	for (const filePath of changedFiles.map(normalizePath)) {
		const match = filePath.match(/^packages\/(?:ui|primitives)\/src\/([^/]+)(?:\/|$)/);
		if (!match) continue;

		const component = componentSlugToName.get(match[1]);
		if (component) touched.add(component);
	}

	return [...touched].sort((a, b) => a.localeCompare(b));
}

export function hasCoverageEvidence(changedFiles: string[]): boolean {
	return changedFiles.map(normalizePath).some((filePath) => {
		if (filePath.startsWith('tests/browser/')) return true;
		if (filePath.startsWith('tests/playwright/') && filePath.endsWith('.visual.spec.ts'))
			return true;
		if (filePath.includes('/tests/playwright/snapshots/')) return true;
		return false;
	});
}

export function hasCoverageExemption(prBody: string): boolean {
	const normalized = prBody.toLowerCase();
	return normalized.includes('coverage-exemption:') && /#\d+/.test(prBody);
}

export function evaluateCoveragePolicy(
	changedFiles: string[],
	prBody: string = ''
): CoveragePolicyResult {
	const normalizedFiles = [...new Set(changedFiles.map(normalizePath).filter(Boolean))].sort(
		(a, b) => a.localeCompare(b)
	);
	const touchedComponents = collectTouchedInteractiveComponents(normalizedFiles);
	const coverageEvidence = hasCoverageEvidence(normalizedFiles);
	const exemption = hasCoverageExemption(prBody);

	if (touchedComponents.length === 0) {
		return {
			ok: true,
			changedFiles: normalizedFiles,
			touchedComponents,
			hasCoverageEvidence: coverageEvidence,
			hasExemption: exemption,
			message: 'No Tier 0 or Tier 1 interactive component source changes detected.'
		};
	}

	if (coverageEvidence || exemption) {
		return {
			ok: true,
			changedFiles: normalizedFiles,
			touchedComponents,
			hasCoverageEvidence: coverageEvidence,
			hasExemption: exemption,
			message: coverageEvidence
				? `Interactive coverage evidence detected for: ${touchedComponents.join(', ')}`
				: `Coverage exemption recorded for: ${touchedComponents.join(', ')}`
		};
	}

	return {
		ok: false,
		changedFiles: normalizedFiles,
		touchedComponents,
		hasCoverageEvidence: coverageEvidence,
		hasExemption: exemption,
		message: [
			`Interactive component changes detected for: ${touchedComponents.join(', ')}`,
			'Add or update browser coverage under tests/browser, update docs visual coverage under tests/playwright, or add `coverage-exemption: #123` to the PR body.'
		].join('\n')
	};
}

function runGit(args: string[]): string {
	const proc = Bun.spawnSync(['git', ...args], {
		stdout: 'pipe',
		stderr: 'pipe',
		env: process.env
	});

	if (proc.exitCode !== 0) {
		const error = new TextDecoder().decode(proc.stderr).trim() || `git ${args.join(' ')} failed`;
		throw new Error(error);
	}

	return new TextDecoder().decode(proc.stdout).trim();
}

function safeRunGit(args: string[]): string {
	try {
		return runGit(args);
	} catch {
		return '';
	}
}

function lines(value: string): string[] {
	return value
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

export function collectChangedFiles(baseRef: string | null): string[] {
	const changed = new Set<string>();

	if (baseRef) {
		const mergeBase = safeRunGit(['merge-base', 'HEAD', baseRef]);
		if (mergeBase) {
			for (const file of lines(
				runGit(['diff', '--name-only', '--diff-filter=ACMR', `${mergeBase}...HEAD`])
			)) {
				changed.add(normalizePath(file));
			}
		}
	}

	for (const file of lines(safeRunGit(['diff', '--name-only', '--diff-filter=ACMR']))) {
		changed.add(normalizePath(file));
	}
	for (const file of lines(safeRunGit(['diff', '--name-only', '--cached', '--diff-filter=ACMR']))) {
		changed.add(normalizePath(file));
	}
	for (const file of lines(safeRunGit(['ls-files', '--others', '--exclude-standard']))) {
		changed.add(normalizePath(file));
	}

	return [...changed].sort((a, b) => a.localeCompare(b));
}

function parseArg(name: string): string | null {
	const prefix = `--${name}=`;
	const match = process.argv.find((arg) => arg.startsWith(prefix));
	return match ? match.slice(prefix.length) : null;
}

if (import.meta.main) {
	const baseRef = parseArg('base') ?? process.env.DRYUI_BASE_REF ?? 'origin/main';
	const prBody = process.env.DRYUI_PR_BODY ?? '';
	const changedFiles = collectChangedFiles(baseRef);
	const result = evaluateCoveragePolicy(changedFiles, prBody);

	if (!result.ok) {
		console.error(result.message);
		process.exit(1);
	}

	console.log(result.message);
}
