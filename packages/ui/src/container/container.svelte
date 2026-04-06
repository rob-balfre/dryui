<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		padding?: boolean;
		children: Snippet;
	}

	let { size = 'lg', padding = true, class: className, children, ...rest }: Props = $props();
</script>

<div data-size={size} data-padding={padding || undefined} class={className} {...rest}>
	{@render children()}
</div>

<style>
	div {
		--dry-container-padding: var(--dry-space-4);

		container-type: inline-size;
		display: grid;
		justify-content: center;
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	div[data-size='sm'] {
		grid-template-columns: minmax(0, 640px);
	}

	div[data-size='md'] {
		grid-template-columns: minmax(0, 768px);
	}

	div[data-size='lg'] {
		grid-template-columns: minmax(0, 1024px);
	}

	div[data-size='xl'] {
		grid-template-columns: minmax(0, 1280px);
	}

	div[data-size='full'] {
		grid-template-columns: minmax(0, 1fr);
	}

	/* ── Padding ───────────────────────────────────────────────────────────────── */

	div[data-padding] {
		padding-inline: var(--dry-container-padding);
	}

	@container (max-width: 640px) {
		div[data-padding] {
			--dry-container-padding: var(--dry-space-4);
		}
	}

	@container (min-width: 641px) {
		div[data-padding] {
			--dry-container-padding: var(--dry-space-6);
		}
	}
</style>
