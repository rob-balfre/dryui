<script lang="ts">
	import { TableOfContents, Text } from '@dryui/ui';

	interface Props {
		selector?: string;
		headingSelector?: string;
	}

	let { selector = '.page-main', headingSelector = 'h2:not([data-toc-ignore] *)' }: Props =
		$props();
</script>

<div class="toc-root">
	<TableOfContents.Root
		{selector}
		{headingSelector}
		rootMargin="-80px 0px -60% 0px"
		aria-label="On this page"
	>
		<p class="toc-heading"><Text as="span" size="sm" weight="semibold">On This Page</Text></p>
		<TableOfContents.List />
	</TableOfContents.Root>
</div>

<style>
	.toc-root {
		position: sticky;
		top: var(--dry-space-12);
		max-height: calc(100dvh - var(--dry-space-16));
		overflow-y: auto;
	}

	.toc-heading {
		margin: 0 0 var(--dry-space-3);
	}
</style>
