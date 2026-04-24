<script lang="ts">
	import { Gauge } from '@dryui/ui';
</script>

<div class="grid">
	<section class="card">
		<Gauge
			value={99.94}
			min={99}
			max={100}
			thresholds={[
				{ value: 99.5, color: 'red' },
				{ value: 99.9, color: 'orange' },
				{ value: 100, color: 'green' }
			]}
		>
			{#snippet label({ value })}
				<tspan class="gauge-value">{value.toFixed(2)}%</tspan>
			{/snippet}
		</Gauge>
		<div class="meta">
			<p class="eyebrow">Status page</p>
			<p class="title">30-day uptime</p>
			<p class="note">SLO 99.9%. Tracking well against the April budget.</p>
		</div>
	</section>

	<section class="card">
		<Gauge
			value={142}
			min={0}
			max={500}
			thresholds={[
				{ value: 150, color: 'green' },
				{ value: 300, color: 'orange' },
				{ value: 500, color: 'red' }
			]}
		>
			{#snippet label({ value })}
				<tspan class="gauge-value">{Math.round(value)}ms</tspan>
			{/snippet}
		</Gauge>
		<div class="meta">
			<p class="eyebrow">Edge latency</p>
			<p class="title">p95 response time</p>
			<p class="note">Rolling 5 min window, north-america-1. Threshold pages at 300ms.</p>
		</div>
	</section>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--dry-space-3);
	}

	.card {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.meta {
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
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
	.note {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.4;
	}

	.gauge-value {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-base-size);
		fill: var(--dry-color-text-strong);
	}
</style>
