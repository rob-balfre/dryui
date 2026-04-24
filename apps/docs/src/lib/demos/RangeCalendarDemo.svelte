<script lang="ts">
	import { RangeCalendar } from '@dryui/ui';

	let startDate = $state<Date | null>(new Date(2026, 3, 14));
	let endDate = $state<Date | null>(new Date(2026, 3, 18));
</script>

<div class="card">
	<div class="heading">
		<p class="eyebrow">Incident window</p>
		<p class="title">INC-2041 retention sweep</p>
		<p class="note">Select the range to export audit logs for the postmortem packet.</p>
	</div>
	<RangeCalendar.Root bind:startDate bind:endDate>
		<RangeCalendar.Grid />
	</RangeCalendar.Root>
</div>

<style>
	.card {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
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
