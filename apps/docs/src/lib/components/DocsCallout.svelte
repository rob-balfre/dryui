<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Alert } from '@dryui/ui';

	interface Props {
		title?: string;
		description?: string;
		variant?: 'info' | 'success' | 'warning' | 'error';
		children?: Snippet;
	}

	let { title, description, variant = 'info', children }: Props = $props();
</script>

<Alert.Root {variant}>
	<div class="callout-stack">
		{#if title}
			<Alert.Title>{title}</Alert.Title>
		{/if}
		{#if description}
			<Alert.Description>{description}</Alert.Description>
		{/if}
		{#if children}
			<div class="callout-content">
				{@render children()}
			</div>
		{/if}
	</div>
</Alert.Root>

<style>
	.callout-stack {
		display: grid;
		gap: var(--dry-space-2);
		grid-column: 1 / -1;
	}

	.callout-content {
		display: block;
	}
</style>
