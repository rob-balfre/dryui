<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Dialog } from '../../../packages/ui/src/dialog/index.js';

	let { initialOpen: open = false }: { initialOpen?: boolean } = $props();
</script>

<div data-testid="bound-open">{String(open)}</div>

<Dialog.Root bind:open>
	<Dialog.Trigger data-testid="dialog-trigger">
		<button type="button">Open dialog</button>
	</Dialog.Trigger>
	<Dialog.Content data-testid="dialog-content">
		<Dialog.Header data-testid="dialog-header">
			<h2>Confirm action</h2>
		</Dialog.Header>
		<Dialog.Body data-testid="dialog-body">Are you sure?</Dialog.Body>
		<Dialog.Footer>
			<Dialog.Close data-testid="dialog-close">Cancel</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
