/**
 * validate-spec-coverage.ts
 *
 * Checks that every public UI component is:
 *   1. Registered in COMPONENT_META (packages/mcp/src/generate-spec.ts)
 *   2. Exported from the public barrel (packages/ui/src/index.ts)
 *   3. If compound, listed in the SKILL.md compound component list
 *   4. Present in the docs nav so the generated docs surface stays discoverable
 *
 * Also flags entries in COMPONENT_META that have no matching directory,
 * compound components in SKILL.md that don't exist in spec.json, removed
 * layout primitives that are still exported, and stale guidance that still
 * suggests those removed primitives.
 *
 * Usage:  bun run scripts/validate-spec-coverage.ts
 * Exit 0 = all clean, Exit 1 = mismatches found.
 */

import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dir, '..');
const uiSrcDir = resolve(repoRoot, 'packages/ui/src');
const generateSpecPath = resolve(repoRoot, 'packages/mcp/src/generate-spec.ts');
const uiIndexPath = resolve(repoRoot, 'packages/ui/src/index.ts');
const primitivesIndexPath = resolve(repoRoot, 'packages/primitives/src/index.ts');
const specJsonPath = resolve(repoRoot, 'packages/mcp/src/spec.json');
const skillMdPath = resolve(repoRoot, 'packages/ui/skills/dryui/SKILL.md');
const docsNavPath = resolve(repoRoot, 'apps/docs/src/lib/nav.ts');

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
		path: resolve(repoRoot, 'packages/feedback/src/layout-mode/output.ts'),
		patterns: ['<Grid>', '<Flex>', '<Stack>', 'DryUI layout primitives']
	},
	{
		path: resolve(repoRoot, 'packages/feedback/src/layout-mode/generated-library.ts'),
		patterns: ["sourceId: 'Grid'", "sourceName: 'Grid'", "label: 'Grid'"]
	},
	{
		path: resolve(repoRoot, 'scripts/dogfood-audit.ts'),
		patterns: ['Flex or Stack', "suggestion: 'Grid'", "suggestion: 'Flex'"]
	}
] as const;

async function getComponentDirs(): Promise<Set<string>> {
	const glob = new Bun.Glob('*/');
	const dirs = new Set<string>();
	for await (const entry of glob.scan({ cwd: uiSrcDir, onlyFiles: false })) {
		const name = entry.replace(/\/$/, '');
		if (!IGNORED_DIRS.has(name)) {
			dirs.add(name);
		}
	}
	return dirs;
}

async function getMetaComponents(): Promise<Set<string>> {
	const src = await Bun.file(generateSpecPath).text();
	const startMarker = 'const COMPONENT_META';
	const startIdx = src.indexOf(startMarker);
	if (startIdx === -1) {
		throw new Error('Could not find COMPONENT_META in generate-spec.ts');
	}

	const eqIdx = src.indexOf('= {', startIdx);
	if (eqIdx === -1) {
		throw new Error('Could not find COMPONENT_META assignment in generate-spec.ts');
	}

	const valueStart = eqIdx + 2;
	let braceDepth = 0;
	let blockStart = -1;
	let blockEnd = -1;
	for (let i = valueStart; i < src.length; i += 1) {
		if (src[i] === '{') {
			if (braceDepth === 0) blockStart = i;
			braceDepth += 1;
		} else if (src[i] === '}') {
			braceDepth -= 1;
			if (braceDepth === 0) {
				blockEnd = i;
				break;
			}
		}
	}

	if (blockStart === -1 || blockEnd === -1) {
		throw new Error('Could not parse COMPONENT_META block boundaries');
	}

	const block = src.slice(blockStart, blockEnd + 1);
	const keyRe = /^\t(\w+)\s*:/gm;
	const names = new Set<string>();
	let match: RegExpExecArray | null;
	while ((match = keyRe.exec(block)) !== null) {
		names.add(match[1]);
	}
	return names;
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

async function getDocsNavComponents(): Promise<Set<string>> {
	const src = await Bun.file(docsNavPath).text();
	const names = new Set<string>();
	const re = /ui\('([^']+)'\)/g;
	let match: RegExpExecArray | null;
	while ((match = re.exec(src)) !== null) {
		names.add(match[1]);
	}
	return names;
}

async function getSpecCompounds(): Promise<Set<string>> {
	const spec = JSON.parse(await Bun.file(specJsonPath).text());
	const names = new Set<string>();
	for (const [name, def] of Object.entries(
		spec.components as Record<string, { compound?: boolean }>
	)) {
		if (def.compound) {
			names.add(name);
		}
	}
	return names;
}

async function getSkillCompounds(): Promise<Set<string>> {
	const src = await Bun.file(skillMdPath).text();
	const match = src.match(/Compound components include ([^.]+)\./);
	if (!match) {
		throw new Error(
			'Could not find "Compound components include ..." sentence in SKILL.md. The validate:spec check requires this exact phrasing.'
		);
	}

	return new Set(
		match[1]
			.replace(/ and /g, ', ')
			.split(',')
			.map((value) => value.trim())
			.filter(Boolean)
	);
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
	componentDirs,
	metaNames,
	exportedDirs,
	exportedUiComponents,
	exportedPrimitiveComponents,
	docsNavComponents,
	specCompounds,
	skillCompounds
] = await Promise.all([
	getComponentDirs(),
	getMetaComponents(),
	getExportedDirs(),
	getExportedComponentNames(uiIndexPath),
	getExportedComponentNames(primitivesIndexPath),
	getDocsNavComponents(),
	getSpecCompounds(),
	getSkillCompounds()
]);

const metaDirsKebab = new Set([...metaNames].map(toKebab));
const errors: string[] = [];

const missingFromMeta = new Set<string>();
for (const dir of componentDirs) {
	if (!metaDirsKebab.has(dir)) {
		missingFromMeta.add(dir);
	}
}
if (missingFromMeta.size > 0) {
	errors.push(
		`Components with a directory in packages/ui/src/ but MISSING from COMPONENT_META in generate-spec.ts:\n` +
			sorted(missingFromMeta)
				.map(
					(dir) =>
						`  - ${dir}  (add ${toPascal(dir)}: { description: '...', category: '...', tags: [...] } to COMPONENT_META)`
				)
				.join('\n')
	);
}

const missingFromIndex = new Set<string>();
for (const dir of componentDirs) {
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
for (const name of metaNames) {
	const kebab = toKebab(name);
	if (!componentDirs.has(kebab)) {
		missingDir.add(name);
	}
}
if (missingDir.size > 0) {
	errors.push(
		`Components in COMPONENT_META but with NO matching directory in packages/ui/src/:\n` +
			sorted(missingDir)
				.map((name) => `  - ${name}  (expected directory: packages/ui/src/${toKebab(name)}/)`)
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
			`\n  Update the "Compound components include ..." sentence in packages/ui/skills/dryui/SKILL.md`
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
		`Components listed as compound in SKILL.md but NOT compound (or missing) in spec.json:\n` +
			sorted(ghostInSkill)
				.map((name) => `  - ${name}`)
				.join('\n') +
			`\n  Remove from the "Compound components include ..." sentence in packages/ui/skills/dryui/SKILL.md`
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
		`Spec coverage OK — ${componentDirs.size} UI component directories, ${exportedUiComponents.size} public UI exports, ${specCompounds.size} compound components, and docs/guidance all aligned.`
	);
	process.exit(0);
}
