<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		padding?: 'none' | 'md' | 'lg';
		scroll?: boolean;
	}

	let { children, padding = 'lg', scroll = false }: Props = $props();
</script>

<div class="preview-frame" class:is-scrollable={scroll} data-padding={padding}>
	<div class="preview-body">
		{@render children()}
	</div>
</div>

<style>
	.preview-frame {
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-base);
		content-visibility: auto;
		contain-intrinsic-size: 24rem;
	}

	.preview-frame.is-scrollable {
		overflow: auto;
	}

	.preview-frame:not(.is-scrollable) {
		overflow: hidden;
	}

	.preview-frame[data-padding='lg'] .preview-body {
		padding: var(--dry-space-6);
	}

	.preview-frame[data-padding='md'] .preview-body {
		padding: var(--dry-space-4);
	}
</style>
