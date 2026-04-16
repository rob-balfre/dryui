<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Alert, type AlertProps, type AlertVariant } from '@dryui/ui';

	type AlertSnippet = NonNullable<AlertProps['title']>;

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
	title={title ? (renderTitle as AlertSnippet) : undefined}
	description={description ? (renderDescription as AlertSnippet) : undefined}
>
	{#if children}
		{@render children()}
	{/if}
</Alert>
