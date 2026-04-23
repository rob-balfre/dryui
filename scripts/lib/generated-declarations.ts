import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

export type PackageSrcDeclarationScan = {
	generated: string[];
	tracked: string[];
	unexpected: string[];
};

export type PackageSrcDeclarationOptions = {
	repoRoot?: string;
	trackedPaths?: Iterable<string>;
	ignoredPaths?: Iterable<string>;
};

const defaultRepoRoot = resolve(import.meta.dir, '../..');

function toPosix(path: string): string {
	return path.split(sep).join('/');
}

function normalizeRepoPath(path: string): string {
	return path.replaceAll('\\', '/').replace(/^\.\/+/, '');
}

function repoPath(repoRoot: string, path: string): string {
	return normalizeRepoPath(toPosix(relative(repoRoot, path)));
}

function isPackageSrcDeclaration(path: string): boolean {
	return /^packages\/[^/]+\/src\/.+\.d\.ts$/u.test(normalizeRepoPath(path));
}

function gitList(repoRoot: string, args: string[]): string[] {
	const result = spawnSync('git', args, {
		cwd: repoRoot,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	});

	if (result.status !== 0) {
		throw new Error((result.stderr || `git ${args.join(' ')} failed`).trim());
	}

	return result.stdout
		.split('\0')
		.map(normalizeRepoPath)
		.filter((path) => path && isPackageSrcDeclaration(path));
}

async function walkDeclarations(dir: string, repoRoot: string, out: string[]): Promise<void> {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			await walkDeclarations(path, repoRoot, out);
		} else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
			out.push(repoPath(repoRoot, path));
		}
	}
}

async function listPackageSrcDeclarations(repoRoot: string): Promise<string[]> {
	const packagesDir = join(repoRoot, 'packages');
	if (!existsSync(packagesDir)) return [];

	const paths: string[] = [];
	for (const entry of await readdir(packagesDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;

		const srcDir = join(packagesDir, entry.name, 'src');
		if (existsSync(srcDir)) {
			await walkDeclarations(srcDir, repoRoot, paths);
		}
	}

	return paths.sort((left, right) => left.localeCompare(right));
}

function pathSet(paths: Iterable<string> | undefined): Set<string> | null {
	if (!paths) return null;
	return new Set([...paths].map(normalizeRepoPath).filter(isPackageSrcDeclaration));
}

export async function collectPackageSrcDeclarations(
	options: PackageSrcDeclarationOptions = {}
): Promise<PackageSrcDeclarationScan> {
	const repoRoot = resolve(options.repoRoot ?? defaultRepoRoot);
	const tracked =
		pathSet(options.trackedPaths) ??
		new Set(gitList(repoRoot, ['ls-files', '-z', '--', 'packages']));
	const ignored =
		pathSet(options.ignoredPaths) ??
		new Set(
			gitList(repoRoot, [
				'ls-files',
				'-z',
				'--others',
				'--ignored',
				'--exclude-standard',
				'--',
				'packages'
			])
		);

	const scan: PackageSrcDeclarationScan = {
		generated: [],
		tracked: [],
		unexpected: []
	};

	for (const path of await listPackageSrcDeclarations(repoRoot)) {
		if (tracked.has(path)) {
			scan.tracked.push(path);
		} else if (ignored.has(path)) {
			scan.generated.push(path);
		} else {
			scan.unexpected.push(path);
		}
	}

	return scan;
}

export async function cleanPackageSrcDeclarations(
	options: PackageSrcDeclarationOptions = {}
): Promise<PackageSrcDeclarationScan> {
	const repoRoot = resolve(options.repoRoot ?? defaultRepoRoot);
	const scan = await collectPackageSrcDeclarations({ ...options, repoRoot });

	if (scan.unexpected.length > 0) {
		return scan;
	}

	for (const path of scan.generated) {
		await rm(resolve(repoRoot, path), { force: true });
	}

	return scan;
}

export function formatDeclarationList(paths: string[], limit = 50): string[] {
	if (paths.length <= limit) return paths.map((path) => `  - ${path}`);

	const shown = paths.slice(0, limit).map((path) => `  - ${path}`);
	shown.push(`  ... ${paths.length - limit} more`);
	return shown;
}
