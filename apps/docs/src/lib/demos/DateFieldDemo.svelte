<script lang="ts">
	import { DateField } from '@dryui/ui';

	const today = new Date(2026, 3, 24);
	let trialEnds = $state<Date | null>(new Date(2026, 4, 8));
</script>

<div class="card">
	<div class="heading">
		<p class="eyebrow">Trial extension</p>
		<p class="title">When should billing start?</p>
		<p class="note">Segments respect locale order. Tab or arrow keys to move between them.</p>
	</div>
	<DateField.Root bind:value={trialEnds} name="trialEnds" min={today} size="md">
		<DateField.Segment type="month" />
		<DateField.Separator />
		<DateField.Segment type="day" />
		<DateField.Separator />
		<DateField.Segment type="year" />
	</DateField.Root>
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
	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
</style>
