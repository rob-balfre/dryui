import { resolve, relative } from 'node:path';
import {
	cleanPackageSrcDeclarations,
	collectPackageSrcDeclarations,
	formatDeclarationList
} from './lib/generated-declarations.ts';

const root = resolve(import.meta.dir, '..');
const args = process.argv.slice(2);

async function runPackageSrcDeclarationMode(mode: 'check' | 'clean'): Promise<void> {
	const scan =
		mode === 'clean'
			? await cleanPackageSrcDeclarations({ repoRoot: root })
			: await collectPackageSrcDeclarations({ repoRoot: root });

	if (scan.unexpected.length > 0) {
		console.error('\nUnexpected untracked .d.ts files found in package src directories:');
		for (const line of formatDeclarationList(scan.unexpected)) {
			console.error(line);
		}
		console.error(
			'\nTrack these files deliberately or move them out of package src before building.'
		);
		process.exit(1);
	}

	if (mode === 'check' && scan.generated.length > 0) {
		console.error('\nGenerated .d.ts files found in package src directories:');
		for (const line of formatDeclarationList(scan.generated)) {
			console.error(line);
		}
		console.error('\nRun `bun run clean:package-src-declarations` before package builds.');
		process.exit(1);
	}

	if (mode === 'clean') {
		console.log(`cleaned generated package src declarations (${scan.generated.length})`);
	} else {
		console.log('no generated package src declarations found');
	}
}

if (args[0] === '--check-package-src-declarations') {
	await runPackageSrcDeclarationMode('check');
	process.exit(0);
}

if (args[0] === '--clean-package-src-declarations') {
	await runPackageSrcDeclarationMode('clean');
	process.exit(0);
}

const [command, ...files] = args;

if (!command || files.length === 0) {
	console.error(
		'Usage: bun run scripts/check-generated-files.ts "<command>" <file> [file...]\n' +
			'       bun run scripts/check-generated-files.ts --check-package-src-declarations\n' +
			'       bun run scripts/check-generated-files.ts --clean-package-src-declarations'
	);
	process.exit(1);
}

async function snapshot(path: string): Promise<Buffer | null> {
	try {
		return Buffer.from(await Bun.file(path).arrayBuffer());
	} catch {
		return null;
	}
}

function changed(a: Buffer | null, b: Buffer | null): boolean {
	if (a === null || b === null) return a !== b;
	return Buffer.compare(a, b) !== 0;
}

const targets = files.map((path) => resolve(root, path));
const before = await Promise.all(targets.map(snapshot));

const proc = Bun.spawn(['sh', '-c', command], {
	cwd: root,
	stdin: 'inherit',
	stdout: 'inherit',
	stderr: 'inherit',
	env: process.env
});

const code = await proc.exited;
if (code !== 0) {
	process.exit(code);
}

const after = await Promise.all(targets.map(snapshot));
const drifted = targets.filter((_, index) => changed(before[index], after[index]));

if (drifted.length > 0) {
	console.error('\nGenerated files changed during the check:');
	for (const path of drifted) {
		console.error(`  - ${relative(root, path)}`);
	}
	process.exit(1);
}

console.log(`generated files up to date (${targets.length})`);
