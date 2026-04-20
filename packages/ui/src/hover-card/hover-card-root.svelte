<script lang="ts">
	import type { HoverCardRootProps } from '@dryui/primitives';
	import { HoverCard as PrimitiveHoverCard } from '@dryui/primitives';

	// The styled hover-card only adds theme tokens to trigger/content, so root
	// is a pure re-export of the primitives implementation. The ctx set here is
	// consumed by the ui trigger/content via the shared primitives ctx key.
	let props: HoverCardRootProps = $props();
</script>

<PrimitiveHoverCard.Root {...props} />
