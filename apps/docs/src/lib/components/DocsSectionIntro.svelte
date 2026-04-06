<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Heading, Text } from '@dryui/ui';

	interface Props {
		title: string;
		description?: string;
		id?: string;
		children?: Snippet;
	}

	let { title, description, id, children }: Props = $props();
</script>

<div class="section-intro">
	<Heading level={2} {id}>{title}</Heading>
	{#if description}
		<div class="section-copy">
			<Text color="secondary">{description}</Text>
		</div>
	{/if}
	{@render children?.()}
</div>

<style>
	.section-intro {
		display: grid;
		gap: var(--dry-space-2);
	}

	.section-copy {
		display: grid;
		grid-template-columns: minmax(0, 64ch);
		line-height: 1.6;
	}
</style>
