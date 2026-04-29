/**
 * dev-link.ts — make the workspace's cli/mcp/feedback-server bins globally
 * available via `bun link`, so `dryui`, `dryui-mcp`, and `dryui-feedback-mcp`
 * resolve to the local repo. Combined with `DRYUI_DEV=1` in the consuming
 * shell or editor MCP config, those bins forward to the live TypeScript
 * source instead of dist/, giving "latest code on every invocation" without
 * rebuilds or npm publish.
 *
 * Usage:
 *   bun run dev:link        # link all three
 *   bun run dev:link --check
 *   bun run dev:unlink      # remove the global symlinks
 */

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const LINK_TARGETS = [
	{ pkg: '@dryui/cli', dir: 'packages/cli', bin: 'dryui' },
	{ pkg: '@dryui/mcp', dir: 'packages/mcp', bin: 'dryui-mcp' },
	{ pkg: '@dryui/feedback-server', dir: 'packages/feedback-server', bin: 'dryui-feedback-mcp' },
	{ pkg: '@dryui/feedback', dir: 'packages/feedback', bin: null },
	{ pkg: '@dryui/lint', dir: 'packages/lint', bin: null },
	{ pkg: '@dryui/ui', dir: 'packages/ui', bin: null },
	{ pkg: '@dryui/primitives', dir: 'packages/primitives', bin: null }
] as const;

function bunLink(cwd: string, args: readonly string[] = []): boolean {
	const result = spawnSync('bun', ['link', ...args], { cwd, stdio: 'inherit' });
	return result.status === 0;
}

function bunUnlink(cwd: string): boolean {
	const result = spawnSync('bun', ['unlink'], { cwd, stdio: 'inherit' });
	return result.status === 0;
}

function unlink(): void {
	console.log('dev-link: removing global symlinks');
	for (const target of LINK_TARGETS) {
		const cwd = resolve(REPO_ROOT, target.dir);
		const ok = bunUnlink(cwd);
		console.log(`  ${ok ? '✓' : '✗'} ${target.pkg}`);
	}
}

function link(): void {
	console.log('dev-link: registering workspace packages globally');
	for (const target of LINK_TARGETS) {
		const cwd = resolve(REPO_ROOT, target.dir);
		const registered = bunLink(cwd);
		const arrow = target.bin ? ` → ${target.bin}` : '';
		console.log(`  ${registered ? '✓' : '✗'} ${target.pkg}${arrow}`);
	}
	console.log('');
	console.log(
		'Bins (cli/mcp/feedback-mcp) are now on PATH via ~/.bun/install/global/node_modules/.bin.'
	);
	console.log('Set DRYUI_DEV=1 in your shell or editor MCP config to run from src.');
	console.log('Without DRYUI_DEV the bins still load dist/ (matches published behaviour).');
	console.log('');
	console.log('@dryui/feedback uses the package.json "development" exports condition,');
	console.log('so Vite/SvelteKit dev servers automatically resolve it from src/.');
	console.log('');
	console.log('To consume a workspace package in another local project, run from there:');
	for (const target of LINK_TARGETS) {
		console.log(`  bun link ${target.pkg}`);
	}
}

const mode = process.argv[2];
if (mode === '--unlink' || process.env['npm_lifecycle_event'] === 'dev:unlink') {
	unlink();
} else {
	link();
}
