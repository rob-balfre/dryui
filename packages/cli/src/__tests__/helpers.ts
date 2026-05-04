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

interface CaptureResult {
	logs: string[];
	errors: string[];
	exitCode: number | null;
}

interface CaptureSession {
	result: CaptureResult;
	swallowExit(error: unknown): void;
	restore(): void;
}

function beginCapture(): CaptureSession {
	const logs: string[] = [];
	const errors: string[] = [];
	const result: CaptureResult = { logs, errors, exitCode: null };
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
		result.exitCode = typeof code === 'number' ? code : 0;
		throw new Error('exit');
	}) as typeof process.exit;

	return {
		result,
		swallowExit(error: unknown) {
			if (!(error instanceof Error) || error.message !== 'exit') {
				throw error;
			}
		},
		restore() {
			console.log = originalLog;
			console.error = originalError;
			process.exit = originalExit;
		}
	};
}

export function captureCommandIO(run: () => void): CaptureResult {
	const session = beginCapture();
	try {
		run();
	} catch (error) {
		session.swallowExit(error);
	} finally {
		session.restore();
	}
	return session.result;
}

export async function captureAsyncCommandIO(run: () => Promise<void>): Promise<CaptureResult> {
	const session = beginCapture();
	try {
		await run();
	} catch (error) {
		session.swallowExit(error);
	} finally {
		session.restore();
	}
	return session.result;
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

export function createTabsMockSpec() {
	return {
		themeImports: {
			default: '@dryui/ui/themes/default.css',
			dark: '@dryui/ui/themes/dark.css'
		},
		components: {
			Tabs: {
				import: '@dryui/ui',
				description: 'Tabbed content panels',
				category: 'navigation',
				tags: ['tabs'],
				compound: true,
				parts: {
					Root: { props: {} }
				},
				cssVars: {},
				dataAttributes: [],
				example:
					'<Tabs.Root value="one">\n  <Tabs.List>\n    <Tabs.Trigger value="one">One</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Content value="one">Body</Tabs.Content>\n</Tabs.Root>'
			}
		}
	} as const;
}
