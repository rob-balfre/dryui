<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Drawer } from '../../../packages/ui/src/drawer/index.js';

	let {
		initialOpen = false,
		side = 'right'
	}: { initialOpen?: boolean; side?: 'top' | 'right' | 'bottom' | 'left' } = $props();

	let open = $state(initialOpen);
</script>

<div data-testid="bound-open">{String(open)}</div>

<Drawer.Root bind:open {side}>
	<Drawer.Trigger data-testid="drawer-trigger">
		<button type="button">Open drawer</button>
	</Drawer.Trigger>
	<Drawer.Content data-testid="drawer-content">
		<Drawer.Header data-testid="drawer-header">
			<h2>Settings</h2>
		</Drawer.Header>
		<Drawer.Body data-testid="drawer-body">Drawer body content</Drawer.Body>
		<Drawer.Footer>
			<Drawer.Close data-testid="drawer-close">Close</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
