import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const tempDirs: string[] = [];

export function createTempTree(
	files: Record<string, string>,
	options: { git?: boolean } = {}
): string {
	const root = mkdtempSync(resolve(tmpdir(), 'dryui-cli-'));
	tempDirs.push(root);

	for (const [relativePath, contents] of Object.entries(files)) {
		const absolutePath = resolve(root, relativePath);
		mkdirSync(resolve(absolutePath, '..'), { recursive: true });
		writeFileSync(absolutePath, contents);
	}

	if (options.git) {
		execFileSync('git', ['init'], { cwd: root });
		execFileSync('git', ['config', 'user.email', 'dryui@example.com'], { cwd: root });
		execFileSync('git', ['config', 'user.name', 'DryUI'], { cwd: root });
		execFileSync('git', ['add', '.'], { cwd: root });
		execFileSync('git', ['commit', '-m', 'init'], { cwd: root });
	}

	return root;
}

export function captureCommandIO(run: () => void): {
	logs: string[];
	errors: string[];
	exitCode: number | null;
} {
	const logs: string[] = [];
	const errors: string[] = [];
	let exitCode: number | null = null;
	const originalLog = console.log;
	const originalError = console.error;
	const originalExit = process.exit;

	console.log = ((...args: unknown[]) => {
		logs.push(args.map(String).join(' '));
	}) as typeof console.log;
	console.error = ((...args: unknown[]) => {
		errors.push(args.map(String).join(' '));
	}) as typeof console.error;
	process.exit = ((code?: number | string | undefined) => {
		exitCode = typeof code === 'number' ? code : 0;
		throw new Error('exit');
	}) as typeof process.exit;

	try {
		run();
	} catch (error) {
		if (!(error instanceof Error) || error.message !== 'exit') {
			throw error;
		}
	} finally {
		console.log = originalLog;
		console.error = originalError;
		process.exit = originalExit;
	}

	return { logs, errors, exitCode };
}

export function withCwd<T>(cwd: string, run: () => T): T {
	const originalCwd = process.cwd();
	process.chdir(cwd);

	try {
		return run();
	} finally {
		process.chdir(originalCwd);
	}
}

export function cleanupTempDirs(): void {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
}

export function createCardMockSpec() {
	return {
		themeImports: {
			default: '@dryui/ui/themes/default.css',
			dark: '@dryui/ui/themes/dark.css'
		},
		components: {
			Card: {
				import: '@dryui/ui',
				description: 'Content surface',
				category: 'display',
				tags: ['surface'],
				compound: true,
				parts: {
					Root: { props: {} }
				},
				cssVars: {},
				dataAttributes: [],
				example: '<Card.Root>\n  <Card.Content>Body</Card.Content>\n</Card.Root>'
			}
		}
	} as const;
}
