<script lang="ts">
	import { Button, Tag, type TagColor } from '@dryui/ui';

	const availableLabels = [
		'auth',
		'api',
		'backend',
		'needs-qa',
		'security',
		'release',
		'docs'
	] as const;
	type IssueLabel = (typeof availableLabels)[number];
	const labelColor: Partial<Record<IssueLabel, TagColor>> = {
		'needs-qa': 'orange',
		backend: 'purple',
		security: 'green',
		release: 'red'
	};
	let labels = $state<IssueLabel[]>(['auth', 'api', 'backend', 'needs-qa']);
	const canAddLabel = $derived(availableLabels.some((label) => !labels.includes(label)));

	function dismiss(value: IssueLabel) {
		labels = labels.filter((l) => l !== value);
	}

	function addLabel() {
		const nextLabel = availableLabels.find((label) => !labels.includes(label));
		if (!nextLabel) return;
		labels = [...labels, nextLabel];
	}
</script>

<div class="card">
	<div class="heading">
		<p class="eyebrow">Issue #1284</p>
		<p class="title">Rotate signing keys before next release</p>
	</div>

	<div class="tags">
		{#each labels as label (label)}
			<Tag color={labelColor[label] ?? 'blue'} dismissible onDismiss={() => dismiss(label)}>
				{label}
			</Tag>
		{/each}
		<span class="add-label">
			<Button variant="outline" size="sm" disabled={!canAddLabel} onclick={addLabel}>
				+ add label
			</Button>
		</span>
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

	.add-label {
		--dry-btn-accent-fg: var(--dry-color-text-weak);
		--dry-btn-accent-stroke: var(--dry-color-stroke-weak);
		--dry-btn-font-size: var(--dry-type-tiny-size);
		--dry-btn-min-height: var(--dry-space-6);
		--dry-btn-padding-x: var(--dry-space-2);
		--dry-btn-padding-y: var(--dry-space-0_5);
		--dry-btn-radius: var(--dry-radius-2xl);
	}
</style>
