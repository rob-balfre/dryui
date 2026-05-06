// Compatibility barrel for dispatch launch internals.
//
// Public callers and tests historically imported launch seams from this file.
// The implementation now lives in `launch.ts` plus `launch-strategies/*`.

export {
	STRATEGIES,
	launchAgent,
	probeAgent,
	type DispatchOptions,
	type LaunchStrategy
} from './launch.js';
export { resolveLocalPluginDir } from './launch-strategies/terminal-cli.js';
export {
	buildVsCodeChatArgs,
	buildWindsurfChatArgs,
	buildWorkspaceAppLaunch,
	resolveVsCodeCliWith,
	resolveWindsurfCliWith,
	type WorkspaceAppLaunchContext,
	type WorkspaceAppLaunchPlan,
	type WorkspaceAppLaunchStrategy
} from './launch-strategies/workspace-app.js';
