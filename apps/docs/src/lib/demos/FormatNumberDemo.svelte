<script lang="ts">
	import { FormatNumber } from '@dryui/ui';
</script>

<div class="metrics">
	<section class="metric">
		<p class="eyebrow">Monthly revenue</p>
		<p class="figure">
			<FormatNumber value={1284650} type="currency" currency="USD" maximumFractionDigits={0} />
		</p>
		<p class="note">Up 8.4% from March. 312 active seats across 64 workspaces.</p>
	</section>

	<section class="metric">
		<p class="eyebrow">Requests per second</p>
		<p class="figure">
			<FormatNumber value={42680} notation="compact" />
		</p>
		<p class="note">p95 latency at 142 ms. Edge cache hit rate steady at 91%.</p>
	</section>

	<section class="metric">
		<p class="eyebrow">Error rate</p>
		<p class="figure">
			<FormatNumber value={0.0042} type="percent" maximumFractionDigits={2} />
		</p>
		<p class="note">Budget 0.50% remaining this window. No paging threshold hit.</p>
	</section>
</div>

<style>
	.metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--dry-space-3);
	}

	.metric {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}
	.figure {
		margin: 0;
		font-size: var(--dry-text-2xl-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
		font-variant-numeric: tabular-nums;
	}
	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
</style>
