// Restores package.json exports from .exports-backup.json after npm pack/publish.
//
// Paired with scripts/prepack-exports.ts. Uses the shared restore helper in
// scripts/lib/export-swap.ts.

import { resolve } from 'node:path';
import { readBackupFile, removeBackupFile, restoreExports } from './lib/export-swap.ts';

const packagePath = resolve(process.cwd(), 'package.json');
const backupPath = resolve(process.cwd(), '.exports-backup.json');

const backup = readBackupFile(backupPath);
if (!backup) {
	console.log('postpack: no .exports-backup.json — nothing to restore');
	process.exit(0);
}

restoreExports(packagePath, backup);
removeBackupFile(backupPath);
console.log('postpack: exports restored to src/ paths');
