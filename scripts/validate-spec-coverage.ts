/**
 * validate-spec-coverage.ts
 *
 * Checks that every UI component directory is:
 *   1. Registered in COMPONENT_META (packages/mcp/src/generate-spec.ts)
 *   2. Exported from the public barrel (packages/ui/src/index.ts)
 *
 * Also flags entries in COMPONENT_META that have no matching directory.
 *
 * Usage:  bun run scripts/validate-spec-coverage.ts
 * Exit 0 = all clean, Exit 1 = mismatches found.
 */

import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Paths (relative to repo root — script must be run from there)
// ---------------------------------------------------------------------------

const repoRoot = resolve(import.meta.dir, '..');
const uiSrcDir = resolve(repoRoot, 'packages/ui/src');
const generateSpecPath = resolve(repoRoot, 'packages/mcp/src/generate-spec.ts');
const indexPath = resolve(repoRoot, 'packages/ui/src/index.ts');

// Directories that live in packages/ui/src/ but are not components.
const IGNORED_DIRS = new Set(['themes', 'internal', 'utils']);

// ---------------------------------------------------------------------------
// 1. Discover component directories
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 2. Extract component names from COMPONENT_META in generate-spec.ts
//
//    Each entry looks like:
//      ComponentName: { description: '...', category: '...', tags: [...] },
//    We grab the leading identifier before the colon.
// ---------------------------------------------------------------------------

async function getMetaComponents(): Promise<Set<string>> {
	const src = await Bun.file(generateSpecPath).text();

	// Isolate the COMPONENT_META block
	const startMarker = 'const COMPONENT_META';
	const startIdx = src.indexOf(startMarker);
	if (startIdx === -1) {
		console.error('ERROR: Could not find COMPONENT_META in generate-spec.ts');
		process.exit(1);
	}

	// Find the `= {` assignment (skip past the type annotation which also contains braces)
	const eqIdx = src.indexOf('= {', startIdx);
	if (eqIdx === -1) {
		console.error('ERROR: Could not find COMPONENT_META assignment in generate-spec.ts');
		process.exit(1);
	}

	// Start brace counting from the `{` in `= {`
	const valueStart = eqIdx + 2; // index of the `{`
	let braceDepth = 0;
	let blockStart = -1;
	let blockEnd = -1;
	for (let i = valueStart; i < src.length; i++) {
		if (src[i] === '{') {
			if (braceDepth === 0) blockStart = i;
			braceDepth++;
		} else if (src[i] === '}') {
			braceDepth--;
			if (braceDepth === 0) {
				blockEnd = i;
				break;
			}
		}
	}

	if (blockStart === -1 || blockEnd === -1) {
		console.error('ERROR: Could not parse COMPONENT_META block boundaries');
		process.exit(1);
	}

	const block = src.slice(blockStart, blockEnd + 1);

	// Match top-level keys:  "\tComponentName: {" (single tab indent)
	const keyRe = /^\t(\w+)\s*:/gm;
	const names = new Set<string>();
	let m: RegExpExecArray | null;
	while ((m = keyRe.exec(block)) !== null) {
		names.add(m[1]);
	}
	return names;
}

// ---------------------------------------------------------------------------
// 3. Extract exported component names from index.ts
//
//    Lines look like:
//      export { Button } from './button/index.js';
//      export { Toast, toastStore, createToastStore } from './toast/index.js';
//    We care about the directory portion of the from path.
// ---------------------------------------------------------------------------

async function getExportedDirs(): Promise<Set<string>> {
	const src = await Bun.file(indexPath).text();
	// Match: from './some-dir/index.js'  — capture the directory name
	const re = /from\s+['"]\.\/([\w-]+)\/index\.js['"]/g;
	const dirs = new Set<string>();
	let m: RegExpExecArray | null;
	while ((m = re.exec(src)) !== null) {
		dirs.add(m[1]);
	}
	return dirs;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert PascalCase to kebab-case: "DatePicker" -> "date-picker" */
function toKebab(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

/** Convert kebab-case to PascalCase: "date-picker" -> "DatePicker" */
function toPascal(name: string): string {
	return name
		.split('-')
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join('');
}

function sorted(s: Set<string>): string[] {
	return [...s].sort();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const [componentDirs, metaNames, exportedDirs] = await Promise.all([
	getComponentDirs(),
	getMetaComponents(),
	getExportedDirs()
]);

// Build a kebab-case set from COMPONENT_META PascalCase names
const metaDirsKebab = new Set([...metaNames].map(toKebab));

const errors: string[] = [];

// --- Components in directories but NOT in COMPONENT_META ---
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
					(d) =>
						`  - ${d}  (add  ${toPascal(d)}: { description: '...', category: '...', tags: [...] }  to COMPONENT_META)`
				)
				.join('\n')
	);
}

// --- Components in directories but NOT exported from index.ts ---
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
					(d) => `  - ${d}  (add  export { ${toPascal(d)} } from './${d}/index.js';  to index.ts)`
				)
				.join('\n')
	);
}

// --- Components in COMPONENT_META but no directory exists ---
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
				.map((n) => `  - ${n}  (expected directory: packages/ui/src/${toKebab(n)}/)`)
				.join('\n')
	);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (errors.length > 0) {
	console.error('\n=== Spec Coverage Validation FAILED ===\n');
	for (const err of errors) {
		console.error(err);
		console.error('');
	}
	console.error(
		'Fix the issues above so every component is registered in COMPONENT_META and exported from index.ts.\n'
	);
	process.exit(1);
} else {
	const count = componentDirs.size;
	console.log(
		`Spec coverage OK — ${count} component directories, all registered in COMPONENT_META and exported from index.ts.`
	);
	process.exit(0);
}
