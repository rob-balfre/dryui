// Internal flag support for `dryui init --dev-tarballs <dir>`, used by the
// E2E harness to install worktree tarballs instead of the npm-published
// @dryui/* packages. The manifest is produced by scripts/e2e/pack-dev-versions.ts.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { InstallPackageOptions } from './launch-utils.js';

export interface DevTarballsManifest {
	readonly generatedAt: string;
	readonly packages: Record<string, { version: string; tarball: string }>;
}

export function loadDevTarballsManifest(dir: string): DevTarballsManifest {
	const manifestPath = resolve(dir, 'manifest.json');
	if (!existsSync(manifestPath)) {
		throw new Error(
			`--dev-tarballs: manifest not found at ${manifestPath} (run \`bun run e2e:pack\` first)`
		);
	}
	const raw = readFileSync(manifestPath, 'utf8');
	const parsed = JSON.parse(raw) as DevTarballsManifest;
	if (!parsed || typeof parsed !== 'object' || !parsed.packages) {
		throw new Error(`--dev-tarballs: manifest at ${manifestPath} is malformed`);
	}
	return parsed;
}

// `bun add <abs-path.tgz>` works; `bun add file:/abs/path.tgz` trips bun's
// cache-move logic (EINVAL rename). Bare path is cross-manager safe.
function rewritePackageName(name: string, manifest: DevTarballsManifest): string {
	const entry = manifest.packages[name];
	return entry ? entry.tarball : name;
}

export function rewriteInstallCommandArgs(
	args: readonly string[],
	manifest: DevTarballsManifest
): string[] {
	return args.map((arg) => rewritePackageName(arg, manifest));
}

export function injectOverridesIntoPackageJson(
	content: string,
	manifest: DevTarballsManifest
): string {
	const pkg = JSON.parse(content) as Record<string, unknown>;
	const overrides: Record<string, string> = {
		...((pkg.overrides as Record<string, string> | undefined) ?? {})
	};
	for (const [name, info] of Object.entries(manifest.packages)) {
		overrides[name] = `file:${info.tarball}`;
	}
	pkg.overrides = overrides;
	// `resolutions` for yarn/pnpm compatibility; bun honours both keys.
	pkg.resolutions = {
		...((pkg.resolutions as Record<string, string> | undefined) ?? {}),
		...overrides
	};
	return JSON.stringify(pkg, null, 2) + '\n';
}

export function wrapInstallPackage(
	original: (options: InstallPackageOptions) => boolean,
	manifest: DevTarballsManifest
): (options: InstallPackageOptions) => boolean {
	return (options) =>
		original({
			...options,
			packageNames: options.packageNames.map((n) => rewritePackageName(n, manifest))
		});
}

export interface AutoDetectedWorkspace {
	readonly root: string;
	readonly tarballsDir: string;
	readonly manifestExists: boolean;
}

function maxMtimeUnder(rootDir: string): number {
	if (!existsSync(rootDir)) return 0;
	let max = 0;
	const stack: string[] = [rootDir];
	while (stack.length > 0) {
		const dir = stack.pop()!;
		let entries: ReturnType<typeof readdirSync>;
		try {
			entries = readdirSync(dir, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			const full = resolve(dir, entry.name);
			if (entry.isDirectory()) {
				stack.push(full);
			} else if (entry.isFile()) {
				try {
					const mt = statSync(full).mtimeMs;
					if (mt > max) max = mt;
				} catch {
					// ignore unreadable files
				}
			}
		}
	}
	return max;
}

function maxDistMtime(workspaceRoot: string): number {
	const packagesDir = resolve(workspaceRoot, 'packages');
	if (!existsSync(packagesDir)) return 0;
	let max = 0;
	for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const dist = resolve(packagesDir, entry.name, 'dist');
		const mt = maxMtimeUnder(dist);
		if (mt > max) max = mt;
	}
	return max;
}

export type ManifestFreshness = 'fresh' | 'stale' | 'missing';

export function checkManifestFreshness(workspace: AutoDetectedWorkspace): ManifestFreshness {
	const manifestPath = resolve(workspace.tarballsDir, 'manifest.json');
	if (!existsSync(manifestPath)) return 'missing';
	let manifestMtime = 0;
	try {
		manifestMtime = statSync(manifestPath).mtimeMs;
	} catch {
		return 'missing';
	}
	const distMtime = maxDistMtime(workspace.root);
	return distMtime > manifestMtime ? 'stale' : 'fresh';
}

export function detectDryuiWorkspace(cliBinUrl: string): AutoDetectedWorkspace | null {
	let startDir: string;
	try {
		startDir = dirname(fileURLToPath(cliBinUrl));
	} catch {
		return null;
	}

	let dir = startDir;
	for (let i = 0; i < 8; i++) {
		const uiPkgJson = resolve(dir, 'packages', 'ui', 'package.json');
		if (existsSync(uiPkgJson)) {
			try {
				const pkg = JSON.parse(readFileSync(uiPkgJson, 'utf8')) as { name?: string };
				if (pkg.name === '@dryui/ui') {
					const tarballsDir = resolve(dir, 'reports', 'e2e-tarballs');
					return {
						root: dir,
						tarballsDir,
						manifestExists: existsSync(resolve(tarballsDir, 'manifest.json'))
					};
				}
			} catch {
				// fall through and keep walking
			}
		}
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}

	return null;
}
