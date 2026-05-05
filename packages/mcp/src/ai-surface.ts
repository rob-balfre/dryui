export interface AiSurfaceEntry {
	readonly name: string;
	readonly description: string;
}

export interface AiPromptBundle {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly targets: readonly string[];
	readonly dependencies: readonly string[];
	readonly defaultPrompt: string;
	readonly docsAllowlist: readonly string[];
	readonly componentScopes: readonly string[];
	readonly rules: readonly string[];
	readonly checks: readonly string[];
	readonly source: string;
}

export interface AiSurfaceManifest {
	readonly tools: readonly AiSurfaceEntry[];
	readonly prompts: readonly AiSurfaceEntry[];
	readonly cliCommands: readonly AiSurfaceEntry[];
	readonly promptBundles: readonly AiPromptBundle[];
}

export const aiSurface: AiSurfaceManifest = {
	tools: [],
	prompts: [],
	cliCommands: [
		{ name: 'ambient', description: 'Print compact session context for SessionStart hooks' },
		{
			name: 'install-hook',
			description: 'Wire `dryui ambient` into Claude Code settings.json'
		},
		{
			name: 'feedback',
			description: 'Start feedback tooling, inspect the server, or launch the dashboard'
		}
	],
	promptBundles: [
		{
			id: 'component-implementation',
			title: 'DryUI component implementation',
			description:
				'Task-specific Svelte implementation context for one DryUI component, its contract, and its surrounding rules.',
			targets: ['docs', 'skill', 'llms'],
			dependencies: ['spec.json', 'composition-data.ts', 'theme-tokens.generated.json'],
			defaultPrompt:
				'Use real Svelte 5 with @dryui/ui components. Prefer component props, compound parts, DryUI tokens, and generated validation checks over ad hoc markup or inline styling.',
			docsAllowlist: [
				'README.md',
				'CONTRIBUTING.md',
				'ACCESSIBILITY.md',
				'skills/dryui/SKILL.md',
				'skills/dryui/rules/theming.md',
				'packages/mcp/src/spec.json',
				'packages/mcp/src/agent-contract.v1.json'
			],
			componentScopes: ['component', 'recipe', 'token', 'setup'],
			rules: [
				'Import DryUI components from @dryui/ui or the documented subpath import.',
				'Use compound component parts exactly as documented by required-parts.',
				'Prefer DryUI props and CSS variables over raw HTML replacements or inline theme values.',
				'Preserve accessible names, labels, focus order, and native element semantics.'
			],
			checks: [
				'svelte-autofixer <file.svelte>',
				'bun run --filter @dryui/lint test when changing lint rules',
				'bun run --filter @dryui/ui build when editing packages/ui Svelte sources'
			],
			source: 'packages/mcp/src/ai-surface.ts'
		}
	]
} as const;
