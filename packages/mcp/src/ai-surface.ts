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
	tools: [
		{
			name: 'ask',
			description:
				'Discover components, recipes, setup guidance, and tokens through an explicit scope'
		},
		{
			name: 'check',
			description:
				'Validate a component, theme file, directory, workspace, or DESIGN.md-aware rendered URL through one unified tool'
		},
		{
			name: 'check-vision',
			description:
				'Render a URL, screenshot it, and critique visible polish defects against DESIGN.md and the feel-better polish rubric'
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
		{
			name: 'check',
			description: 'Validate files, themes, workspaces, or DESIGN.md-aware rendered URLs'
		},
		{
			name: 'check-vision',
			description: 'Alias for `dryui check --visual <url>`'
		},
		{ name: 'ambient', description: 'Print compact session context for SessionStart hooks' },
		{
			name: 'install-hook',
			description: 'Wire `dryui ambient` into Claude Code settings.json'
		},
		{
			name: 'feedback',
			description: 'Start feedback tooling, inspect the server, or launch the dashboard'
		},
		{
			name: 'prompt',
			description: 'Generate task-specific DryUI implementation prompts'
		}
	],
	promptBundles: [
		{
			id: 'component-implementation',
			title: 'DryUI component implementation',
			description:
				'Task-specific Svelte implementation context for one DryUI component, DESIGN.md-aware rendered checks, and its surrounding rules.',
			targets: ['cli', 'mcp', 'docs', 'skill', 'llms'],
			dependencies: ['spec.json', 'composition-data.ts', 'theme-tokens.generated.json'],
			defaultPrompt:
				'Use real Svelte 5 with @dryui/ui components. Prefer component props, compound parts, DryUI tokens, and generated validation checks over ad hoc markup or inline styling.',
			docsAllowlist: [
				'README.md',
				'CONTRIBUTING.md',
				'ACCESSIBILITY.md',
				'packages/ui/skills/dryui/SKILL.md',
				'packages/ui/skills/dryui/rules/theming.md',
				'packages/mcp/src/spec.json',
				'packages/mcp/src/agent-contract.v1.json'
			],
			componentScopes: ['component', 'recipe', 'token', 'setup'],
			rules: [
				'Import DryUI components from @dryui/ui or the documented subpath import.',
				'Use compound component parts exactly as documented by required-parts.',
				'Prefer DryUI props and CSS variables over raw HTML replacements or inline theme values.',
				'Preserve accessible names, labels, focus order, and native element semantics.',
				'Use DESIGN.md as the compact UI brief when present, then apply the feel-better polish rubric during rendered checks.'
			],
			checks: [
				'dryui check <file.svelte>',
				'dryui check --visual <url> for DESIGN.md-aware rendered-page polish',
				'svelte-autofixer <file.svelte>',
				'bun run --filter @dryui/ui build when editing packages/ui Svelte sources'
			],
			source: 'packages/mcp/src/ai-surface.ts'
		}
	]
} as const;
