<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { HoverCard as PrimitiveHoverCard } from '@dryui/primitives';

	// The styled hover-card only adds theme tokens to trigger/content, so root
	// is a pure re-export of the primitives implementation. The ctx set here is
	// consumed by the ui trigger/content via the shared primitives ctx key.
	let props: ComponentProps<typeof PrimitiveHoverCard.Root> = $props();
</script>

<PrimitiveHoverCard.Root {...props} />
