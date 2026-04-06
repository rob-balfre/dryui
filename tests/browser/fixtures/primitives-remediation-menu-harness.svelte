<script lang="ts">
	import { ContextMenu } from '../../../packages/primitives/src/context-menu/index.js';
	import { DropdownMenu } from '../../../packages/primitives/src/dropdown-menu/index.js';
	import { Select } from '../../../packages/primitives/src/select/index.js';
</script>

<Select.Root open disabled>
	<Select.Trigger>
		<button type="button" data-testid="select-trigger">Choose option</button>
	</Select.Trigger>
	<Select.Content>
		<Select.Item value="alpha" disabled data-testid="select-disabled-item">Alpha</Select.Item>
	</Select.Content>
</Select.Root>

<DropdownMenu.Root open>
	<DropdownMenu.Trigger>
		<button type="button">Actions</button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item disabled data-testid="dropdown-disabled-item">Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<ContextMenu.Root open>
	<ContextMenu.Trigger>
		<div>Target</div>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Item disabled data-testid="context-disabled-item">Archive</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>
