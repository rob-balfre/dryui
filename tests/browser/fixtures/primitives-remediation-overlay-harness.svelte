<script lang="ts">
	import { Popover } from '../../../packages/primitives/src/popover/index.js';
	import { Tooltip } from '../../../packages/primitives/src/tooltip/index.js';
</script>

<Tooltip.Root openDelay={0} closeDelay={0}>
	<Tooltip.Trigger data-testid="tooltip-wrapper">
		<button type="button" data-testid="tooltip-button">Show tooltip</button>
	</Tooltip.Trigger>
	<Tooltip.Content data-testid="tooltip-content">Tooltip body</Tooltip.Content>
</Tooltip.Root>

<Popover.Root>
	<Popover.Trigger data-testid="popover-wrapper">
		<button type="button" data-testid="popover-button">Open popover</button>
	</Popover.Trigger>
	<Popover.Content data-testid="popover-content">Popover body</Popover.Content>
</Popover.Root>
