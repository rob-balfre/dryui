<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Portal as PortalPrimitive } from '@dryui/primitives';

	interface Props {
		target?: string | HTMLElement;
		disabled?: boolean;
		children: Snippet;
	}

	let { target, disabled, children }: Props = $props();
</script>

<PortalPrimitive {target} {disabled} {children} />
