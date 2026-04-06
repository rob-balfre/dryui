<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		label?: string;
		children: Snippet;
	}

	let { label, children, ...rest }: Props = $props();
</script>

<span
	role={label ? 'img' : 'presentation'}
	aria-label={label}
	aria-hidden={label ? undefined : true}
	{...rest}
>
	{@render children()}
</span>
