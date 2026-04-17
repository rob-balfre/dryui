import { readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const changesetDir = resolve(repoRoot, '.changeset');

const dryRun = process.argv.includes('--dry-run');
const allowDirty = process.argv.includes('--allow-dirty');

if (allowDirty && !dryRun) {
	console.error('release-ci: --allow-dirty is only supported together with --dry-run');
	process.exit(1);
}

function run(command: string, options: { capture?: boolean } = {}): string {
	console.log(`release-ci: ${command}`);

	if (options.capture) {
		return execSync(command, {
			cwd: repoRoot,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe']
		}).trim();
	}

	execSync(command, {
		cwd: repoRoot,
		stdio: 'inherit'
	});

	return '';
}

function getPendingChangesets(): string[] {
	return readdirSync(changesetDir)
		.filter((entry) => entry.endsWith('.md') && entry !== 'README.md')
		.sort();
}

function ensureCleanWorktree(): void {
	const status = run('git status --short', { capture: true });
	if (!status) return;

	console.error('release-ci: refusing to run with a dirty worktree');
	console.error(status);
	process.exit(1);
}

if (!allowDirty) ensureCleanWorktree();

const pendingChangesets = getPendingChangesets();

if (pendingChangesets.length > 0) {
	console.log(`release-ci: found ${pendingChangesets.length} pending changeset(s)`);
	for (const entry of pendingChangesets) {
		console.log(`  - ${entry}`);
	}

	run('bun run version');

	const versionedFiles = run('git status --short', { capture: true });
	if (!versionedFiles) {
		console.log('release-ci: version step produced no tracked changes');
	} else {
		console.log('release-ci: versioned files');
		console.log(versionedFiles);
	}

	if (dryRun) {
		console.log('release-ci: --dry-run set, skipping commit/publish/push');
		process.exit(0);
	}

	if (versionedFiles) {
		run('git config user.name "github-actions[bot]"');
		run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
		run('git add -A');
		run('git commit -m "chore: version packages"');
		run('git push origin HEAD:main');
	}
} else {
	console.log('release-ci: no pending changesets found');

	if (dryRun) {
		console.log('release-ci: nothing to version in dry-run mode');
		process.exit(0);
	}
}

run('bun run publish:packages');
run('git push origin --follow-tags');
