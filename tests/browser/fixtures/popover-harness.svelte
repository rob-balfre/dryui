<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Popover } from '../../../packages/ui/src/popover/index.js';

	let open = $state(false);
	let confirmCount = $state(0);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<button type="button" data-testid="popover-trigger">Details</button>
	</Popover.Trigger>

	<Popover.Content data-testid="popover-content">
		<label>
			Notes
			<input data-testid="popover-input" />
		</label>
		<button
			type="button"
			data-testid="popover-action"
			onclick={() => {
				confirmCount += 1;
			}}
		>
			Confirm
		</button>
	</Popover.Content>
</Popover.Root>

<output data-testid="popover-open">{String(open)}</output>
<output data-testid="popover-confirm-count">{confirmCount}</output>
