<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		color?: 'primary' | 'muted' | 'current';
		label?: string;
		children: Snippet;
	}

	let {
		size = 'md',
		color = 'current',
		label,
		class: className,
		children,
		...rest
	}: Props = $props();

	function sizeSvg(node: HTMLElement) {
		const svg = node.querySelector('svg');
		if (svg) {
			svg.style.width = '100%';
			svg.style.height = '100%';
		}
	}
</script>

<span
	data-dry-icon=""
	role={label ? 'img' : 'presentation'}
	aria-label={label}
	aria-hidden={label ? undefined : true}
	{...variantAttrs({ size, color })}
	class={className}
	{...rest}
	use:sizeSvg
>
	{@render children()}
</span>

<style>
	span {
		--_icon-size-default: var(--dry-space-5);
		--_icon-color-default: currentColor;

		display: inline-grid;
		place-items: center;
		aspect-ratio: 1;
		height: var(--dry-icon-size, var(--_icon-size-default));
		color: var(--dry-icon-color, var(--_icon-color-default));
		line-height: 0;
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	span[data-size='xs'] {
		--_icon-size-default: var(--dry-space-3);
	}

	span[data-size='sm'] {
		--_icon-size-default: var(--dry-space-4);
	}

	span[data-size='md'] {
		--_icon-size-default: var(--dry-space-5);
	}

	span[data-size='lg'] {
		--_icon-size-default: var(--dry-space-6);
	}

	span[data-size='xl'] {
		--_icon-size-default: var(--dry-space-8);
	}

	/* ── Colors ────────────────────────────────────────────────────────────────── */

	span[data-color='primary'] {
		--_icon-color-default: var(--dry-color-fill-brand);
	}

	span[data-color='muted'] {
		--_icon-color-default: var(--dry-color-text-weak);
	}

	span[data-color='current'] {
		--_icon-color-default: currentColor;
	}
</style>
