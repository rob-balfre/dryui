<script lang="ts">
	import { Progress } from '@dryui/ui';
</script>

<div class="rows">
	<section class="row">
		<div class="heading">
			<p class="title">API calls this month</p>
			<p class="meta">1.48M of 2.00M included</p>
		</div>
		<Progress value={74} max={100} color="blue" />
	</section>

	<section class="row">
		<div class="heading">
			<p class="title">Object storage used</p>
			<p class="meta">412 GB of 500 GB</p>
		</div>
		<Progress value={82.4} max={100} color="yellow" />
	</section>

	<section class="row">
		<div class="heading">
			<p class="title">Error budget remaining</p>
			<p class="meta">12% of 30-day window</p>
		</div>
		<Progress value={12} max={100} color="red" />
	</section>
</div>

<style>
	.rows {
		display: grid;
		gap: var(--dry-space-3);
	}

	.row {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.heading {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: baseline;
		gap: var(--dry-space-3);
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
	.meta {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}
</style>
