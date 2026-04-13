<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Alert, type AlertVariant } from '@dryui/ui';

	interface Props {
		title?: string;
		description?: string;
		variant?: AlertVariant;
		children?: Snippet;
	}

	let { title, description, variant = 'info', children }: Props = $props();
</script>

{#snippet renderTitle()}{title}{/snippet}
{#snippet renderDescription()}{description}{/snippet}

<Alert
	{variant}
	title={title ? renderTitle : undefined}
	description={description ? renderDescription : undefined}
>
	{#if children}
		{@render children()}
	{/if}
</Alert>
