<script lang="ts">
	import { Portal, Button, Card, Badge, Text } from '@dryui/ui';
	import DocsDemo from '$lib/components/DocsDemo.svelte';

	let portaled = $state(true);
	let targetEl: HTMLElement | undefined = $state();
	let canPortal = $derived(portaled && targetEl != null);
</script>

<DocsDemo>
	<div class="source">
		<Text color="secondary" size="sm">Source location</Text>
		<Card.Root>
			<Card.Content>
				<div class="source-inner">
					<Text>Content renders here when <code>disabled</code></Text>
					<Portal target={targetEl ?? 'body'} disabled={!canPortal}>
						<Badge color="blue" variant="solid">I am portaled content</Badge>
					</Portal>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="target-area">
		<Text color="secondary" size="sm">Portal target</Text>
		<Card.Root>
			<Card.Content>
				<div bind:this={targetEl} class="target-slot"></div>
			</Card.Content>
		</Card.Root>
	</div>

	<Button variant="outline" size="sm" onclick={() => (portaled = !portaled)}>
		{portaled ? 'Disable portal (render inline)' : 'Enable portal (teleport)'}
	</Button>
</DocsDemo>

<style>
	.source-inner {
		display: grid;
		gap: var(--dry-space-2);
	}

	.source-inner code {
		font-size: var(--dry-text-sm-size);
	}

	.target-slot {
		min-height: var(--dry-space-8);
	}
</style>
