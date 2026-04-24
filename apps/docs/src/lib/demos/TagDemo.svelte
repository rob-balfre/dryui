<script lang="ts">
	import { Tag } from '@dryui/ui';

	const labelColor = { 'needs-qa': 'orange', backend: 'purple' } as const;
	let labels = $state(['auth', 'api', 'backend', 'needs-qa']);

	function dismiss(value: string) {
		labels = labels.filter((l) => l !== value);
	}
</script>

<div class="card">
	<div class="heading">
		<p class="eyebrow">Issue #1284</p>
		<p class="title">Rotate signing keys before next release</p>
	</div>

	<div class="tags">
		{#each labels as label (label)}
			<Tag
				color={labelColor[label as keyof typeof labelColor] ?? 'blue'}
				dismissible
				onDismiss={() => dismiss(label)}
			>
				{label}
			</Tag>
		{/each}
		<Tag variant="outline" color="gray">+ add label</Tag>
	</div>
</div>

<style>
	.card {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.heading {
		display: grid;
		gap: var(--dry-space-1);
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

	.tags {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}
</style>
