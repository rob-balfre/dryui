<script lang="ts">
	import { onMount } from 'svelte';
	import type { LayoutBox } from './layout-inspector.svelte';

	interface Props {
		boxes: LayoutBox[];
	}

	let { boxes }: Props = $props();

	let viewScrollX = $state(0);
	let viewScrollY = $state(0);

	function syncScroll() {
		viewScrollX = window.scrollX;
		viewScrollY = window.scrollY;
	}

	onMount(() => {
		syncScroll();
		window.addEventListener('scroll', syncScroll, true);
		window.addEventListener('resize', syncScroll);
		return () => {
			window.removeEventListener('scroll', syncScroll, true);
			window.removeEventListener('resize', syncScroll);
		};
	});
</script>

<div class="layout-boxes-overlay" role="presentation">
	{#each boxes as b (b.id)}
		<div
			class="layout-box-readonly"
			style="left: {b.pageX - viewScrollX}px; top: {b.pageY -
				viewScrollY}px; width: {b.width}px; height: {b.height}px;"
		>
			<span class="layout-box-readonly-label">{b.label}</span>
		</div>
	{/each}
</div>

<style>
	.layout-boxes-overlay {
		position: fixed;
		inset: 0;
		z-index: 9998;
		pointer-events: none;
	}

	.layout-box-readonly {
		position: fixed;
		display: grid;
		place-items: center;
		border: 1.5px solid hsl(195 80% 60%);
		border-radius: 6px;
		background: hsl(195 80% 60% / 0.12);
		box-shadow:
			0 0 0 1px hsl(225 15% 8% / 0.6),
			0 8px 24px hsl(0 0% 0% / 0.25);
		pointer-events: none;
	}

	.layout-box-readonly-label {
		padding: 2px 10px;
		border: 1px solid hsl(195 80% 60%);
		border-radius: 4px;
		background: hsl(225 15% 8%);
		color: hsl(195 80% 88%);
		font-family: var(--dry-font-sans, system-ui, sans-serif);
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		line-height: 1.25;
		text-transform: lowercase;
	}
</style>
