<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label: string;
		children: Snippet;
	}

	let { label, class: className, children, ...rest }: Props = $props();
</script>

<div role="group" aria-label={label} data-notification-center-group class={className} {...rest}>
	<div role="presentation" data-part="group-header">
		{label}
	</div>
	{@render children()}
</div>
