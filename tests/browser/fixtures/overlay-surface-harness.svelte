<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { AlertDialog } from '../../../packages/ui/src/alert-dialog/index.js';
	import { CommandPalette } from '../../../packages/ui/src/command-palette/index.js';
	import { Dialog } from '../../../packages/ui/src/dialog/index.js';
	import { Drawer } from '../../../packages/ui/src/drawer/index.js';

	type OverlayKind = 'alert-dialog' | 'dialog' | 'drawer' | 'command-palette';

	let { kind }: { kind: OverlayKind } = $props();
</script>

{#if kind === 'alert-dialog'}
	<AlertDialog.Root open={true}>
		<AlertDialog.Overlay />
		<AlertDialog.Content>
			<AlertDialog.Header>Delete account?</AlertDialog.Header>
			<AlertDialog.Body>This action cannot be undone.</AlertDialog.Body>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action>Delete</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{:else if kind === 'dialog'}
	<Dialog.Root open={true}>
		<Dialog.Overlay />
		<Dialog.Content>
			<Dialog.Header>Edit profile</Dialog.Header>
			<Dialog.Body>Profile settings go here.</Dialog.Body>
			<Dialog.Footer>
				<Dialog.Close>Cancel</Dialog.Close>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else if kind === 'drawer'}
	<Drawer.Root open={true} side="right">
		<Drawer.Overlay />
		<Drawer.Content>
			<Drawer.Header>Navigation</Drawer.Header>
			<Drawer.Body>Drawer content</Drawer.Body>
			<Drawer.Footer>
				<Drawer.Close>Close</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<CommandPalette.Root open={true}>
		<CommandPalette.Input placeholder="Search commands" />
		<CommandPalette.List>
			<CommandPalette.Group heading="Actions">
				<CommandPalette.Item value="open">Open file</CommandPalette.Item>
			</CommandPalette.Group>
		</CommandPalette.List>
	</CommandPalette.Root>
{/if}
