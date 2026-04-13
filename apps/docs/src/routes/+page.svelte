<script lang="ts">
	import { Button, CodeBlock, Container, Diagram, Heading, Text } from '@dryui/ui';
	import type { DiagramConfig } from '@dryui/ui';
	import type { Component } from 'svelte';
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

	type WorkflowStep = {
		id: string;
		icon: Component<{ size?: number | string; 'aria-hidden'?: boolean | string }>;
		title: string;
		description: string;
	};

	const topStep: WorkflowStep = {
		id: 'you',
		icon: User,
		title: 'You',
		description: 'Write a prompt'
	};

	const innerSteps: WorkflowStep[] = [
		{ id: 'mcp', icon: Boxes, title: 'DryUI MCP', description: 'Look up components' },
		{
			id: 'preprocessor',
			icon: ShieldCheck,
			title: 'Preprocessor',
			description: 'Lint Svelte output'
		},
		{ id: 'app', icon: AppWindow, title: 'Your App', description: 'Render the UI' }
	];

	const TOP_CARD_W = 204;
	const TOP_CARD_H = 96;
	const INNER_CARD_W = 168;
	const INNER_CARD_H = 96;
	const INNER_GAP = 24;
	const CONTAINER_PAD_X = 28;
	const CONTAINER_PAD_TOP = 48;
	const CONTAINER_PAD_BOTTOM = 28;
	const TOP_GAP = 96;
	const LOOP_RIGHT_PAD = 144;
	const CORNER_R = 16;

	const FEEDBACK_W = 260;
	const FEEDBACK_H = 160;

	const CONTAINER_INNER_W = innerSteps.length * INNER_CARD_W + (innerSteps.length - 1) * INNER_GAP;
	const CONTAINER_W = CONTAINER_INNER_W + CONTAINER_PAD_X * 2;
	const CONTAINER_H = INNER_CARD_H + CONTAINER_PAD_TOP + CONTAINER_PAD_BOTTOM;

	const CONTAINER_X = 0;
	const CONTAINER_Y = TOP_CARD_H + TOP_GAP;

	const TOP_X = (CONTAINER_W - TOP_CARD_W) / 2;
	const TOP_CENTER_X = TOP_X + TOP_CARD_W / 2;
	const TOP_RIGHT_X = TOP_X + TOP_CARD_W;
	const TOP_MIDDLE_Y = TOP_CARD_H / 2;

	const INNER_ROW_Y = CONTAINER_Y + CONTAINER_PAD_TOP;
	const INNER_MIDDLE_Y = INNER_ROW_Y + INNER_CARD_H / 2;

	const innerX = (i: number) => CONTAINER_X + CONTAINER_PAD_X + i * (INNER_CARD_W + INNER_GAP);

	const CONTAINER_RIGHT_X = CONTAINER_X + CONTAINER_W;
	const CONTAINER_MIDDLE_Y = CONTAINER_Y + CONTAINER_H / 2;

	const LOOP_OUTER_X = CONTAINER_RIGHT_X + LOOP_RIGHT_PAD;

	const FEEDBACK_X = LOOP_OUTER_X - FEEDBACK_W / 2;
	const FEEDBACK_Y = (TOP_MIDDLE_Y + CONTAINER_MIDDLE_Y) / 2 - FEEDBACK_H / 2;
	const FEEDBACK_BOTTOM_Y = FEEDBACK_Y + FEEDBACK_H;

	const loopLowerPath = [
		`M ${CONTAINER_RIGHT_X} ${CONTAINER_MIDDLE_Y}`,
		`L ${LOOP_OUTER_X - CORNER_R} ${CONTAINER_MIDDLE_Y}`,
		`Q ${LOOP_OUTER_X} ${CONTAINER_MIDDLE_Y} ${LOOP_OUTER_X} ${CONTAINER_MIDDLE_Y - CORNER_R}`,
		`L ${LOOP_OUTER_X} ${FEEDBACK_BOTTOM_Y + 4}`
	].join(' ');

	const loopUpperPath = [
		`M ${LOOP_OUTER_X} ${FEEDBACK_Y - 4}`,
		`L ${LOOP_OUTER_X} ${TOP_MIDDLE_Y + CORNER_R}`,
		`Q ${LOOP_OUTER_X} ${TOP_MIDDLE_Y} ${LOOP_OUTER_X - CORNER_R} ${TOP_MIDDLE_Y}`,
		`L ${TOP_RIGHT_X} ${TOP_MIDDLE_Y}`
	].join(' ');

	const downArrowPath = `M ${TOP_CENTER_X} ${TOP_CARD_H + 4} L ${TOP_CENTER_X} ${CONTAINER_Y - 4}`;

	const VIEW_MARGIN = 20;
	const VIEW_X = -VIEW_MARGIN;
	const VIEW_Y = -VIEW_MARGIN;
	const VIEW_W = FEEDBACK_X + FEEDBACK_W + VIEW_MARGIN * 2;
	const VIEW_H = CONTAINER_Y + CONTAINER_H + VIEW_MARGIN * 2;

	const diagramReplica: DiagramConfig = {
		direction: 'LR',
		spacing: { cornerRadius: 14, nodeGap: 32, layerGap: 64 },
		ariaLabel: 'How DryUI works, rendered with the Diagram component',
		nodes: [
			{
				id: 'you',
				label: 'You',
				description: 'Write a prompt',
				iconComponent: User
			},
			{
				id: 'mcp',
				label: 'DryUI MCP',
				description: 'Look up components',
				iconComponent: Boxes
			},
			{
				id: 'preprocessor',
				label: 'Preprocessor',
				description: 'Lint Svelte output',
				iconComponent: ShieldCheck
			},
			{
				id: 'app',
				label: 'Your App',
				description: 'Render the UI',
				iconComponent: AppWindow
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
					description:
						'Annotate the running app in your browser. The agent reads your marks instantly via MCP — no screenshots, no retyping.',
					iconComponent: PenLine,
					color: 'brand'
				}
			}
		],
		clusters: [
			{
				id: 'agent',
				label: 'AI Agent',
				iconComponent: Sparkles,
				color: 'brand',
				nodes: ['mcp', 'preprocessor', 'app']
			}
		]
	};
</script>

<svelte:head>
	<title>DRY ui - Don't Repeat Yourself.</title>
</svelte:head>

<div class="page">
	<Container>
		<div class="page-stack">
			<div class="page-sections">
				<section class="hero">
					<div class="hero-copy">
						<div class="hero-copy-stack">
							<Text size="xs" color="secondary" weight="medium">DRY ui - Don't Repeat Yourself</Text
							>
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
						<Heading level={2}>How DRY ui works</Heading>
						<Text color="secondary">
							You prompt your AI agent. It queries the DryUI MCP for the right components. Generated
							Svelte runs through the lint preprocessor into your app — and feedback loops straight
							back to the agent.
						</Text>
					</div>
					<div class="workflow-canvas">
						<svg
							class="workflow-svg"
							viewBox="{VIEW_X} {VIEW_Y} {VIEW_W} {VIEW_H}"
							preserveAspectRatio="xMidYMin meet"
							role="img"
							aria-label="How DryUI works: you write a prompt; the AI agent uses the DryUI MCP to look up components, the preprocessor to lint its output, and your app to render the result; feedback from your app loops back to you."
						>
							<defs>
								<marker
									id="workflow-arrow"
									viewBox="0 0 12 10"
									refX="10"
									refY="5"
									markerWidth="11"
									markerHeight="10"
									orient="auto-start-reverse"
								>
									<path d="M 6.75 1.75 L 10 5 L 6.75 8.25" data-arrow-marker />
								</marker>
							</defs>

							<g data-part="container">
								<rect
									x={CONTAINER_X}
									y={CONTAINER_Y}
									width={CONTAINER_W}
									height={CONTAINER_H}
									rx="20"
									data-container-box
								/>
								<foreignObject
									x={CONTAINER_X + CONTAINER_PAD_X}
									y={CONTAINER_Y + 16}
									width={CONTAINER_INNER_W}
									height={24}
								>
									<div xmlns="http://www.w3.org/1999/xhtml" class="container-label">
										<Sparkles size={16} aria-hidden="true" />
										<span>AI Agent</span>
									</div>
								</foreignObject>
							</g>

							<path d={downArrowPath} data-step-stroke marker-end="url(#workflow-arrow)" />

							{#each innerSteps.slice(0, -1) as _, i (i)}
								<path
									d="M {innerX(i) + INNER_CARD_W + 4} {INNER_MIDDLE_Y} L {innerX(i + 1) -
										4} {INNER_MIDDLE_Y}"
									data-step-stroke
									marker-end="url(#workflow-arrow)"
								/>
							{/each}

							<path d={loopLowerPath} data-loop-stroke />
							<path d={loopUpperPath} data-loop-stroke marker-end="url(#workflow-arrow)" />

							<foreignObject x={FEEDBACK_X} y={FEEDBACK_Y} width={FEEDBACK_W} height={FEEDBACK_H}>
								<article
									xmlns="http://www.w3.org/1999/xhtml"
									class="step feedback-card"
									data-feedback=""
								>
									<span class="step-icon"><PenLine size={22} aria-hidden="true" /></span>
									<span class="step-title">Live Feedback</span>
									<span class="step-desc">
										Annotate the running app in your browser. The agent reads your marks instantly
										via MCP — no screenshots, no retyping.
									</span>
								</article>
							</foreignObject>

							<foreignObject x={TOP_X} y={0} width={TOP_CARD_W} height={TOP_CARD_H}>
								<article xmlns="http://www.w3.org/1999/xhtml" class="step">
									<span class="step-icon"><topStep.icon size={20} aria-hidden="true" /></span>
									<span class="step-title">{topStep.title}</span>
									<span class="step-desc">{topStep.description}</span>
								</article>
							</foreignObject>

							{#each innerSteps as step, i (step.id)}
								<foreignObject
									x={innerX(i)}
									y={INNER_ROW_Y}
									width={INNER_CARD_W}
									height={INNER_CARD_H}
								>
									<article xmlns="http://www.w3.org/1999/xhtml" class="step">
										<span class="step-icon"><step.icon size={20} aria-hidden="true" /></span>
										<span class="step-title">{step.title}</span>
										<span class="step-desc">{step.description}</span>
									</article>
								</foreignObject>
							{/each}
						</svg>
					</div>
				</section>

				<section class="workflow-section workflow-section--replica">
					<div class="workflow-copy">
						<Heading level={2}>Same flow, built with &lt;Diagram /&gt;</Heading>
						<Text color="secondary">
							The same workflow rendered by the upgraded <code>@dryui/ui</code>
							<code>&lt;Diagram /&gt;</code> component — lucide icons, sans-serif cards, rounded
							edges, brand-tinted cluster, solid white connectors, the back-edge looping cleanly
							over the top, and a <code>waypoint</code> Live Feedback card sitting on the loop. The only
							thing the hand-built version above still does that this can't is mix layout directions (top-card
							hierarchy + horizontal cluster contents).
						</Text>
					</div>
					<div class="workflow-canvas workflow-canvas--diagram">
						<Diagram config={diagramReplica} />
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
		grid-template-rows: auto auto auto auto;
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

	.workflow-svg {
		display: block;
		overflow: visible;
	}

	.workflow-svg [data-loop-stroke] {
		fill: none;
		stroke: var(--dry-color-text-weak);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.85;
	}

	.workflow-svg [data-step-stroke] {
		fill: none;
		stroke: var(--dry-color-text-weak);
		stroke-width: 1.5;
		stroke-linecap: round;
		opacity: 0.85;
	}

	.workflow-svg [data-arrow-marker] {
		fill: none;
		stroke: var(--dry-color-text-weak);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.workflow-svg [data-container-box] {
		fill: color-mix(in srgb, var(--dry-color-fill-brand) 5%, var(--dry-color-bg-base));
		stroke: color-mix(in srgb, var(--dry-color-stroke-brand) 60%, transparent);
		stroke-width: 1.2;
	}

	.workflow-svg .container-label {
		display: grid;
		grid-template-columns: auto auto;
		align-items: center;
		justify-content: start;
		gap: 8px;
		color: var(--dry-color-text-brand);
		font-family: var(--dry-font-sans);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.workflow-svg .feedback-card[data-feedback] {
		padding: 18px 22px;
		border-color: color-mix(in srgb, var(--dry-color-stroke-brand) 55%, transparent);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--dry-color-fill-brand) 12%, var(--dry-color-bg-base)),
			color-mix(in srgb, var(--dry-color-bg-base) 94%, transparent)
		);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--dry-color-stroke-brand) 25%, transparent);
		row-gap: 6px;
	}

	.workflow-svg .feedback-card[data-feedback] .step-icon {
		color: var(--dry-color-text-brand);
	}

	.workflow-svg .feedback-card[data-feedback] .step-title {
		font-size: 17px;
		color: var(--dry-color-text-brand);
	}

	.workflow-svg .feedback-card[data-feedback] .step-desc {
		font-size: 12.5px;
		line-height: 1.45;
		color: color-mix(in srgb, var(--dry-color-text-strong) 72%, transparent);
	}

	.workflow-svg .step {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto auto auto;
		row-gap: 4px;
		box-sizing: border-box;
		padding: 14px 18px;
		block-size: 100%;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 90%, transparent);
		border-radius: 16px;
		background: color-mix(in srgb, var(--dry-color-bg-base) 80%, transparent);
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
	}

	.workflow-svg .step-icon {
		display: grid;
		justify-content: start;
		align-items: center;
		color: var(--dry-color-text-weak);
	}

	.workflow-svg .step-title {
		font-size: 15px;
		font-weight: 600;
		line-height: 1.2;
	}

	.workflow-svg .step-desc {
		font-size: 12px;
		color: var(--dry-color-text-weak);
		line-height: 1.3;
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
