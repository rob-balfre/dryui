/**
 * validate.ts — Parallel validate pipeline
 *
 * Runs all validation steps (lint, build, check, test) with maximum parallelism
 * based on the actual dependency graph. Eliminates redundant spec generation
 * that the sequential pipeline repeated 3-4x.
 *
 * Usage:  bun run scripts/validate.ts
 *         bun run scripts/validate.ts --no-test   (skip browser tests)
 */

const root = new URL('../', import.meta.url).pathname;
const start = performance.now();
const skipTests = process.argv.includes('--no-test');

// ── Helpers ──────────────────────────────────────────────────────────────────

type TaskResult = { name: string; ms: number };

async function run(name: string, cmd: string, cwd: string = root): Promise<TaskResult> {
	const t0 = performance.now();
	const proc = Bun.spawn(['sh', '-c', cmd], {
		cwd,
		stdin: 'inherit',
		stdout: 'inherit',
		stderr: 'inherit',
		env: process.env
	});
	const code = await proc.exited;
	const ms = performance.now() - t0;
	if (code !== 0) {
		console.error(`\n✗ ${name} failed (exit ${code}) [${fmt(ms)}]`);
		process.exit(code);
	}
	console.log(`✓ ${name} [${fmt(ms)}]`);
	return { name, ms };
}

function fmt(ms: number): string {
	return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

async function parallel(...tasks: Promise<TaskResult>[]): Promise<TaskResult[]> {
	return Promise.all(tasks);
}

// Package directories
const pkg = (name: string) => `${root}packages/${name}`;

// ── Phase 1: Independent checks + first builds (parallel) ───────────────────
// lint & primitives have no deps; quick checks have no deps

console.log('\n── Phase 1: checks + lint/primitives builds ──');
await parallel(
	run('check:lint', 'bun test tests/unit/lint-rules.test.ts tests/unit/lint-preprocessor.test.ts'),
	run('check:exports', 'bun run scripts/sync-package-exports.ts --check'),
	run('check:cli-imports', `! grep -rnE "from ['\\"]\\.\\./\\.\\./\\.\\./mcp" packages/cli/src`),
	run('validate:spec', 'bun run scripts/validate-spec-coverage.ts'),
	run('build:lint', 'bun run build', pkg('lint')),
	run('build:primitives', 'bun run build', pkg('primitives'))
);

// ── Phase 2: Build UI (depends on primitives) ───────────────────────────────

console.log('\n── Phase 2: build ui ──');
await run('build:ui', 'bun run build', pkg('ui'));

// ── Phase 3: Builds + checks that only need ui (parallel) ──────────────────
// MCP, feedback, and theme-wizard depend on ui but not each other.
// svelte-check on primitives + ui can also run here.

console.log('\n── Phase 3: build mcp/feedback/feedback-server/theme-wizard + check packages ──');

const phase3Tasks: Promise<TaskResult>[] = [
	run('build:mcp', 'bun run build', pkg('mcp')),
	run('build:feedback', 'bun run build', pkg('feedback')),
	run('build:feedback-server', 'bun run build', pkg('feedback-server')),
	run('build:theme-wizard', 'bun run build', pkg('theme-wizard')),
	run('check:primitives', 'bun run check', pkg('primitives')),
	run('check:ui', 'bun run check', pkg('ui'))
];

if (!skipTests) {
	phase3Tasks.push(run('test:browser', 'bunx vitest --browser --run tests/browser'));
}

await parallel(...phase3Tasks);

// ── Phase 4: Docs build + remaining checks (parallel) ─────────────────────
// docs:check needs .svelte-kit/ types from the docs build, so it runs after.
// All other checks only need the package builds from earlier phases.

console.log('\n── Phase 4: docs build + remaining checks ──');
await parallel(
	// docs:build then docs:check sequentially (check needs .svelte-kit/ types)
	run('build:docs', 'bun run docs:build').then(() => run('check:docs', 'bun run docs:check')),
	run('build:cli', 'bun run build', pkg('cli')),
	run('check:mcp', 'bun run check:mcp'),
	run('check:cli', 'bun run check:cli:types'),
	run('check:contract', 'bun run check:contract'),
	run('check:docs:llms', 'bun run check:docs:llms')
);

// ── Summary ─────────────────────────────────────────────────────────────────

const total = performance.now() - start;
console.log(`\n✓ validate passed [${fmt(total)}]`);
