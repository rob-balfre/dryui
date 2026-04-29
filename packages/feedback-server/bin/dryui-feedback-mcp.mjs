#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const srcEntry = resolve(here, '..', 'src', 'mcp.ts');
const distEntry = resolve(here, '..', 'dist', 'mcp.js');

// Source-mode auto-detect: see packages/cli/bin/dryui.mjs for rationale.
const flag = process.env.DRYUI_DEV;
const explicitDev = flag === '1' || flag === 'true';
const explicitlyOff = flag === '0' || flag === 'false';
const repoRoot = resolve(here, '..', '..', '..');
const looksLinkedToWorkspace =
	existsSync(srcEntry) &&
	existsSync(resolve(repoRoot, 'packages', 'feedback-server', 'package.json')) &&
	existsSync(resolve(repoRoot, '.git'));

const dev = explicitDev || (!explicitlyOff && looksLinkedToWorkspace);

if (dev && existsSync(srcEntry)) {
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
