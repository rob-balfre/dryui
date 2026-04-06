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
const app = (name: string) => `${root}apps/${name}`;

// ── Phase 1: Independent checks + first builds (parallel) ───────────────────
// lint & primitives have no deps; quick checks have no deps

console.log('\n── Phase 1: checks + lint/primitives builds ──');
await parallel(
	run('check:lint', 'bun test tests/unit/lint-rules.test.ts tests/unit/lint-preprocessor.test.ts'),
	run('check:exports', 'bun run scripts/sync-package-exports.ts --check'),
	run('validate:spec', 'bun run scripts/validate-spec-coverage.ts'),
	run('build:lint', 'bun run build', pkg('lint')),
	run('build:primitives', 'bun run build', pkg('primitives'))
);

// ── Phase 2: Build UI (depends on primitives) ───────────────────────────────

console.log('\n── Phase 2: build ui ──');
await run('build:ui', 'bun run build', pkg('ui'));

// ── Phase 3: Builds + checks that only need ui (parallel) ──────────────────
// MCP and theme-wizard depend on ui but not each other.
// svelte-check on primitives + ui can also run here.

console.log('\n── Phase 3: build mcp/theme-wizard + check packages ──');

const phase3Tasks: Promise<TaskResult>[] = [
	run(
		'build:mcp',
		[
			'bun src/generate-spec.ts',
			'(bun src/generate-architecture.ts & bun src/generate-contract.ts & bun src/generate-llms-txt.ts & wait)',
			'mkdir -p dist',
			'cp src/spec.json src/architecture.json src/contract.v1.json src/contract.v1.schema.json dist/',
			'bun build src/index.ts src/architecture.ts src/reviewer.ts src/theme-checker.ts src/utils.ts src/project-planner.ts src/workspace-audit.ts src/spec-types.ts src/spec-formatters.ts src/composition-data.ts --outdir dist --root src --target node',
			'bunx tsc -p tsconfig.build.json'
		].join(' && '),
		pkg('mcp')
	),
	run('build:theme-wizard', 'bun run build', `${root}packages/theme-wizard`),
	run('check:primitives', 'bun run check', pkg('primitives')),
	run('check:ui', 'bun run check', pkg('ui'))
];

if (!skipTests) {
	phase3Tasks.push(run('test:browser', 'bunx vitest --browser --run tests/browser'));
}

await parallel(...phase3Tasks);

// ── Phase 4: Docs build + remaining checks (parallel) ─────────────────────
// check:docs needs .svelte-kit/ types from the vite build, so it runs after.
// All other checks only need built packages and can run alongside the build.

console.log('\n── Phase 4: docs build + remaining checks ──');
await parallel(
	// build:docs then check:docs sequentially (check needs .svelte-kit/ types)
	run('build:docs', 'bunx --bun vite build', app('docs')).then(() =>
		run('check:docs', 'bun run check', app('docs'))
	),
	run('build:cli', 'bun build src/index.ts --outdir dist --target node', pkg('cli')),
	run('check:mcp', 'bunx tsc -p packages/mcp/tsconfig.json --noEmit'),
	run('check:cli', 'bunx tsc -p packages/cli/tsconfig.json --noEmit'),
	run(
		'check:contract',
		'git diff --exit-code -- packages/mcp/src/spec.json packages/mcp/src/contract.v1.json packages/mcp/src/contract.v1.schema.json'
	),
	run(
		'check:docs:llms',
		'git diff --exit-code -- apps/docs/static/llms.txt apps/docs/static/llms-components.txt'
	),
);

// ── Summary ─────────────────────────────────────────────────────────────────

const total = performance.now() - start;
console.log(`\n✓ validate passed [${fmt(total)}]`);
