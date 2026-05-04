<script lang="ts">
	import { asset } from '$app/paths';
	import { Button, CodeBlock, Container, Heading, Text } from '@dryui/ui';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import { withBase } from '$lib/utils';

	const feedbackCode = `dryui setup --open-feedback
# agent or CI shell
dryui setup --open-feedback --no-open`;

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
						runs <code>dryui check</code>, then marks it resolved.
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
</style>
