<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
	let el: HTMLDivElement;

	$effect(() => {
		if (el) {
			ctx.registerViewport(el);

			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							const index = Array.from(el.children).indexOf(entry.target as HTMLElement);
							if (index >= 0) ctx.syncActiveIndex(index);
						}
					}
				},
				{ root: el, threshold: 0.5 }
			);

			for (const child of el.children) observer.observe(child);
			return () => observer.disconnect();
		}
	});
</script>

<div
	bind:this={el}
	data-carousel-viewport=""
	data-orientation={ctx.orientation}
	class={className}
	{...rest}
>
	{@render children()}
</div>
