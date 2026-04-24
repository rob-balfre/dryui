<script lang="ts">
	import { Badge, Button, Tour } from '@dryui/ui';

	let active = $state(false);

	const steps = [
		{
			target: '#tour-env',
			title: 'Pick a starting environment',
			content: 'Every project starts with preview. Promote when you are ready to invite teammates.',
			placement: 'bottom' as const
		},
		{
			target: '#tour-keys',
			title: 'Grab your first API key',
			content: 'Scoped to this project. Rotate any time without downtime for existing sessions.',
			placement: 'top' as const
		},
		{
			target: '#tour-deploy',
			title: 'Ship the starter app',
			content: 'One command and the sample repo is live. You can always delete it later.',
			placement: 'left' as const
		}
	];
</script>

<div class="layout">
	<div class="actions">
		<Button variant="solid" onclick={() => (active = true)}>Start onboarding</Button>
	</div>

	<div class="grid">
		<article id="tour-env" class="tile">
			<p class="eyebrow">Step 1</p>
			<p class="title">Environment</p>
			<p class="body">preview. us-east-1.</p>
			<Badge variant="soft" size="sm">Free tier</Badge>
		</article>

		<article id="tour-keys" class="tile">
			<p class="eyebrow">Step 2</p>
			<p class="title">API keys</p>
			<p class="body">No keys yet. Create the first one when you deploy.</p>
			<Badge variant="outline" size="sm">0 active</Badge>
		</article>

		<article id="tour-deploy" class="tile">
			<p class="eyebrow">Step 3</p>
			<p class="title">First deploy</p>
			<p class="body">Starter repo is ready. Ship it in under 60 seconds.</p>
			<Badge variant="outline" size="sm">Pending</Badge>
		</article>
	</div>
</div>

<Tour.Root bind:active {steps}>
	<Tour.Tooltip />
</Tour.Root>

<style>
	.layout {
		display: grid;
		gap: var(--dry-space-4);
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
	}

	.tile {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
		align-content: start;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.body {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.55;
	}

	@container (max-width: 42rem) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
