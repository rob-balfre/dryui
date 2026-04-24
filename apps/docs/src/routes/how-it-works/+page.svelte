<script lang="ts">
	import { Card, Container, Diagram, Text } from '@dryui/ui';
	import {
		AppWindow,
		Boxes,
		MessageSquare,
		PenLine,
		Plug,
		Rocket,
		ShieldCheck,
		Wrench
	} from 'lucide-svelte';
	import type { DiagramConfig } from '@dryui/ui';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';

	const moduleStoryDiagram: DiagramConfig = {
		direction: 'TB',
		ariaLabel: 'How DryUI works from a module user story perspective',
		spacing: {
			nodeGap: 28,
			layerGap: 84,
			cornerRadius: 18
		},
		nodes: [
			{
				id: 'story',
				label: 'Start with the module story',
				description: 'Describe the screen, workflow, or module outcome you want to build.',
				iconComponent: MessageSquare,
				color: 'brand',
				state: 'active',
				width: 360,
				height: 140
			},
			{
				id: 'cli',
				label: '@dryui/cli',
				description: 'Bootstrap setup, theme imports, and the initial project path.',
				iconComponent: Wrench,
				width: 360,
				height: 136
			},
			{
				id: 'plugin',
				label: '@dryui/plugin',
				description: 'Load the DryUI skill plus the dryui and dryui-feedback MCP servers.',
				iconComponent: Plug,
				color: 'info',
				width: 360,
				height: 136
			},
			{
				id: 'mcp',
				label: '@dryui/mcp',
				description: 'ask and check turn requests into component discovery and static validation.',
				iconComponent: Boxes,
				color: 'brand',
				width: 360,
				height: 144
			},
			{
				id: 'ui',
				label: '@dryui/ui',
				description: 'The agent writes verified Svelte 5 components into the module.',
				iconComponent: AppWindow,
				color: 'brand',
				width: 360,
				height: 136
			},
			{
				id: 'lint',
				label: '@dryui/lint',
				description:
					'Build-time rules catch token drift, layout violations, and styling shortcuts.',
				iconComponent: ShieldCheck,
				color: 'warning',
				width: 360,
				height: 144
			},
			{
				id: 'feedback',
				label: '@dryui/feedback',
				description: 'Review the running module, annotate changes, and send the next request back.',
				iconComponent: PenLine,
				color: 'info',
				width: 360,
				height: 144
			},
			{
				id: 'ship',
				label: 'Ship the module',
				description:
					'The module lands with consistent components, theme tokens, and the same agent loop.',
				iconComponent: Rocket,
				color: 'success',
				state: 'complete',
				width: 360,
				height: 140
			}
		],
		edges: [
			{ from: 'story', to: 'cli' },
			{ from: 'cli', to: 'plugin' },
			{ from: 'plugin', to: 'mcp' },
			{ from: 'mcp', to: 'ui' },
			{ from: 'ui', to: 'lint' },
			{ from: 'lint', to: 'feedback' },
			{ from: 'feedback', to: 'ship' }
		]
	};
</script>

<svelte:head>
	<title>How DryUI Works | DryUI</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="How DryUI Works"
			description="A draft vertical flow of the DryUI module story, from the first prompt through setup, implementation, validation, feedback, and shipping."
		/>

		<Card.Root>
			<Card.Content>
				<div class="diagram-shell">
					<Diagram config={moduleStoryDiagram} />
				</div>
			</Card.Content>
		</Card.Root>

		<div class="page-note">
			<Text size="sm" color="secondary">
				This draft page is intentionally omitted from the docs sidebar and search for now.
			</Text>
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-8);
		padding-bottom: var(--dry-space-12);
	}

	.diagram-shell {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		overflow: auto;
	}

	.page-note {
		display: grid;
		grid-template-columns: minmax(0, 60ch);
	}
</style>
