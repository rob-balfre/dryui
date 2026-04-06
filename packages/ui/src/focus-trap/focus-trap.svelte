<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { FocusTrap as FocusTrapPrimitive } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		active?: boolean;
		initialFocus?: string;
		returnFocus?: boolean;
		children?: Snippet;
	}

	let { active, initialFocus, returnFocus, children, ...rest }: Props = $props();
</script>

<FocusTrapPrimitive {active} {initialFocus} {returnFocus} {children} {...rest} />
