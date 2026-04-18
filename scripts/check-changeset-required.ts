import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const changesetDir = resolve(repoRoot, '.changeset');
const configPath = resolve(changesetDir, 'config.json');

interface ChangesetConfig {
	ignore?: string[];
}

function sh(command: string): string {
	return execSync(command, { cwd: repoRoot, encoding: 'utf8' }).trim();
}

function findLastReleaseSha(): string {
	const sha = sh('git log --grep="^chore: version packages" -n 1 --pretty=format:%H');
	if (!sha) {
		console.error('check-changeset-required: no prior "chore: version packages" commit found');
		process.exit(1);
	}
	return sha;
}

function getChangedFiles(baseSha: string): string[] {
	const output = sh(`git diff --name-only ${baseSha}..HEAD`);
	return output ? output.split('\n') : [];
}

function getPackageRootFromPath(path: string): string | null {
	const match = path.match(/^packages\/([^/]+)\//);
	return match ? match[1]! : null;
}

function getPackageName(packageRoot: string): string | null {
	try {
		const pkg = JSON.parse(
			readFileSync(resolve(repoRoot, 'packages', packageRoot, 'package.json'), 'utf8')
		) as { name?: string; private?: boolean };
		if (pkg.private) return null;
		return pkg.name ?? null;
	} catch {
		return null;
	}
}

function getPendingChangesets(): string[] {
	return readdirSync(changesetDir).filter(
		(entry) => entry.endsWith('.md') && entry !== 'README.md'
	);
}

const config = JSON.parse(readFileSync(configPath, 'utf8')) as ChangesetConfig;
const ignored = new Set(config.ignore ?? []);

const baseSha = findLastReleaseSha();
const changedFiles = getChangedFiles(baseSha);

const touchedPackages = new Set<string>();
for (const file of changedFiles) {
	const root = getPackageRootFromPath(file);
	if (!root) continue;
	const name = getPackageName(root);
	if (!name) continue;
	if (ignored.has(name)) continue;
	touchedPackages.add(name);
}

if (touchedPackages.size === 0) {
	console.log('check-changeset-required: no publishable package changes since last release');
	process.exit(0);
}

const pending = getPendingChangesets();
if (pending.length > 0) {
	console.log(
		`check-changeset-required: ${pending.length} pending changeset(s) cover the following packages:`
	);
	for (const name of [...touchedPackages].sort()) console.log(`  - ${name}`);
	process.exit(0);
}

console.error(
	`check-changeset-required: ${touchedPackages.size} publishable package(s) changed since ${baseSha.slice(0, 8)} but no changeset is staged.`
);
for (const name of [...touchedPackages].sort()) console.error(`  - ${name}`);
console.error('');
console.error('Run `bun run changeset` and commit the generated `.changeset/*.md` file.');
process.exit(1);
