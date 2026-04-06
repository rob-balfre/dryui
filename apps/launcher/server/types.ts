export type CliId = 'claude-code' | 'codex' | 'gemini-cli' | 'copilot-cli' | 'opencode' | 'cursor';

export type Framework = 'sveltekit' | 'svelte' | 'react' | 'angular' | 'vue' | 'unknown';
export type PackageManager = 'bun' | 'npm' | 'pnpm';
export type SetupStepId =
	| 'scaffold-sveltekit'
	| 'install-package'
	| 'add-foundation-css'
	| 'add-theme-imports'
	| 'set-theme-class'
	| 'configure-mcp'
	| 'update-package'
	| 'run-migration'
	| 'verify-mcp';

export interface CliDefinition {
	readonly id: CliId;
	readonly name: string;
	readonly command: string;
	readonly versionArgs: readonly string[];
	readonly vendor: string;
	readonly npmPackage?: string;
}

// Client → Server
export type ClientMessage =
	| { readonly type: 'validate'; readonly cli: CliId }
	| { readonly type: 'ping' }
	| {
			readonly type: 'spawn-cli';
			readonly cli: CliId;
			readonly prompt?: string;
			readonly cwd?: string;
	  }
	| { readonly type: 'pty-input'; readonly data: string }
	| { readonly type: 'pty-resize'; readonly cols: number; readonly rows: number }
	| { readonly type: 'pick-folder' }
	| { readonly type: 'check-versions' }
	| { readonly type: 'analyze-project'; readonly path: string }
	| {
			readonly type: 'setup-project';
			readonly path: string;
			readonly cli: CliId;
			readonly mode: 'install' | 'update';
			readonly packageManager: PackageManager;
	  }
	| {
			readonly type: 'start-dev-server';
			readonly cwd: string;
			readonly packageManager: PackageManager;
	  }
	| { readonly type: 'stop-dev-server' }
	| {
			readonly type: 'spawn-agent';
			readonly sessionId: string;
			readonly cli: CliId;
			readonly prompt: string;
			readonly cwd: string;
			readonly annotationId?: string;
	  }
	| { readonly type: 'subscribe-session'; readonly sessionId: string }
	| { readonly type: 'unsubscribe-session'; readonly sessionId: string }
	| {
			readonly type: 'apply-theme';
			readonly projectPath: string;
			readonly defaultCss: string;
			readonly darkCss: string;
			readonly recipe: string;
	  };

// Server → Client
export type ServerMessage =
	| { readonly type: 'welcome' }
	| { readonly type: 'pong' }
	| {
			readonly type: 'validation-result';
			readonly cli: CliId;
			readonly status: 'found' | 'not-found' | 'error';
			readonly version?: string;
			readonly path?: string;
			readonly error?: string;
	  }
	| { readonly type: 'pty-output'; readonly data: string; readonly process?: 'cli' | 'dev-server' }
	| {
			readonly type: 'pty-exit';
			readonly code: number | null;
			readonly process?: 'cli' | 'dev-server';
	  }
	| { readonly type: 'pty-error'; readonly error: string; readonly process?: 'cli' | 'dev-server' }
	| { readonly type: 'dev-server-ready'; readonly url: string }
	| {
			readonly type: 'version-check';
			readonly cli: CliId;
			readonly installed: string;
			readonly latest: string;
			readonly updateAvailable: boolean;
	  }
	| { readonly type: 'folder-picked'; readonly path: string | null }
	| {
			readonly type: 'project-analysis';
			readonly status: 'greenfield' | 'installed' | 'error';
			readonly framework?: Framework;
			readonly packageManager?: PackageManager;
			readonly installedVersion?: string;
			readonly latestVersion?: string;
			readonly updateAvailable?: boolean;
			readonly error?: string;
	  }
	| {
			readonly type: 'setup-progress';
			readonly step: SetupStepId;
			readonly status: 'running' | 'done' | 'failed';
			readonly output?: string;
	  }
	| { readonly type: 'setup-complete' }
	| { readonly type: 'setup-error'; readonly step: SetupStepId; readonly error: string }
	| { readonly type: 'agent-output'; readonly sessionId: string; readonly data: string }
	| { readonly type: 'agent-exit'; readonly sessionId: string; readonly code: number | null }
	| { readonly type: 'agent-error'; readonly sessionId: string; readonly error: string }
	| {
			readonly type: 'agent-sessions-list';
			readonly sessions: ReadonlyArray<{
				readonly sessionId: string;
				readonly annotationId: string | null;
				readonly prompt: string;
				readonly startedAt: number;
			}>;
	  }
	| { readonly type: 'theme-applied'; readonly success: boolean; readonly error?: string };
