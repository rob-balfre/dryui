<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { DropdownMenu } from '../../../packages/ui/src/dropdown-menu/index.js';

	let open = $state(false);
	let lastAction = $state('none');

	function recordAction(action: string) {
		lastAction = action;
	}
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger>
		<button type="button" data-testid="dropdown-menu-trigger">Actions</button>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content data-testid="dropdown-menu-content">
		<DropdownMenu.Label data-testid="dropdown-menu-label">Quick actions</DropdownMenu.Label>
		<DropdownMenu.Group>
			<DropdownMenu.Item data-testid="dropdown-menu-item-edit" onclick={() => recordAction('edit')}>
				Edit
			</DropdownMenu.Item>
			<DropdownMenu.Item
				data-testid="dropdown-menu-item-disabled"
				disabled
				onclick={() => recordAction('disabled')}
			>
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator data-testid="dropdown-menu-separator" />
		<DropdownMenu.Item data-testid="dropdown-menu-item-share" onclick={() => recordAction('share')}>
			Share
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<output data-testid="dropdown-menu-open">{String(open)}</output>
<output data-testid="dropdown-menu-last-action">{lastAction}</output>
