<script lang="ts">
	import { Select, Field, Label } from '@dryui/ui';

	let country = $state('');
	let region = $state('');
</script>

<div class="form">
	<Field.Root required>
		<Label>Billing country</Label>
		<Select.Root bind:value={country} name="country">
			<Select.Trigger>
				<Select.Value placeholder="Select a country" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="us">United States</Select.Item>
				<Select.Item value="ca">Canada</Select.Item>
				<Select.Item value="gb">United Kingdom</Select.Item>
				<Select.Item value="de">Germany</Select.Item>
				<Select.Item value="au">Australia</Select.Item>
				<Select.Item value="jp">Japan</Select.Item>
			</Select.Content>
		</Select.Root>
	</Field.Root>

	<Field.Root>
		<Label>Deploy region</Label>
		<Select.Root bind:value={region} name="region">
			<Select.Trigger>
				<Select.Value placeholder="Pick the closest region" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="sfo1">San Francisco (sfo1)</Select.Item>
				<Select.Item value="iad1">Washington, DC (iad1)</Select.Item>
				<Select.Item value="lhr1">London (lhr1)</Select.Item>
				<Select.Item value="fra1">Frankfurt (fra1)</Select.Item>
				<Select.Item value="syd1">Sydney (syd1)</Select.Item>
				<Select.Item value="nrt1" disabled>Tokyo (nrt1, waitlist)</Select.Item>
			</Select.Content>
		</Select.Root>
	</Field.Root>
</div>

<style>
	.form {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
