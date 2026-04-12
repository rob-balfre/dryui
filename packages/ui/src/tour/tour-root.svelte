<script lang="ts">
	import './tour-root.css';

	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Tour as TourPrimitive, type TourStep } from '@dryui/primitives/tour';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		steps: TourStep[];
		active?: boolean;
		onComplete?: () => void;
		onSkip?: () => void;
		children: Snippet;
	}

	let { active = $bindable(false), children, ...rest }: Props = $props();
</script>

<TourPrimitive.Root bind:active data-part="root" {children} {...rest} />
