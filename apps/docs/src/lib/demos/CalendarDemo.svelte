<script lang="ts">
	import { Calendar } from '@dryui/ui';

	let nextInvoice = $state<Date | null>(new Date(2026, 4, 18));
</script>

<div class="card">
	<div class="heading">
		<p class="eyebrow">Billing cycle</p>
		<p class="title">Next invoice on the Pro plan</p>
		<p class="note">
			Pick a billing day between the 1st and the 28th to keep renewals predictable.
		</p>
	</div>
	<Calendar.Root bind:value={nextInvoice} min={new Date(2026, 0, 1)} max={new Date(2026, 11, 28)}>
		<Calendar.Header>
			<Calendar.Prev />
			<Calendar.Heading />
			<Calendar.Next />
		</Calendar.Header>
		<Calendar.Grid />
	</Calendar.Root>
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
