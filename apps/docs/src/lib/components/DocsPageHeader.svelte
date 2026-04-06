<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Heading, Text } from '@dryui/ui';

	interface Props {
		title: string;
		description?: string;
		eyebrow?: Snippet;
		meta?: Snippet;
		children?: Snippet;
	}

	let { title, description, eyebrow, meta, children }: Props = $props();
</script>

<header class="page-header">
	<div class="page-header-content">
		{#if eyebrow}
			<div class="page-eyebrow">
				{@render eyebrow()}
			</div>
		{/if}

		<div class="page-title-group">
			<div class="page-title">
				<Heading level={1}>{title}</Heading>
			</div>
			{#if description}
				<div class="page-description">
					<Text size="lg" color="secondary">{description}</Text>
				</div>
			{/if}
		</div>

		{#if meta}
			<div class="page-meta">
				{@render meta()}
			</div>
		{/if}

		{@render children?.()}
	</div>
</header>

<style>
	.page-header {
		padding-top: var(--dry-space-4);
	}

	.page-header-content {
		display: grid;
		gap: var(--dry-space-4);
	}

	.page-title-group {
		display: grid;
		gap: var(--dry-space-2);
	}

	.page-title {
		margin: 0;
		font-size: clamp(2rem, 4vw, 2.75rem);
		letter-spacing: -0.03em;
	}

	.page-description {
		display: grid;
		grid-template-columns: minmax(0, 64ch);
		line-height: 1.7;
	}
</style>
