// Restores package.json exports from .exports-backup.json after npm pack/publish.

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const packagePath = resolve(process.cwd(), 'package.json');
const backupPath = resolve(process.cwd(), '.exports-backup.json');

if (!existsSync(backupPath)) {
	console.log('No .exports-backup.json — skipping postpack restore');
	process.exit(0);
}

const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
const backup = JSON.parse(readFileSync(backupPath, 'utf8'));

pkg.exports = backup.exports;
if (backup.svelte !== undefined) pkg.svelte = backup.svelte;
if (backup.types !== undefined) pkg.types = backup.types;

writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
unlinkSync(backupPath);
console.log('postpack: exports restored to src/ paths');
