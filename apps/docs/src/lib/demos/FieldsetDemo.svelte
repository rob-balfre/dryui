<script>
	import { Fieldset, Checkbox } from '@dryui/ui';
</script>

<Fieldset.Root>
	<Fieldset.Legend>Notification preferences</Fieldset.Legend>
	<Fieldset.Description>Choose how updates reach your team.</Fieldset.Description>
	<Fieldset.Content>
		<Checkbox checked={true}>Email digests</Checkbox>
		<Checkbox>SMS alerts</Checkbox>
	</Fieldset.Content>
</Fieldset.Root>
