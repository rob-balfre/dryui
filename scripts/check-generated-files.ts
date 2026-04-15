import { resolve, relative } from 'node:path';

const root = resolve(import.meta.dir, '..');
const [command, ...files] = process.argv.slice(2);

if (!command || files.length === 0) {
	console.error('Usage: bun run scripts/check-generated-files.ts "<command>" <file> [file...]');
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
