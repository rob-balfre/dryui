<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'horizontal' | 'vertical';
	}

	let { orientation = 'horizontal', ...rest }: Props = $props();
</script>

<div role="separator" aria-orientation={orientation} data-orientation={orientation} {...rest}></div>
