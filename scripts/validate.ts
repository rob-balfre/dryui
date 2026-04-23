/**
 * validate.ts — Parallel validate pipeline
 *
 * Runs all validation steps (lint, build, check, test) with maximum parallelism
 * based on the actual dependency graph. Eliminates redundant spec generation
 * that the sequential pipeline repeated 3-4x.
 *
 * Usage:  bun run scripts/validate.ts
 *         bun run scripts/validate.ts --no-test                  (skip browser tests)
 *         bun run scripts/validate.ts --skip-publish-hygiene     (skip publish-hygiene)
 */

const root = new URL('../', import.meta.url).pathname;
const start = performance.now();
const skipTests = process.argv.includes('--no-test');
const skipPublishHygiene = process.argv.includes('--skip-publish-hygiene');

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

// ── Phase 0: Package source declaration hygiene ────────────────────────────
// svelte-package can leave ignored .d.ts files in package src trees. Clean them
// before any package build so stale local artifacts cannot affect package output.

console.log('\n── Phase 0: package declaration hygiene ──');
await run('clean:package-src-declarations', 'bun run clean:package-src-declarations');

// ── Phase 1: Independent checks + first builds (parallel) ───────────────────
// lint & primitives have no deps; quick checks have no deps

console.log('\n── Phase 1: checks + lint/primitives builds ──');
await parallel(
	run(
		'check:lint:unit',
		'bun test packages/lint/src/rules.test.ts packages/lint/src/preprocessor.test.ts'
	),
	run('check:lint:violations', 'bun run check:lint:violations'),
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
await run('clean:package-src-declarations', 'bun run clean:package-src-declarations');
await run('build:ui', 'bun run build', pkg('ui'));

// ── Phase 3: Builds + checks that only need ui (parallel) ──────────────────
// MCP, feedback, and theme-wizard depend on ui but not each other.
// svelte-check on primitives + ui can also run here.

console.log('\n── Phase 3: build mcp/feedback/feedback-server/theme-wizard + check packages ──');
await run('clean:package-src-declarations', 'bun run clean:package-src-declarations');

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
await run('clean:package-src-declarations', 'bun run clean:package-src-declarations');

// ── Phase 4: Docs build + type checks (parallel) ───────────────────────────
// docs:check needs .svelte-kit/ types from the docs build, so it runs after.
// All other checks here only need the package builds from earlier phases.

console.log('\n── Phase 4: docs build + type checks ──');
await parallel(
	// docs:build then docs:check sequentially (check needs .svelte-kit/ types)
	run('build:docs', 'bun run docs:build').then(() => run('check:docs', 'bun run docs:check')),
	run('build:cli', 'bun run build', pkg('cli')),
	run('check:mcp', 'bun run check:mcp'),
	run('check:cli', 'bun run check:cli:types')
);

// ── Phase 5: Generated artifact drift checks ───────────────────────────────
// Keep these serial because they share generated MCP source files such as
// spec.json. Serial checks make stale architecture/contract/llms drift fail at
// the specific generated-file gate instead of later in the final worktree guard.

console.log('\n── Phase 5: generated artifact drift checks ──');
await run('check:architecture', 'bun run check:architecture');
await run('check:contract', 'bun run check:contract');
await run('check:agent-contract', 'bun run check:agent-contract');
await run('check:docs:llms', 'bun run check:docs:llms');

// ── Phase 6: Publish-hygiene gate (publint + attw post-swap) ────────────────
// All package builds are done, so we can temporarily apply the prepack swap,
// run publint + attw against the shape npm will see, and restore. This is the
// accurate pre-publish gate — the same check publish-packages.ts runs again
// just before `changeset publish`, but catching it here means contributors
// never hit it during a release.

console.log('\n── Phase 6: publish-hygiene ──');
if (skipPublishHygiene) {
	console.log('publish-hygiene skipped');
} else {
	await run('check:publish-hygiene', 'bun run scripts/check-publish-hygiene.ts --swap');
}

// ── Phase 7: Benchmark smoke lane ───────────────────────────────────────────
// No LLM calls — only validates task manifests and runs the deterministic
// CLI/tool checks. The full live lane runs nightly with DRYUI_BENCHMARK_LIVE=1.

console.log('\n── Phase 7: benchmark smoke ──');
await run('bench:smoke', 'bun run scripts/benchmark/run.ts --smoke');

// ── Phase 8: Generated-skill sync drift ─────────────────────────────────────
// sync:skills rewrites packages/plugin/skills/** and .cursor/rules/** from
// packages/ui/skills, etc. Running it here ensures the drift guard below
// catches any edit made directly to a generated copy.

console.log('\n── Phase 8: sync:skills drift guard ──');
await run('sync:skills', 'bun run sync:skills');

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
