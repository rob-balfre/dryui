import { $ } from 'bun';

const root = new URL('../', import.meta.url);
const excludedSegments: string[] = [];
const bunTestArgs = process.argv.slice(2);

await $`bun run --filter '@dryui/mcp' generate-spec`.cwd(root.pathname);

const files: string[] = [];
const globs = [
	new Bun.Glob('tests/unit/**/*.test.ts'),
	new Bun.Glob('packages/feedback-server/tests/**/*.test.ts')
];

for (const glob of globs) {
	for await (const file of glob.scan({ cwd: root.pathname })) {
		const normalized = `/${file}`;
		if (excludedSegments.some((segment) => normalized.includes(segment))) {
			continue;
		}

		files.push(file);
	}
}

files.sort();

if (files.length === 0) {
	throw new Error('No unit tests matched the supported test suite.');
}

const proc = Bun.spawn(['bun', 'test', ...bunTestArgs, ...files], {
	cwd: root.pathname,
	stdin: 'inherit',
	stdout: 'inherit',
	stderr: 'inherit'
});

process.exit(await proc.exited);
