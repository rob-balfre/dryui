<script lang="ts">
	import { Field, Label, Input, Checkbox } from '@dryui/ui';
</script>

<div class="form">
	<Field.Root>
		<Label size="sm">SSH key label</Label>
		<Input placeholder="macbook-air-2024" />
	</Field.Root>

	<Field.Root required>
		<Label>Primary email</Label>
		<Input type="email" value="rob@dryui.dev" />
	</Field.Root>

	<Field.Root>
		<Label size="lg">Enable experimental features</Label>
		<Checkbox checked={true}>Opt in to preview releases</Checkbox>
	</Field.Root>
</div>

<style>
	.form {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
