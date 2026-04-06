<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {}

	let { ...rest }: Props = $props();
</script>

<span aria-hidden="true" {...rest}>&hellip;</span>
