<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { class: className, children, style, ...rest }: Props = $props();

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
		});
	}
</script>

<span
	class={className ? 'visuallyHidden ' + className : 'visuallyHidden'}
	use:applyStyles
	{...rest}
>
	{@render children()}
</span>

<style>
	.visuallyHidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
