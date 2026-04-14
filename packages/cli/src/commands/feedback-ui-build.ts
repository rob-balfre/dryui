import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import type { CommandResult } from '../run.js';

const require = createRequire(import.meta.url);

interface BuildWorkspaceResult {
	status: number | null;
	stdout?: string;
	stderr?: string;
}

interface FeedbackUiBuildRuntime {
	buildWorkspace: (workspaceRoot: string) => BuildWorkspaceResult;
	exists: (path: string) => boolean;
	resolvePackagedServerEntry: () => string | null;
}

export interface EnsureFeedbackUiBuiltOptions {
	workspaceRoot?: string;
	runtime?: Partial<FeedbackUiBuildRuntime>;
}

const defaultRuntime: FeedbackUiBuildRuntime = {
	buildWorkspace(workspaceRoot) {
		return spawnSync('bun', ['run', '--filter', '@dryui/feedback-server', 'build'], {
			cwd: workspaceRoot,
			encoding: 'utf8'
		});
	},
	exists: existsSync,
	resolvePackagedServerEntry() {
		try {
			return require.resolve('@dryui/feedback-server/server');
		} catch {
			return null;
		}
	}
};

function feedbackUiError(message: string, detail?: string): CommandResult {
	return {
		output: '',
		error: detail ? `${message}\n\n${detail}` : message,
		exitCode: 1
	};
}

function hasRequiredFiles(uiDir: string, exists: (path: string) => boolean): boolean {
	return exists(resolve(uiDir, 'index.html'));
}

function findWorkspaceUiDir(
	workspaceRoot: string | undefined,
	exists: (path: string) => boolean
): string | null {
	if (!workspaceRoot) return null;
	const packageJsonPath = resolve(workspaceRoot, 'packages/feedback-server/package.json');
	if (!exists(packageJsonPath)) return null;
	return resolve(workspaceRoot, 'packages/feedback-server/dist/ui');
}

function findPackagedUiDir(resolvePackagedServerEntry: () => string | null): string | null {
	const entry = resolvePackagedServerEntry();
	if (!entry) return null;
	return resolve(dirname(entry), 'ui');
}

export function ensureFeedbackUiBuilt(
	options: EnsureFeedbackUiBuiltOptions = {}
): CommandResult | null {
	const runtime = {
		...defaultRuntime,
		...options.runtime
	};

	const packagedUiDir = findPackagedUiDir(runtime.resolvePackagedServerEntry);
	if (packagedUiDir && hasRequiredFiles(packagedUiDir, runtime.exists)) {
		return null;
	}

	const workspaceRoot = options.workspaceRoot;
	const workspaceUiDir = findWorkspaceUiDir(workspaceRoot, runtime.exists);
	if (workspaceUiDir && hasRequiredFiles(workspaceUiDir, runtime.exists)) {
		return null;
	}

	if (!workspaceRoot || !workspaceUiDir) {
		return feedbackUiError('Unable to locate a built feedback dashboard.');
	}

	const result = runtime.buildWorkspace(workspaceRoot);
	if (result.status === 0 && hasRequiredFiles(workspaceUiDir, runtime.exists)) {
		return null;
	}

	const detail = [result.stderr, result.stdout]
		.map((value) => value?.trim())
		.find((value) => value && value.length > 0);

	return feedbackUiError('Unable to build the feedback dashboard.', detail);
}
