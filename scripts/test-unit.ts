import { $ } from 'bun';

const root = new URL('../', import.meta.url);
const bunTestArgs = process.argv.slice(2);

const suiteGlobs = [
	'tests/unit/**/*.test.ts',
	'packages/cli/src/__tests__/*.test.ts',
	'packages/feedback-server/tests/**/*.test.ts',
	'packages/lint/src/*.test.ts',
	'packages/mcp/src/**/*.test.ts',
	'packages/theme-wizard/src/engine/*.test.ts'
];

await $`bun run --filter '@dryui/mcp' generate-spec`.cwd(root.pathname);

const files = new Set<string>();
const globs = suiteGlobs.map((pattern) => new Bun.Glob(pattern));

for (const glob of globs) {
	for await (const file of glob.scan({ cwd: root.pathname })) {
		files.add(file);
	}
}

const sortedFiles = [...files].sort();

if (sortedFiles.length === 0) {
	throw new Error('No unit tests matched the supported test suite.');
}

const proc = Bun.spawn(['bun', 'test', ...bunTestArgs, ...sortedFiles], {
	cwd: root.pathname,
	stdin: 'inherit',
	stdout: 'inherit',
	stderr: 'inherit'
});

process.exit(await proc.exited);
