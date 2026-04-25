<script lang="ts">
	import { Fieldset, Field, Label, Input } from '@dryui/ui';
</script>

<Fieldset.Root>
	<Fieldset.Legend>Account</Fieldset.Legend>
	<Fieldset.Description>Personal details for your profile.</Fieldset.Description>
	<Fieldset.Content>
		<Field.Root>
			<Label>Name</Label>
			<Input placeholder="Jane Doe" />
		</Field.Root>
		<Field.Root>
			<Label>Email</Label>
			<Input type="email" placeholder="jane@example.com" />
		</Field.Root>
	</Fieldset.Content>
</Fieldset.Root>
