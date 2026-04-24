<script lang="ts">
	import { FormatDate } from '@dryui/ui';

	const invoiceDate = new Date('2026-04-04T18:30:00Z');
	const paidAt = new Date('2026-04-07T09:12:00Z');
	const dueAt = new Date('2026-05-04T00:00:00Z');
</script>

<dl class="card">
	<p class="eyebrow">Invoice INV-2041</p>
	<div class="row">
		<dt class="label">Issued</dt>
		<dd class="value">
			<FormatDate
				date={invoiceDate}
				dateStyle="full"
				timeStyle="short"
				timeZone="Australia/Sydney"
			/>
		</dd>
	</div>
	<div class="row">
		<dt class="label">Paid</dt>
		<dd class="value">
			<FormatDate date={paidAt} dateStyle="medium" timeStyle="short" />
		</dd>
	</div>
	<div class="row">
		<dt class="label">Next due</dt>
		<dd class="value">
			<FormatDate date={dueAt} weekday="short" month="short" day="numeric" />
		</dd>
	</div>
</dl>

<style>
	.card {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
		margin: 0;
	}

	.eyebrow {
		margin: 0 0 var(--dry-space-2);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.row {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		align-items: baseline;
		gap: var(--dry-space-3);
	}

	.label {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}
	.value {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		font-variant-numeric: tabular-nums;
	}
</style>
