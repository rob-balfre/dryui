import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Wire `core.hooksPath` to the repo-checked-in hooks in `.githooks/` so
// every clone gets the pre-commit spec/contract regen + the pre-push
// changeset gate without a manual setup step.

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');

// Only wire hooks inside an actual git working tree. `bun install` inside
// a tarball extract (e.g. during publishing) has no `.git` directory.
if (!existsSync(resolve(repoRoot, '.git'))) {
	process.exit(0);
}

try {
	const current = execSync('git config --get core.hooksPath', {
		cwd: repoRoot,
		encoding: 'utf8'
	}).trim();
	if (current === '.githooks') process.exit(0);
} catch {
	// `git config --get` exits non-zero when unset, which is the common case.
}

execSync('git config core.hooksPath .githooks', { cwd: repoRoot, stdio: 'inherit' });
console.log('install-hooks: wired core.hooksPath → .githooks');
