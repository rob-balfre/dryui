<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setStatCardCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
		density?: 'comfortable' | 'compact';
		children: Snippet;
	}

	let { tone = 'neutral', density = 'comfortable', children, ...rest }: Props = $props();

	setStatCardCtx({
		get tone() {
			return tone;
		},
		get density() {
			return density;
		}
	});
</script>

<div role="group" data-tone={tone} data-density={density} {...rest}>
	{@render children()}
</div>
