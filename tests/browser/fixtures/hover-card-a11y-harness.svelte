<script lang="ts">
	import { HoverCard } from '@dryui/ui';
</script>

<HoverCard.Root openDelay={0} closeDelay={50}>
	<HoverCard.Trigger>Project status</HoverCard.Trigger>
	<HoverCard.Content>
		<p>Review the latest release notes.</p>
		<button type="button" data-hover-card-action>Open details</button>
	</HoverCard.Content>
</HoverCard.Root>
