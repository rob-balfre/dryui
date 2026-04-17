/**
 * Helpers for scanning built npm tarballs for unresolved `workspace:*` dependency
 * ranges.
 *
 * Why this exists: npm refuses to install a dep whose version range starts with
 * `workspace:`, so a tarball that leaks that string is dead on arrival for every
 * consumer — but the failure only surfaces post-publish. We've already shipped
 * @dryui/mcp@2.0.0/2.0.1 with unresolved workspace refs once. The scan runs
 * before publish and hard-aborts if any tarball still contains `workspace:*`
 * inside its `package.json`.
 *
 * Split into three pieces so both the CLI (scripts/verify-no-workspace-refs.ts)
 * and the publish flow (scripts/publish-packages.ts) can share them:
 *
 *   - packTarball: shell out to `npm pack` and return the tarball path
 *   - scanTarball: extract + parse `package/package.json` and return findings
 *   - formatFindings: prettify a list of findings for human-readable output
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';

export interface WorkspaceRefFinding {
	tarballPath: string;
	packageName: string;
	packageVersion: string;
	depField: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
	depName: string;
	range: string;
}

const DEP_FIELDS: Array<WorkspaceRefFinding['depField']> = [
	'dependencies',
	'devDependencies',
	'peerDependencies',
	'optionalDependencies'
];

/**
 * Run `npm pack` in `packageDir` and drop the tarball into `outputDir`.
 * Returns the absolute path of the produced `.tgz`.
 */
export function packTarball(packageDir: string, outputDir: string): string {
	const stdout = execFileSync(
		'npm',
		['pack', '--pack-destination', outputDir, '--json', '--silent'],
		{ cwd: packageDir, encoding: 'utf8' }
	);
	// npm pack --json emits an array of { name, version, filename, ... }.
	const parsed = JSON.parse(stdout) as Array<{ filename: string }>;
	if (!parsed.length || !parsed[0].filename) {
		throw new Error(`npm pack produced no tarball in ${packageDir}`);
	}
	return resolve(outputDir, parsed[0].filename);
}

/**
 * Extract `package/package.json` from a tarball into a temp dir and parse it.
 * The temp dir is cleaned up before returning.
 */
function readPackageJsonFromTarball(tarballPath: string): Record<string, unknown> {
	const workDir = mkdtempSync(join(tmpdir(), 'dryui-tarball-scan-'));
	try {
		execFileSync('tar', ['-xzf', tarballPath, '-C', workDir, 'package/package.json'], {
			stdio: ['ignore', 'ignore', 'pipe']
		});
		const pkgJsonPath = join(workDir, 'package', 'package.json');
		return JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as Record<string, unknown>;
	} finally {
		rmSync(workDir, { recursive: true, force: true });
	}
}

/**
 * Scan a single tarball for `workspace:*` (or any `workspace:` prefix) refs in
 * any dependency field of its `package.json`. Returns an empty array on a clean
 * tarball.
 */
export function scanTarball(tarballPath: string): WorkspaceRefFinding[] {
	const pkg = readPackageJsonFromTarball(tarballPath);
	const name = typeof pkg.name === 'string' ? pkg.name : '<unknown>';
	const version = typeof pkg.version === 'string' ? pkg.version : '<unknown>';

	const findings: WorkspaceRefFinding[] = [];
	for (const field of DEP_FIELDS) {
		const deps = pkg[field];
		if (!deps || typeof deps !== 'object') continue;
		for (const [depName, range] of Object.entries(deps as Record<string, unknown>)) {
			if (typeof range !== 'string') continue;
			if (!range.startsWith('workspace:')) continue;
			findings.push({
				tarballPath,
				packageName: name,
				packageVersion: version,
				depField: field,
				depName,
				range
			});
		}
	}
	return findings;
}

/**
 * Resolve a CLI arg (either a directory or a single .tgz path) to a list of
 * tarball paths to scan.
 */
export function collectTarballs(inputPath: string): string[] {
	const absolute = resolve(inputPath);
	const stats = statSync(absolute);
	if (stats.isFile()) {
		if (extname(absolute) !== '.tgz') {
			throw new Error(`Expected a .tgz file, got ${absolute}`);
		}
		return [absolute];
	}
	if (stats.isDirectory()) {
		return readdirSync(absolute)
			.filter((entry: string) => entry.endsWith('.tgz'))
			.map((entry: string) => absolute + sep + entry);
	}
	throw new Error(`Not a file or directory: ${absolute}`);
}

export function formatFindings(findings: WorkspaceRefFinding[]): string {
	const lines: string[] = [];
	const byTarball = new Map<string, WorkspaceRefFinding[]>();
	for (const finding of findings) {
		const list = byTarball.get(finding.tarballPath) ?? [];
		list.push(finding);
		byTarball.set(finding.tarballPath, list);
	}
	for (const [tarballPath, tarballFindings] of byTarball) {
		const { packageName, packageVersion } = tarballFindings[0];
		lines.push(`  ✗ ${packageName}@${packageVersion}  (${tarballPath})`);
		for (const finding of tarballFindings) {
			lines.push(`      ${finding.depField}.${finding.depName} = "${finding.range}"`);
		}
	}
	return lines.join('\n');
}
