#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const srcEntry = resolve(here, '..', 'src', 'index.ts');
const distEntry = resolve(here, '..', 'dist', 'index.js');

// Source-mode auto-detect: when this bin lives inside the DryUI workspace
// (reached via `bun link` from packages/cli), run straight from `src/` so
// edits flow through with no rebuild. Published tarballs don't ship src nor
// the surrounding workspace, so the markers below stay false there and dist
// keeps winning. `DRYUI_DEV=1` forces source mode; `DRYUI_DEV=0` forces dist.
const flag = process.env.DRYUI_DEV;
const explicitDev = flag === '1' || flag === 'true';
const explicitlyOff = flag === '0' || flag === 'false';
const repoRoot = resolve(here, '..', '..', '..');
const looksLinkedToWorkspace =
	existsSync(srcEntry) &&
	existsSync(resolve(repoRoot, 'packages', 'cli', 'package.json')) &&
	existsSync(resolve(repoRoot, '.git'));

const dev = explicitDev || (!explicitlyOff && looksLinkedToWorkspace);

if (dev && existsSync(srcEntry)) {
	// Propagate DRYUI_DEV=1 so downstream code (launcher override swap, dev
	// banner, etc.) sees source mode even when the bin auto-detected it from
	// the workspace markers rather than receiving it explicitly.
	const child = spawn('bun', ['run', srcEntry, ...process.argv.slice(2)], {
		stdio: 'inherit',
		env: { ...process.env, DRYUI_DEV: '1' }
	});
	child.on('exit', (code, signal) => {
		if (signal) process.kill(process.pid, signal);
		else process.exit(code ?? 0);
	});
} else {
	await import(distEntry);
}
