<script lang="ts">
	import { DateRangePicker } from '@dryui/ui';

	let startDate = $state<Date | null>(new Date(2026, 3, 14));
	let endDate = $state<Date | null>(new Date(2026, 3, 21));
</script>

<div class="card">
	<div class="heading">
		<p class="eyebrow">Usage report</p>
		<p class="title">Export API traffic between</p>
		<p class="note">CSV is generated for the selected window. Rows above 5M are zipped per day.</p>
	</div>
	<DateRangePicker.Root bind:startDate bind:endDate>
		<DateRangePicker.Trigger placeholder="Pick a reporting range" />
		<DateRangePicker.Content>
			<DateRangePicker.Calendar />
		</DateRangePicker.Content>
	</DateRangePicker.Root>
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
