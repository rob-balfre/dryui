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
		{ name: 'init', description: 'Print setup snippets for a new DryUI app' },
		{ name: 'detect', description: 'Detect DryUI project setup' },
		{ name: 'install', description: 'Print a project install plan' },
		{ name: 'add', description: 'Print a copyable starter snippet or a project-aware plan' },
		{ name: 'get', description: 'Print copyable Svelte source for a composed output' },
		{ name: 'info', description: 'Show component API reference' },
		{ name: 'list', description: 'List all components' },
		{ name: 'compose', description: 'Look up composition guidance' },
		{ name: 'review', description: 'Validate a Svelte file against DryUI spec' },
		{ name: 'diagnose', description: 'Validate theme CSS' },
		{ name: 'doctor', description: 'Inspect workspace health' },
		{ name: 'lint', description: 'Print deterministic workspace findings' }
	]
} as const;
