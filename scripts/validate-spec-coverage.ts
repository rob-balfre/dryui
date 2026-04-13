/**
 * validate-spec-coverage.ts
 *
 * Checks that every public UI component is:
 *   1. Registered in the structured component manifest
 *   2. Exported from the public barrel (packages/ui/src/index.ts)
 *   3. If compound, listed in the structured skill compound list
 *   4. Present in the docs nav so the generated docs surface stays discoverable
 *
 * Also flags manifest entries that have no matching directory, compound
 * components in the skill manifest that don't exist in spec.json, removed
 * layout primitives that are still exported, and stale guidance that still
 * suggests those removed primitives.
 *
 * Usage:  bun run scripts/validate-spec-coverage.ts
 * Exit 0 = all clean, Exit 1 = mismatches found.
 */

import { resolve } from 'node:path';
import {
	componentMeta,
	docsNavComponentNames,
	primitiveComponentNames,
	skillCompoundComponents
} from '../packages/mcp/src/component-catalog.js';

const repoRoot = resolve(import.meta.dir, '..');
const uiSrcDir = resolve(repoRoot, 'packages/ui/src');
const primitivesSrcDir = resolve(repoRoot, 'packages/primitives/src');
const uiIndexPath = resolve(repoRoot, 'packages/ui/src/index.ts');
const primitivesIndexPath = resolve(repoRoot, 'packages/primitives/src/index.ts');
const specJsonPath = resolve(repoRoot, 'packages/mcp/src/spec.json');

const IGNORED_DIRS = new Set(['themes', 'internal', 'utils']);
const BANNED_LAYOUT_COMPONENTS = ['Grid', 'Flex', 'Stack'] as const;
const BANNED_GUIDANCE_CHECKS = [
	{
		path: resolve(repoRoot, 'packages/mcp/src/reviewer.ts'),
		patterns: ['<Grid>', '<Flex>', '<Stack>']
	},
	{
		path: resolve(repoRoot, 'packages/mcp/src/index.ts'),
		patterns: ['layout components apply']
	},
	{
		path: resolve(repoRoot, 'packages/mcp/src/composition-data.ts'),
		patterns: [
			'responsive Grid inside a Card',
			'full layout component',
			'Flex with buttons for toolbar'
		]
	},
	{
		path: resolve(repoRoot, 'scripts/dogfood-audit.ts'),
		patterns: ['Flex or Stack', "suggestion: 'Grid'", "suggestion: 'Flex'"]
	}
] as const;

async function getComponentDirs(rootDir: string): Promise<Set<string>> {
	const glob = new Bun.Glob('*/');
	const dirs = new Set<string>();
	for await (const entry of glob.scan({ cwd: rootDir, onlyFiles: false })) {
		const name = entry.replace(/\/$/, '');
		if (!IGNORED_DIRS.has(name)) {
			dirs.add(name);
		}
	}
	return dirs;
}

async function getExportedDirs(): Promise<Set<string>> {
	const src = await Bun.file(uiIndexPath).text();
	const dirs = new Set<string>();
	const re = /from\s+['"]\.\/([\w-]+)\/index\.js['"]/g;
	let match: RegExpExecArray | null;
	while ((match = re.exec(src)) !== null) {
		dirs.add(match[1]);
	}
	return dirs;
}

async function getExportedComponentNames(path: string): Promise<Set<string>> {
	const src = await Bun.file(path).text();
	const names = new Set<string>();
	const re = /export\s+\{([^}]+)\}\s+from\s+['"]\.\/[\w-]+\/index\.js['"]/g;
	let match: RegExpExecArray | null;
	while ((match = re.exec(src)) !== null) {
		for (const rawName of match[1].split(',')) {
			const cleaned = rawName.trim().split(/\s+as\s+/i)[0];
			if (/^[A-Z][A-Za-z0-9]*$/.test(cleaned) && cleaned !== cleaned.toUpperCase()) {
				names.add(cleaned);
			}
		}
	}
	return names;
}

async function getSpecCompounds(): Promise<Set<string>> {
	const spec = JSON.parse(await Bun.file(specJsonPath).text());
	const names = new Set<string>();
	for (const [name, def] of Object.entries(
		spec.components as Record<string, { compound?: boolean; import?: string }>
	)) {
		if (def.compound && def.import === '@dryui/ui') {
			names.add(name);
		}
	}
	return names;
}

function toKebab(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

function toPascal(name: string): string {
	return name
		.split('-')
		.map((value) => value.charAt(0).toUpperCase() + value.slice(1))
		.join('');
}

function sorted(values: Set<string>): string[] {
	return [...values].sort();
}

const [
	uiComponentDirs,
	primitiveComponentDirs,
	exportedDirs,
	exportedUiComponents,
	exportedPrimitiveComponents,
	specCompounds
] = await Promise.all([
	getComponentDirs(uiSrcDir),
	getComponentDirs(primitivesSrcDir),
	getExportedDirs(),
	getExportedComponentNames(uiIndexPath),
	getExportedComponentNames(primitivesIndexPath),
	getSpecCompounds()
]);

const manifestNames = new Set(Object.keys(componentMeta));
const primitiveManifestNames = new Set(primitiveComponentNames);
const uiManifestNames = new Set(
	[...manifestNames].filter((name) => !primitiveManifestNames.has(name))
);
const uiManifestDirs = new Set([...uiManifestNames].map(toKebab));
const docsNavComponents = new Set(docsNavComponentNames);
const skillCompounds = new Set(skillCompoundComponents);
const errors: string[] = [];

const missingFromMeta = new Set<string>();
for (const dir of uiComponentDirs) {
	if (!uiManifestDirs.has(dir)) {
		missingFromMeta.add(dir);
	}
}
if (missingFromMeta.size > 0) {
	errors.push(
		`Components with a directory in packages/ui/src/ but MISSING from the component manifest:\n` +
			sorted(missingFromMeta)
				.map((dir) => `  - ${dir}  (add ${toPascal(dir)} to packages/mcp/src/component-catalog.ts)`)
				.join('\n')
	);
}

const missingFromIndex = new Set<string>();
for (const dir of uiComponentDirs) {
	if (!exportedDirs.has(dir)) {
		missingFromIndex.add(dir);
	}
}
if (missingFromIndex.size > 0) {
	errors.push(
		`Components with a directory in packages/ui/src/ but NOT exported from packages/ui/src/index.ts:\n` +
			sorted(missingFromIndex)
				.map(
					(dir) =>
						`  - ${dir}  (add export { ${toPascal(dir)} } from './${dir}/index.js'; to index.ts)`
				)
				.join('\n')
	);
}

const missingDir = new Set<string>();
for (const name of uiManifestNames) {
	if (!uiComponentDirs.has(toKebab(name))) {
		missingDir.add(name);
	}
}
for (const name of primitiveManifestNames) {
	if (!primitiveComponentDirs.has(toKebab(name))) {
		missingDir.add(name);
	}
}
if (missingDir.size > 0) {
	errors.push(
		`Components in the component manifest but with NO matching directory in packages/ui/src/ or packages/primitives/src/:\n` +
			sorted(missingDir)
				.map((name) => `  - ${name}`)
				.join('\n')
	);
}

const missingFromSkill = new Set<string>();
for (const name of specCompounds) {
	if (!skillCompounds.has(name)) {
		missingFromSkill.add(name);
	}
}
if (missingFromSkill.size > 0) {
	errors.push(
		`Compound components in spec.json but MISSING from the SKILL.md compound list:\n` +
			sorted(missingFromSkill)
				.map((name) => `  - ${name}`)
				.join('\n') +
			`\n  Update packages/ui/skills/dryui/SKILL.md and packages/mcp/src/component-catalog.ts together.`
	);
}

const ghostInSkill = new Set<string>();
for (const name of skillCompounds) {
	if (!specCompounds.has(name)) {
		ghostInSkill.add(name);
	}
}
if (ghostInSkill.size > 0) {
	errors.push(
		`Components listed as compound in the skill manifest but NOT compound (or missing) in spec.json:\n` +
			sorted(ghostInSkill)
				.map((name) => `  - ${name}`)
				.join('\n') +
			`\n  Remove from packages/ui/skills/dryui/SKILL.md and packages/mcp/src/component-catalog.ts together.`
	);
}

const missingDocsCoverage = new Set<string>();
for (const name of exportedUiComponents) {
	if (!docsNavComponents.has(name)) {
		missingDocsCoverage.add(name);
	}
}
if (missingDocsCoverage.size > 0) {
	errors.push(
		`Public UI components missing docs navigation coverage in apps/docs/src/lib/nav.ts:\n` +
			sorted(missingDocsCoverage)
				.map((name) => `  - ${name}  (add ui('${name}') to an appropriate docs category)`)
				.join('\n')
	);
}

const docsNavOrphans = new Set<string>();
for (const name of docsNavComponents) {
	if (!exportedUiComponents.has(name)) {
		docsNavOrphans.add(name);
	}
}
if (docsNavOrphans.size > 0) {
	errors.push(
		`Docs navigation references components that are not exported from packages/ui/src/index.ts:\n` +
			sorted(docsNavOrphans)
				.map((name) => `  - ${name}`)
				.join('\n')
	);
}

const bannedStillPublic = BANNED_LAYOUT_COMPONENTS.filter(
	(name) => exportedUiComponents.has(name) || exportedPrimitiveComponents.has(name)
);
if (bannedStillPublic.length > 0) {
	errors.push(
		`Removed layout primitives are still exported publicly:\n` +
			bannedStillPublic.map((name) => `  - ${name}`).join('\n')
	);
}

const guidanceSources = await Promise.all(
	BANNED_GUIDANCE_CHECKS.map((check) => Bun.file(check.path).text())
);
for (let i = 0; i < BANNED_GUIDANCE_CHECKS.length; i++) {
	const check = BANNED_GUIDANCE_CHECKS[i];
	const stalePatterns = check.patterns.filter((pattern) => guidanceSources[i].includes(pattern));
	if (stalePatterns.length > 0) {
		errors.push(
			`Guidance file still references removed layout primitives: ${check.path.replace(repoRoot + '/', '')}\n` +
				stalePatterns.map((pattern) => `  - ${pattern}`).join('\n')
		);
	}
}

if (errors.length > 0) {
	console.error('\n=== Spec Coverage Validation FAILED ===\n');
	for (const error of errors) {
		console.error(error);
		console.error('');
	}
	console.error(
		'Fix the issues above so the public UI surface, generated spec, docs coverage, and guidance all agree on the current DryUI contract.\n'
	);
	process.exit(1);
} else {
	console.log(
		`Spec coverage OK — ${uiComponentDirs.size} UI component directories, ${exportedUiComponents.size} public UI exports, ${specCompounds.size} compound components, and docs/guidance all aligned.`
	);
	process.exit(0);
}
