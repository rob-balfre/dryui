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
		{ name: 'info', description: 'Inspect component APIs, props, parts, CSS vars, and examples' },
		{ name: 'get', description: 'Retrieve copyable source for a composed output' },
		{ name: 'list', description: 'Discover components and source-owned catalog entries' },
		{
			name: 'compose',
			description: 'Get composition guidance for the right components and patterns'
		},
		{
			name: 'review',
			description: 'Review Svelte components for DryUI spec compliance and best practices'
		},
		{
			name: 'diagnose',
			description: 'Diagnose theme CSS for missing tokens, contrast issues, and value errors'
		},
		{
			name: 'detect_project',
			description: 'Detect DryUI readiness in a Svelte or SvelteKit project'
		},
		{ name: 'plan_install', description: 'Build a non-mutating install checklist for a project' },
		{
			name: 'plan_add',
			description:
				'Build a non-mutating project-aware adoption plan for a component or composed output'
		},
		{
			name: 'doctor',
			description: 'Audit a DryUI workspace and return a structured health report'
		},
		{
			name: 'lint',
			description: 'Lint a DryUI workspace and return deterministic workspace findings'
		}
	],
	prompts: [
		{
			name: 'dryui-compose',
			description: 'Compose a DryUI layout or pattern from the current project context'
		},
		{ name: 'dryui-info', description: 'Inspect a DryUI component before using it' },
		{ name: 'dryui-list', description: 'Browse DryUI components and catalog entries' },
		{ name: 'dryui-review', description: 'Review a Svelte component for DryUI compliance' },
		{ name: 'dryui-install', description: 'Plan a DryUI installation for the current project' },
		{
			name: 'dryui-add',
			description: 'Plan how to add a DryUI component or composed output to the current project'
		},
		{ name: 'dryui-diagnose', description: 'Check theme CSS for DryUI token issues' },
		{ name: 'dryui-get', description: 'Fetch a composed output source snippet' }
	],
	cliCommands: [
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
