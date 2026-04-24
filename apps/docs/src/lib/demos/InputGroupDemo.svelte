<script lang="ts">
	import { InputGroup, Field, Label } from '@dryui/ui';

	let subdomain = $state('acme');
	let amount = $state('249');
	let apiKey = $state('sk_live_4f8a22d0c3e7');
</script>

<div class="form">
	<Field.Root>
		<Label>Custom subdomain</Label>
		<InputGroup.Root>
			<InputGroup.Prefix>https://</InputGroup.Prefix>
			<InputGroup.Input bind:value={subdomain} />
			<InputGroup.Suffix>.dryui.app</InputGroup.Suffix>
		</InputGroup.Root>
	</Field.Root>

	<Field.Root>
		<Label>Monthly spend cap</Label>
		<InputGroup.Root>
			<InputGroup.Prefix>$</InputGroup.Prefix>
			<InputGroup.Input bind:value={amount} />
			<InputGroup.Suffix>USD</InputGroup.Suffix>
			<InputGroup.Separator />
			<InputGroup.Action>Apply</InputGroup.Action>
		</InputGroup.Root>
	</Field.Root>

	<Field.Root>
		<Label>API key</Label>
		<InputGroup.Root>
			<InputGroup.Input bind:value={apiKey} />
			<InputGroup.Separator />
			<InputGroup.Action>Copy</InputGroup.Action>
			<InputGroup.Action>Rotate</InputGroup.Action>
		</InputGroup.Root>
	</Field.Root>
</div>

<style>
	.form {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
