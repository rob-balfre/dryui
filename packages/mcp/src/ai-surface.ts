export interface AiSurfaceEntry {
	readonly name: string;
	readonly description: string;
}

export interface AiSurfaceManifest {
	readonly tools: readonly AiSurfaceEntry[];
	readonly prompts: readonly AiSurfaceEntry[];
	readonly cliCommands: readonly AiSurfaceEntry[];
}

export const aiSurface: AiSurfaceManifest = {
	tools: [
		{
			name: 'ask',
			description:
				'Discover components, recipes, setup guidance, and tokens through an explicit scope'
		},
		{
			name: 'check',
			description:
				'Validate a component, theme file, directory, or workspace through one unified path-driven tool'
		}
	],
	prompts: [
		{
			name: 'dryui-ask',
			description: 'Discover the right DryUI component, recipe, list, or setup guidance'
		},
		{
			name: 'dryui-check',
			description: 'Validate a DryUI component, theme file, directory, or workspace'
		}
	],
	cliCommands: [
		{
			name: 'setup',
			description: 'Interactive onboarding for editor integration and feedback tooling'
		},
		{ name: 'init', description: 'Bootstrap a SvelteKit + DryUI project' },
		{ name: 'detect', description: 'Detect DryUI project setup' },
		{ name: 'install', description: 'Print a project install plan' },
		{ name: 'add', description: 'Print a copyable starter snippet or a project-aware plan' },
		{ name: 'info', description: 'Show component API reference' },
		{ name: 'list', description: 'List all components' },
		{ name: 'compose', description: 'Look up composition guidance' },
		{ name: 'tokens', description: 'List `--dry-*` design tokens' },
		{ name: 'ambient', description: 'Print compact session context for SessionStart hooks' },
		{
			name: 'install-hook',
			description: 'Wire `dryui ambient` into Claude Code settings.json'
		},
		{
			name: 'feedback',
			description: 'Start feedback tooling, inspect the server, or launch the dashboard'
		}
	]
} as const;
