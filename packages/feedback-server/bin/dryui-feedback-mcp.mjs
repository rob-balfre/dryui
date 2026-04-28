#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dev = process.env.DRYUI_DEV === '1' || process.env.DRYUI_DEV === 'true';
const srcEntry = resolve(here, '..', 'src', 'mcp.ts');
const distEntry = resolve(here, '..', 'dist', 'mcp.js');

if (dev && existsSync(srcEntry)) {
	const child = spawn('bun', ['run', srcEntry, ...process.argv.slice(2)], {
		stdio: 'inherit',
		env: process.env
	});
	child.on('exit', (code, signal) => {
		if (signal) process.kill(process.pid, signal);
		else process.exit(code ?? 0);
	});
} else {
	await import(distEntry);
}
