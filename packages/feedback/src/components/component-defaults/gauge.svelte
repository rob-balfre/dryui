<script lang="ts">
	import { Gauge } from '@dryui/ui';
</script>

<Gauge value={72} max={100} style="--dry-gauge-size: 7rem;">
	{#snippet label({ percentage })}
		<span style="font-size: var(--dry-type-small-size); font-weight: 700;">
			{Math.round(percentage)}%
		</span>
	{/snippet}
</Gauge>
