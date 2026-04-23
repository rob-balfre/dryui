// Internal flag support for `dryui init --dev-tarballs <dir>`, used by the
// E2E harness to install worktree tarballs instead of the npm-published
// @dryui/* packages. The manifest is produced by scripts/e2e/pack-dev-versions.ts.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

export function rewriteInstallCommand(command: string, manifest: DevTarballsManifest): string {
	return command.replace(/@dryui\/[a-z0-9-]+/g, (token) => rewritePackageName(token, manifest));
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
