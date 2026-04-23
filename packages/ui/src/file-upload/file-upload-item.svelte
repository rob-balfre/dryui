<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLLIElement> {
		file: File;
		index: number;
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { file, index, children, class: className, size = 'md', ...rest }: Props = $props();
</script>

<li class={className} data-index={index} {...rest}>
	{@render children()}
</li>

<style>
	[data-fu-item] {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
		font-size: var(--dry-type-small-size);
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		background: var(--dry-color-bg-raised);
		/* dryui-allow solid-border-on-raised: uploaded file rows need a visible item boundary in dense lists. */
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
	}

	[data-fu-item][data-size='sm'] {
		padding: var(--dry-space-2);
		font-size: var(--dry-type-tiny-size);
		border-radius: var(--dry-radius-sm);
	}

	[data-fu-item][data-size='lg'] {
		padding: var(--dry-space-4);
		font-size: var(--dry-type-heading-4-size);
		border-radius: var(--dry-radius-lg);
	}

	[data-fu-item-name] {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 500;
	}

	[data-fu-item-size] {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-tiny-size);
	}

	@container (max-width: 300px) {
		[data-fu-item] {
			padding: var(--dry-space-2);
		}
	}
</style>
