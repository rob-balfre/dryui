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
</Alert.Root>

<style>
	.callout-content {
		display: grid;
		gap: var(--dry-space-2);
		margin-top: var(--dry-space-2);
	}
</style>
