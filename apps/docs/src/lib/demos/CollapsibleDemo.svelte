<script lang="ts">
	import { Collapsible, Field, Input, Label, Select } from '@dryui/ui';

	let region = $state('us-east-1');
</script>

<form class="form">
	<Field.Root>
		<Label>Project name</Label>
		<Input value="atlas-web" />
	</Field.Root>

	<Field.Root>
		<Label>Region</Label>
		<Select.Root bind:value={region}>
			<Select.Trigger>
				<Select.Value placeholder="Choose a region" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="us-east-1">us-east-1 (N. Virginia)</Select.Item>
				<Select.Item value="eu-west-1">eu-west-1 (Ireland)</Select.Item>
				<Select.Item value="ap-southeast-2">ap-southeast-2 (Sydney)</Select.Item>
			</Select.Content>
		</Select.Root>
	</Field.Root>

	<Collapsible.Root>
		<Collapsible.Trigger>Advanced options</Collapsible.Trigger>
		<Collapsible.Content>
			<div class="advanced">
				<Field.Root>
					<Label>Build command</Label>
					<Input value="bun run build" />
				</Field.Root>

				<Field.Root>
					<Label>Output directory</Label>
					<Input value=".svelte-kit/output" />
				</Field.Root>

				<Field.Root>
					<Label>Node version</Label>
					<Input value="20.11.0" />
				</Field.Root>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
</form>

<style>
	.form {
		display: grid;
		gap: var(--dry-space-4);
	}

	.advanced {
		display: grid;
		gap: var(--dry-space-3);
		padding-top: var(--dry-space-3);
	}
</style>
