// Rewrites package.json exports from src/ to dist/ paths before npm pack/publish.
// Called by prepack hook (packages/ui, packages/primitives). Reversed by postpack-exports.ts.
//
// Swap logic lives in scripts/lib/export-swap.ts and is shared with scripts/publish.ts.

import { resolve } from 'node:path';
import { swapExportsForPublish, writeBackupFile } from './lib/export-swap.ts';

const packagePath = resolve(process.cwd(), 'package.json');
const backupPath = resolve(process.cwd(), '.exports-backup.json');

const backup = swapExportsForPublish(packagePath);

if (!backup.swapped) {
	console.log('prepack: no publishConfig.exports and no workspace:* deps — nothing to swap');
	process.exit(0);
}

writeBackupFile(backupPath, backup);
console.log('prepack: exports rewritten to dist/ paths');
