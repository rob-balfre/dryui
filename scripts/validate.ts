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

async function gitStatus(): Promise<string> {
	const proc = Bun.spawn(['git', 'status', '--porcelain'], {
		cwd: root,
		stdin: 'ignore',
		stdout: 'pipe',
		stderr: 'inherit'
	});
	const out = await new Response(proc.stdout).text();
	const code = await proc.exited;
	if (code !== 0) {
		console.error(`\n✗ git status failed (exit ${code})`);
		process.exit(code);
	}
	return out;
}

const dirtyBefore = await gitStatus();

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
	run(
		'check:lint:unit',
		'bun test packages/lint/src/rules.test.ts packages/lint/src/preprocessor.test.ts'
	),
	run('check:exports', 'bun run scripts/sync-package-exports.ts --check'),
	run('check:cli-imports', `! grep -rnE "from ['\\"]\\.\\./\\.\\./\\.\\./mcp" packages/cli/src`),
	run('check:changeset', 'bun run scripts/check-changeset-required.ts'),
	run('check:interactive-coverage', 'bun run scripts/check-interactive-coverage.ts'),
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
	run('check:agent-contract', 'bun run check:agent-contract'),
	run('check:docs:llms', 'bun run check:docs:llms')
);

// ── Phase 5: Publish-hygiene gate (publint + attw post-swap) ────────────────
// All package builds are done, so we can temporarily apply the prepack swap,
// run publint + attw against the shape npm will see, and restore. This is the
// accurate pre-publish gate — the same check publish-packages.ts runs again
// just before `changeset publish`, but catching it here means contributors
// never hit it during a release.

console.log('\n── Phase 5: publish-hygiene ──');
await run('check:publish-hygiene', 'bun run scripts/check-publish-hygiene.ts --swap');

// ── Drift guard ─────────────────────────────────────────────────────────────
// Catch files the pipeline regenerated that aren't committed. Release refuses
// to run with a dirty worktree, so surfacing drift here (not just on CI) means
// contributors see it locally before pushing.

const dirtyAfter = await gitStatus();
if (dirtyAfter !== dirtyBefore) {
	const beforeLines = new Set(dirtyBefore.split('\n').filter(Boolean));
	const newlyDirty = dirtyAfter.split('\n').filter((line) => line && !beforeLines.has(line));
	if (newlyDirty.length > 0) {
		console.error('\n✗ validate dirtied the worktree. Commit these regenerated files:');
		for (const line of newlyDirty) console.error(`  ${line}`);
		process.exit(1);
	}
}

// ── Summary ─────────────────────────────────────────────────────────────────

const total = performance.now() - start;
console.log(`\n✓ validate passed [${fmt(total)}]`);
