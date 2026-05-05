<script lang="ts">
	import { Gauge } from '@dryui/ui';
</script>

<div class="row">
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
</div>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.gauge-value {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-base-size);
		fill: var(--dry-color-text-strong);
	}
</style>
