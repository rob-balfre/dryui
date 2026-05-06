<script lang="ts">
	import { asset } from '$app/paths';
	import { Button, CodeBlock, Container, Diagram, Heading, Text } from '@dryui/ui';
	import type { DiagramConfig } from '@dryui/ui';
	import { AppWindow, Boxes, PenLine, ShieldCheck, Sparkles, User } from 'lucide-svelte';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import { withBase } from '$lib/utils';

	const feedbackCode = `dryui feedback
# agent or CI shell
dryui feedback --no-open`;

	const workflowDiagram: DiagramConfig = {
		direction: 'TB',
		spacing: { cornerRadius: 16, nodeGap: 28, layerGap: 112, backEdgeLaneGap: 240 },
		ariaLabel: 'How DryUI works, rendered with the Diagram component',
		nodes: [
			{
				id: 'you',
				label: 'You',
				description: 'Write a prompt',
				iconComponent: User,
				width: 280,
				height: 144
			},
			{
				id: 'mcp',
				label: 'DryUI MCP',
				description: 'Look up components',
				iconComponent: Boxes,
				width: 236,
				height: 152
			},
			{
				id: 'preprocessor',
				label: 'DryUI Linter',
				description: 'Lint component output',
				iconComponent: ShieldCheck,
				width: 236,
				height: 152
			},
			{
				id: 'app',
				label: 'Your App',
				description: 'Render the UI',
				iconComponent: AppWindow,
				width: 236,
				height: 152
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
					width: 420,
					height: 172,
					position: 0.36
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
				spacing: { nodeGap: 24, clusterPadding: 32 },
				nodes: ['mcp', 'preprocessor', 'app']
			}
		]
	};

	function clipEntryToCluster(node: HTMLElement) {
		const apply = () => {
			const svg = node.querySelector('svg');
			if (!svg) return;
			const cluster = svg.querySelector<SVGRectElement>('[data-part="cluster-box"]');
			if (!cluster) return;
			const right =
				parseFloat(cluster.getAttribute('x') ?? '0') +
				parseFloat(cluster.getAttribute('width') ?? '0');
			const paths = svg.querySelectorAll<SVGPathElement>('[data-part="edge-path"]');
			for (const path of paths) {
				const d = path.getAttribute('d') ?? '';
				const match = d.match(/^M\s+([\d.-]+)\s+([\d.-]+)\s+L\s+([\d.-]+)\s+([\d.-]+)/);
				if (!match || match.length < 5) continue;
				const x1 = match[1] as string;
				const y1 = match[2] as string;
				const x2 = match[3] as string;
				const y2 = match[4] as string;
				const startX = parseFloat(x1);
				const endX = parseFloat(x2);
				if (y1 !== y2) continue;
				if (startX < right && endX > right) {
					path.setAttribute('d', d.replace(/^M\s+[\d.-]+\s+[\d.-]+/, `M ${right} ${y1}`));
				}
			}
		};
		apply();
		const observer = new MutationObserver(apply);
		observer.observe(node, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['d']
		});
		return () => observer.disconnect();
	}

	const feedbackScreenshots = [
		{
			src: '/screenshots/feedback/sample-feedback-toolbar.png',
			alt: 'Sample DryUI app with the feedback toolbar open',
			title: 'Open the app in feedback mode',
			caption:
				'The feedback widget sits on top of the running app and provides annotation, component, move, and erase tools.'
		},
		{
			src: '/screenshots/feedback/sample-feedback-annotation.png',
			alt: 'Sample DryUI app with an orange freehand circle, arrow, and text note',
			title: 'Mark the exact change',
			caption:
				'Drawings, arrows, and text notes stay attached to the current page so the agent can read the visual intent, not just a written summary.'
		},
		{
			src: '/screenshots/feedback/sample-feedback-dashboard.png',
			alt: 'Feedback dashboard showing a pending submission, notes, screenshot thumbnail, and agent prompt',
			title: 'Dispatch from the queue',
			caption:
				'Submissions include the captured screenshot, annotation counts, text notes, and a ready prompt for the feedback resolver.'
		}
	] as const;
</script>

<svelte:head>
	<title>Feedback loop · DryUI</title>
</svelte:head>

<Container>
	<div class="stack-xl">
		<DocsPageHeader
			title="Feedback loop"
			description="Run the app, collect visual annotations from reviewers, and turn each submission into a focused agent task."
		/>

		<section>
			<Heading level={2}>How it works</Heading>
			<Text color="secondary">
				Prompt in. UI out. Visual feedback flows straight back to your agent.
			</Text>

			<div class="workflow-canvas" {@attach clipEntryToCluster}>
				<Diagram config={workflowDiagram} />
			</div>
			<Text size="xs" color="secondary">
				This is the
				<a class="workflow-link" href={withBase('/components/diagram')}
					><code>&lt;Diagram /&gt;</code></a
				> component. Drop it into your app.
			</Text>
		</section>

		<section class="stack-md">
			<Heading level={2}>Start feedback mode</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				Feedback mode runs your app and the local feedback server together. Reviewers draw on the
				actual page, submit a screenshot with structured annotations, and the dashboard keeps the
				result ready for the feedback resolver.
			</Text>
			<CodeBlock code={feedbackCode} language="bash" />
		</section>

		<section class="feedback-flow">
			<div class="surface">
				<div class="stack-sm">
					<Heading level={3}>Local by default</Heading>
					<Text color="secondary">
						The server uses port 4748 by default and stores queue data under
						<code>.dryui/feedback</code> in the project.
					</Text>
				</div>
			</div>
			<div class="surface">
				<div class="stack-sm">
					<Heading level={3}>Agent-readable</Heading>
					<Text color="secondary">
						Each submission keeps the screenshot, drawings, page URL, viewport, scroll offset, text
						notes, and DOM hints together.
					</Text>
				</div>
			</div>
			<div class="surface">
				<div class="stack-sm">
					<Heading level={3}>Resolvable</Heading>
					<Text color="secondary">
						The feedback skill fetches one pending submission, applies the smallest matching change,
						runs the relevant project check, then marks it resolved.
					</Text>
				</div>
			</div>
		</section>

		<section class="stack-md">
			<Heading level={2}>Capture and resolve</Heading>
			<div class="feedback-shots">
				{#each feedbackScreenshots as shot (shot.src)}
					<figure class="feedback-shot">
						<div class="feedback-frame">
							<img src={asset(shot.src)} alt={shot.alt} loading="lazy" width="1365" height="900" />
						</div>
						<figcaption class="stack-sm">
							<Text as="span" weight="semibold">{shot.title}</Text>
							<Text as="span" size="sm" color="secondary">{shot.caption}</Text>
						</figcaption>
					</figure>
				{/each}
			</div>
		</section>

		<div class="feedback-action">
			<Button variant="solid" color="ink" size="md" href={withBase('/getting-started')}>
				Back to Getting Started
			</Button>
		</div>
	</div>
</Container>

<style>
	.feedback-flow,
	.feedback-shots,
	.feedback-shot,
	.feedback-frame,
	.feedback-shot figcaption {
		display: grid;
	}

	.feedback-flow {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: var(--dry-space-4);
	}

	.surface {
		padding: var(--dry-padding-card);
		background: var(--dry-color-bg-raised);
		border-radius: var(--dry-radius-card);
		box-shadow: var(--dry-shadow-sm);
	}

	.feedback-shots {
		gap: var(--dry-space-6);
	}

	.feedback-shot {
		gap: var(--dry-space-3);
		margin: 0;
	}

	.feedback-frame {
		overflow: hidden;
		aspect-ratio: 91 / 60;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-sunken);
	}

	.feedback-frame img {
		display: block;
		block-size: 100%;
	}

	.feedback-action {
		justify-self: start;
	}

	.workflow {
		display: grid;
		grid-template-columns: minmax(0, 72rem);
		justify-content: center;
		gap: var(--dry-space-6);
		justify-items: center;
	}

	.workflow-head {
		display: grid;
		grid-template-columns: minmax(0, 36rem);
		gap: var(--dry-space-2);
		justify-items: center;
		text-align: center;
	}

	.workflow-link {
		color: inherit;
		text-decoration: none;
		transition: color 150ms;
	}

	.workflow-link:hover {
		color: var(--dry-color-fill-brand);
	}

	.workflow-canvas {
		justify-self: stretch;
		display: grid;
		--dry-diagram-node-bg: color-mix(in srgb, var(--dry-color-bg-base) 82%, transparent);
		--dry-diagram-node-border: color-mix(in srgb, var(--dry-color-stroke-weak) 92%, transparent);
		--dry-diagram-edge-color: color-mix(in srgb, var(--dry-color-text-strong) 92%, transparent);
		--dry-diagram-node-padding: 24px 24px;
		--dry-diagram-node-padding-with-description: 26px 24px;
		--dry-diagram-node-padding-mobile: 18px 22px;
		--dry-diagram-node-padding-with-description-mobile: 20px 24px;
		--dry-diagram-node-gap: 12px;
		--dry-diagram-node-gap-with-description: 10px;
		--dry-diagram-node-label-size: 1.25rem;
		--dry-diagram-node-label-size-with-description: 1.5rem;
		--dry-diagram-node-description-size: 1rem;
		--dry-diagram-cluster-label-size: 0.9375rem;
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
</style>
