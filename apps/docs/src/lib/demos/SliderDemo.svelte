<script lang="ts">
	import { Slider, Field, Label } from '@dryui/ui';

	let rate = $state(180);
	let rollout = $state(35);
</script>

<div class="stack">
	<Field.Root>
		<Label>Rate limit (requests per second)</Label>
		<Slider bind:value={rate} min={60} max={600} step={10} />
		<p class="meta">{rate} rps, bursts up to {rate * 2}</p>
	</Field.Root>

	<Field.Root>
		<Label>Canary rollout</Label>
		<Slider bind:value={rollout} min={0} max={100} step={5} />
		<p class="meta">
			{rollout}% of traffic on <code>v1.8.0-rc.3</code>, the rest on <code>v1.7.4</code>.
		</p>
	</Field.Root>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-5);
	}

	.meta {
		margin: var(--dry-space-1) 0 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-strong);
	}
</style>
