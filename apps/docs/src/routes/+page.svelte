<script lang="ts">
	import { Button, CodeBlock, Container, Diagram, Heading, Text } from '@dryui/ui';
	import type { DiagramConfig } from '@dryui/ui';
	import {
		LayoutGrid,
		Cpu,
		Bot,
		Paintbrush,
		ChevronRight,
		Rocket,
		User,
		Sparkles,
		Boxes,
		ShieldCheck,
		AppWindow,
		PenLine
	} from 'lucide-svelte';
	import { homeIntroPrompt } from '$lib/home-intro.svelte';
	import { withBase } from '$lib/utils';
	import { GITHUB_URL } from '$lib/site-meta';

	const promptCode = homeIntroPrompt;

	// Tuned to replace the old hand-built SVG 1:1 enough that the homepage can
	// now use <Diagram /> as the source of truth.
	const workflowDiagram: DiagramConfig = {
		direction: 'TB',
		spacing: { cornerRadius: 16, nodeGap: 24, layerGap: 96, backEdgeLaneGap: 144 },
		ariaLabel: 'How DryUI works, rendered with the Diagram component',
		nodes: [
			{
				id: 'you',
				label: 'You',
				description: 'Write a prompt',
				iconComponent: User,
				width: 248,
				height: 128
			},
			{
				id: 'mcp',
				label: 'DryUI MCP',
				description: 'Look up components',
				iconComponent: Boxes,
				width: 224,
				height: 136
			},
			{
				id: 'preprocessor',
				label: 'Preprocessor',
				description: 'Lint Svelte output',
				iconComponent: ShieldCheck,
				width: 224,
				height: 136
			},
			{
				id: 'app',
				label: 'Your App',
				description: 'Render the UI',
				iconComponent: AppWindow,
				width: 224,
				height: 136
			}
		],
		edges: [
			{ from: 'you', to: 'mcp' },
			{ from: 'mcp', to: 'preprocessor' },
			{ from: 'preprocessor', to: 'app' },
			{
				from: 'app',
				to: 'you',
				waypoint: {
					id: 'live-feedback',
					label: 'Live Feedback',
					description: 'Mark up the running app. Your agent reads it instantly via MCP.',
					iconComponent: PenLine,
					color: 'brand',
					width: 340,
					height: 208,
					position: 0.32
				}
			}
		],
		clusters: [
			{
				id: 'agent',
				label: 'AI Agent',
				iconComponent: Sparkles,
				color: 'brand',
				direction: 'LR',
				dashed: false,
				spacing: { nodeGap: 32, clusterPadding: 36 },
				nodes: ['mcp', 'preprocessor', 'app']
			}
		]
	};
</script>

<svelte:head>
	<title>DryUI - Don't Repeat Yourself.</title>
</svelte:head>

<div class="page">
	<Container>
		<div class="page-stack">
			<div class="page-sections">
				<section class="hero">
					<div class="hero-copy">
						<div class="hero-copy-stack">
							<Text size="xs" color="secondary" weight="medium">DryUI - Don't Repeat Yourself</Text>
							<Heading level={1}>SvelteKit meets your favorite AI coding tool</Heading>
							<Text color="secondary">
								An experiment in closing the gap between AI-generated and hand-crafted Svelte UIs.
								100% free and open-source.
							</Text>
						</div>

						<div class="flow" aria-label="How it works">
							<div class="flow-node">
								<LayoutGrid size={20} aria-hidden="true" />
								<span class="flow-label">Components</span>
							</div>
							<span class="flow-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
							<div class="flow-node">
								<Cpu size={20} aria-hidden="true" />
								<span class="flow-label">CLI &amp; MCP Server</span>
							</div>
							<span class="flow-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
							<div class="flow-node">
								<Bot size={20} aria-hidden="true" />
								<span class="flow-label">AI Agent</span>
							</div>
							<span class="flow-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
							<div class="flow-node">
								<Paintbrush size={20} aria-hidden="true" />
								<span class="flow-label">Your UI</span>
							</div>
						</div>
					</div>
				</section>

				<section class="footer-section">
					<Heading level={2}>One step to get started</Heading>
					<Text color="secondary">Paste this into your agent of choice.</Text>
					<CodeBlock code={promptCode} language="text" />

					<nav aria-label="Homepage links" class="footer-links">
						<div class="action-grid">
							<Button variant="solid" size="md" href={withBase('/getting-started')}>
								<Rocket size={16} aria-hidden="true" /> Get Started
							</Button>
							<Button
								variant="outline"
								size="md"
								href={GITHUB_URL}
								target="_blank"
								rel="noreferrer"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
									><path
										d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
									/></svg
								> GitHub
							</Button>
						</div>
					</nav>
				</section>

				<section class="workflow-section">
					<div class="workflow-copy">
						<Heading level={2}>How DryUI works</Heading>
						<Text color="secondary">
							You prompt your AI agent. It queries the DryUI MCP for the right components. Generated
							Svelte runs through the lint preprocessor into your app, and feedback loops straight
							back to the agent. This version is rendered with the same <code>@dryui/ui</code>
							<code>&lt;Diagram /&gt;</code> component you can ship in your own app.
						</Text>
					</div>
					<div class="workflow-canvas workflow-canvas--diagram">
						<Diagram config={workflowDiagram} />
					</div>
				</section>
			</div>
		</div>
	</Container>
</div>

<style>
	.page {
		--home-panel-bg: color-mix(in srgb, var(--dry-color-bg-raised) 84%, transparent);
		display: grid;
		grid-template-columns: minmax(0, 72rem);
		justify-content: center;
		align-content: start;
		padding-block: clamp(var(--dry-space-6), 4vw, var(--dry-space-10)) var(--dry-space-10);
	}

	.page-stack {
		container-type: inline-size;
		display: grid;
	}

	.page-sections {
		display: grid;
		gap: var(--dry-space-8);
	}

	.hero-copy-stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	.action-grid {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		justify-content: start;
		gap: var(--dry-space-3);
	}

	@container (max-width: 40rem) {
		.action-grid {
			grid-auto-flow: row;
			grid-auto-columns: 1fr;
		}
	}

	.hero {
		box-sizing: border-box;
		padding: clamp(var(--dry-space-6), 4vw, var(--dry-space-10));
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: calc(var(--dry-radius-xl) * 1.2);
		background:
			radial-gradient(
				circle at top left,
				color-mix(in srgb, var(--dry-color-fill-brand) 10%, transparent),
				transparent 34%
			),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--home-panel-bg) 100%, transparent),
				color-mix(in srgb, var(--dry-color-bg-raised) 88%, transparent)
			);
	}

	.hero-copy {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.flow {
		display: grid;
		grid-template-columns: repeat(4, auto) repeat(3, auto);
		align-items: center;
		justify-content: start;
		gap: var(--dry-space-3);
		padding-block-start: var(--dry-space-5);
	}

	.flow-node {
		display: grid;
		grid-template-columns: 1.25rem auto;
		align-items: center;
		gap: var(--dry-space-2);
		color: var(--dry-color-text-strong);
	}

	.flow-label {
		font-size: var(--dry-text-sm);
		font-weight: 500;
		white-space: nowrap;
	}

	.flow-arrow {
		color: var(--dry-color-text-weak);
		opacity: 0.5;
	}

	@container (max-width: 40rem) {
		.flow {
			grid-template-columns: 1fr;
			gap: var(--dry-space-3);
		}

		.flow-arrow {
			display: none;
		}
	}

	.footer-section {
		display: grid;
		gap: var(--dry-space-4);
		align-content: start;
		position: relative;
		padding: clamp(var(--dry-space-5), 3vw, var(--dry-space-8));
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 78%, transparent);
		border-radius: calc(var(--dry-radius-xl) * 1.2);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--home-panel-bg) 100%, transparent),
				color-mix(in srgb, var(--dry-color-bg-raised) 92%, transparent)
			),
			radial-gradient(
				circle at top right,
				color-mix(in srgb, var(--dry-color-fill-brand) 18%, transparent),
				transparent 36%
			);
	}

	.footer-links {
		display: grid;
		grid-template-columns: minmax(0, 42rem);
	}

	.workflow-section {
		display: grid;
		gap: var(--dry-space-5);
		align-content: start;
		position: relative;
		padding: clamp(var(--dry-space-5), 3vw, var(--dry-space-8));
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 78%, transparent);
		border-radius: calc(var(--dry-radius-xl) * 1.2);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--home-panel-bg) 100%, transparent),
				color-mix(in srgb, var(--dry-color-bg-raised) 92%, transparent)
			),
			radial-gradient(
				circle at bottom left,
				color-mix(in srgb, var(--dry-color-fill-brand) 16%, transparent),
				transparent 38%
			);
	}

	.workflow-copy {
		display: grid;
		gap: var(--dry-space-2);
	}

	.workflow-canvas {
		display: grid;
		padding-block-start: var(--dry-space-4);
	}

	.workflow-canvas--diagram {
		--dry-diagram-node-bg: color-mix(in srgb, var(--dry-color-bg-base) 82%, transparent);
		--dry-diagram-node-border: color-mix(in srgb, var(--dry-color-stroke-weak) 92%, transparent);
		--dry-diagram-edge-color: color-mix(in srgb, var(--dry-color-text-strong) 92%, transparent);
		--dry-diagram-node-padding: 20px 28px;
		--dry-diagram-node-padding-with-description: 24px 28px;
		--dry-diagram-node-padding-mobile: 16px 18px;
		--dry-diagram-node-padding-with-description-mobile: 18px 20px;
		--dry-diagram-node-gap: 10px;
		--dry-diagram-node-gap-with-description: 8px;
		--dry-diagram-node-label-size: 1.125rem;
		--dry-diagram-node-label-size-with-description: 1.375rem;
		--dry-diagram-node-description-size: 0.9375rem;
		--dry-diagram-cluster-label-size: 0.875rem;
		--dry-diagram-cluster-bg: color-mix(
			in srgb,
			var(--dry-color-fill-brand) 5%,
			var(--dry-color-bg-base)
		);
		--dry-diagram-cluster-border: color-mix(
			in srgb,
			var(--dry-color-stroke-brand) 60%,
			transparent
		);
		--dry-diagram-text-muted: var(--dry-color-text-weak);
	}

	@container (max-width: 40rem) {
		.hero,
		.footer-section,
		.workflow-section {
			padding: var(--dry-space-5);
		}

		.hero,
		.workflow-section {
			border-radius: var(--dry-radius-xl);
		}
	}
</style>
