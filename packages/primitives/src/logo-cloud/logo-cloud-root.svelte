<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		columns?: number;
		gap?: string;
		align?: 'start' | 'center' | 'end';
		children: Snippet;
	}

	let { columns = 5, gap, align, class: className, children, ...rest }: Props = $props();

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--logo-cloud-columns', String(columns));
			if (gap) node.style.setProperty('--logo-cloud-gap', gap);
			if (align) node.style.setProperty('--logo-cloud-align', align);
		});
	}
</script>

<div class={className} use:applyStyles {...rest}>
	{@render children()}
</div>
