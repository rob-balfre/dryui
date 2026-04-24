<script lang="ts">
	import { Button, Glow, Text } from '@dryui/ui';

	const regions = [
		{ id: 'us-east', label: 'us-east-1', city: 'N. Virginia', latency: '12ms' },
		{ id: 'eu-west', label: 'eu-west-1', city: 'Dublin', latency: '28ms' },
		{ id: 'ap-south', label: 'ap-south-1', city: 'Mumbai', latency: '94ms' }
	] as const;

	let selected = $state<(typeof regions)[number]['id']>('us-east');
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Pick deploy region</p>
		<Text color="secondary" size="sm">
			Glow marks the active choice so the selection reads at a glance, even on the brand surface.
		</Text>
	</div>

	<div class="grid" role="radiogroup" aria-label="Deploy region">
		{#each regions as region (region.id)}
			{#if selected === region.id}
				<Glow intensity={62} radius={18}>
					<Button variant="solid" onclick={() => (selected = region.id)} aria-pressed="true">
						<span class="tile-body">
							<span class="label">{region.label}</span>
							<span class="city">{region.city}</span>
							<span class="latency">{region.latency}</span>
						</span>
					</Button>
				</Glow>
			{:else}
				<Button variant="outline" onclick={() => (selected = region.id)} aria-pressed="false">
					<span class="tile-body">
						<span class="label">{region.label}</span>
						<span class="city">{region.city}</span>
						<span class="latency">{region.latency}</span>
					</span>
				</Button>
			{/if}
		{/each}
	</div>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
	}

	.head {
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

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: var(--dry-space-3);
	}

	.tile-body {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-2) var(--dry-space-1);
		text-align: start;
	}

	.label {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.city {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.latency {
		justify-self: start;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-bg-base) 72%, transparent);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
</style>
