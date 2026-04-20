<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Tooltip } from '../../../packages/ui/src/tooltip/index.js';

	let {
		openDelay = 40,
		closeDelay = 30
	}: {
		openDelay?: number;
		closeDelay?: number;
	} = $props();
</script>

<Tooltip.Root {openDelay} {closeDelay}>
	<Tooltip.Trigger data-testid="tooltip-trigger-wrap">
		<button type="button" data-testid="tooltip-trigger">Hover target</button>
	</Tooltip.Trigger>
	<Tooltip.Content data-testid="tooltip-content">Helpful context</Tooltip.Content>
</Tooltip.Root>
