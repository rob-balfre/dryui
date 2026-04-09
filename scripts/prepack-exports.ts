// Rewrites package.json exports from src/ to dist/ paths before npm pack/publish.
// Called by prepack hook. Reversed by postpack-exports.ts.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packagePath = resolve(process.cwd(), 'package.json');
const raw = readFileSync(packagePath, 'utf8');
const pkg = JSON.parse(raw);

if (!pkg.publishConfig?.exports) {
	console.log('No publishConfig.exports — skipping prepack rewrite');
	process.exit(0);
}

// Save original exports for postpack restore
const backup = { exports: pkg.exports, svelte: pkg.svelte, types: pkg.types };
writeFileSync(resolve(process.cwd(), '.exports-backup.json'), JSON.stringify(backup));

// Apply publishConfig overrides
pkg.exports = pkg.publishConfig.exports;
if (pkg.publishConfig.svelte) pkg.svelte = pkg.publishConfig.svelte;
if (pkg.publishConfig.types) pkg.types = pkg.publishConfig.types;

writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
console.log('prepack: exports rewritten to dist/ paths');
