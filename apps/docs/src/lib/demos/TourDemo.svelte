<script lang="ts">
	import { Button, Tour } from '@dryui/ui';

	let active = $state(false);

	const steps = [
		{
			target: '#tour-step-1',
			title: 'Step 1',
			content: 'First step in the tour.',
			placement: 'bottom' as const
		},
		{
			target: '#tour-step-2',
			title: 'Step 2',
			content: 'Second step in the tour.',
			placement: 'bottom' as const
		}
	];
</script>

<div class="stack">
	<Button variant="solid" onclick={() => (active = true)}>Start tour</Button>

	<div class="targets">
		<div id="tour-step-1" class="target">Target 1</div>
		<div id="tour-step-2" class="target">Target 2</div>
	</div>
</div>

<Tour.Root bind:active {steps}>
	<Tour.Tooltip />
</Tour.Root>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-4);
		justify-items: start;
	}

	.targets {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-3);
	}

	.target {
		padding: var(--dry-space-3) var(--dry-space-4);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-overlay);
		color: var(--dry-color-text-strong);
		font-size: var(--dry-text-sm-size);
	}
</style>
