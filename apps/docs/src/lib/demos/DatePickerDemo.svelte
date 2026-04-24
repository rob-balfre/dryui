<script lang="ts">
	import { DatePicker } from '@dryui/ui';

	const today = new Date(2026, 3, 24);
	let scheduled = $state<Date | null>(new Date(2026, 4, 2));
</script>

<div class="card">
	<div class="heading">
		<p class="eyebrow">Scheduled release</p>
		<p class="title">Ship v1.4.0 to production on</p>
		<p class="note">Pipeline freezes after selection. Coordinate with on-call before confirming.</p>
	</div>
	<DatePicker.Root bind:value={scheduled} name="releaseDate" min={today}>
		<DatePicker.Trigger placeholder="Pick a ship date" />
		<DatePicker.Content>
			<DatePicker.Calendar />
		</DatePicker.Content>
	</DatePicker.Root>
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
