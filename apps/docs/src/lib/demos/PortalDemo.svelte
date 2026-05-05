<script lang="ts">
	import { Badge, Button, Portal } from '@dryui/ui';

	let portaled = $state(true);
	let targetEl: HTMLElement | undefined = $state();
	const canPortal = $derived(portaled && targetEl != null);
</script>

<div class="stack">
	<Button variant="outline" size="sm" onclick={() => (portaled = !portaled)}>
		{portaled ? 'Disable portal' : 'Enable portal'}
	</Button>

	<Portal target={targetEl ?? 'body'} disabled={!canPortal}>
		<Badge variant="solid" color="blue">Portaled content</Badge>
	</Portal>

	<div bind:this={targetEl} class="target" aria-label="Portal target"></div>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: start;
	}

	.target {
		min-block-size: var(--dry-space-8);
		min-inline-size: 12em;
	}
</style>
