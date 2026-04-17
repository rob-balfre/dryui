<script lang="ts">
	import type { Snippet } from 'svelte';
	import { variantAttrs } from '@dryui/primitives';

	interface Props {
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		color?: 'primary' | 'muted' | 'current';
		label?: string;
		class?: string;
		children: Snippet;
	}

	let { size = 'md', color = 'current', label, class: className, children }: Props = $props();

	function sizeSvg(node: HTMLElement) {
		const svg = node.querySelector('svg');
		if (svg) {
			svg.style.width = '100%';
			svg.style.height = '100%';
		}
	}
</script>

<span
	role={label ? 'img' : 'presentation'}
	aria-label={label}
	aria-hidden={label ? undefined : true}
	{...variantAttrs({ size, color })}
	class={className}
	use:sizeSvg
>
	{@render children()}
</span>

<style>
	span {
		display: inline-grid;
		place-items: center;
		aspect-ratio: 1;
		height: var(--dry-icon-size, var(--dry-space-5));
		color: var(--dry-icon-color, currentColor);
		line-height: 0;
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	span[data-size='xs'] {
		--dry-icon-size: var(--dry-space-3);
	}

	span[data-size='sm'] {
		--dry-icon-size: var(--dry-space-4);
	}

	span[data-size='md'] {
		--dry-icon-size: var(--dry-space-5);
	}

	span[data-size='lg'] {
		--dry-icon-size: var(--dry-space-6);
	}

	span[data-size='xl'] {
		--dry-icon-size: var(--dry-space-8);
	}

	/* ── Colors ────────────────────────────────────────────────────────────────── */

	span[data-color='primary'] {
		--dry-icon-color: var(--dry-color-fill-brand);
	}

	span[data-color='muted'] {
		--dry-icon-color: var(--dry-color-text-weak);
	}

	span[data-color='current'] {
		--dry-icon-color: currentColor;
	}
</style>
