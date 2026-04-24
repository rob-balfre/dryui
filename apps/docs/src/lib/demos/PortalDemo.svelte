<script lang="ts">
	import { Badge, Button, Portal } from '@dryui/ui';

	let portaled = $state(true);
	let targetEl: HTMLElement | undefined = $state();
	const canPortal = $derived(portaled && targetEl != null);
</script>

<div class="stack">
	<div class="slot">
		<p class="eyebrow">Source location</p>
		<p class="note">Without a portal, the badge renders here inline with the parent tree.</p>
		<Portal target={targetEl ?? 'body'} disabled={!canPortal}>
			<Badge variant="solid" color="blue">Portaled content</Badge>
		</Portal>
	</div>

	<div class="slot slot-target">
		<p class="eyebrow">Portal target</p>
		<p class="note">When enabled, the badge teleports into this element regardless of the tree.</p>
		<div bind:this={targetEl} class="target-slot" aria-label="Portal target"></div>
	</div>

	<Button variant="outline" size="sm" onclick={() => (portaled = !portaled)}>
		{portaled ? 'Disable portal' : 'Enable portal'}
	</Button>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.slot {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		border: 1px dashed color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 24%, transparent);
	}

	.slot-target {
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 40%, transparent);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	.target-slot {
		min-block-size: var(--dry-space-8);
	}
</style>
