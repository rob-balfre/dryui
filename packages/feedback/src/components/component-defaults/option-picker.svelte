<script lang="ts">
	import { OptionPicker } from '@dryui/ui';
</script>

<OptionPicker.Root value="pro" columns={3}>
	<OptionPicker.Item value="hobby">
		<OptionPicker.Label>Hobby</OptionPicker.Label>
		<OptionPicker.Description>One project, community support.</OptionPicker.Description>
		<OptionPicker.Meta>$0 / forever</OptionPicker.Meta>
	</OptionPicker.Item>
	<OptionPicker.Item value="pro">
		<OptionPicker.Label>Pro</OptionPicker.Label>
		<OptionPicker.Description>Unlimited projects, email support.</OptionPicker.Description>
		<OptionPicker.Meta>$24 / month</OptionPicker.Meta>
	</OptionPicker.Item>
	<OptionPicker.Item value="team">
		<OptionPicker.Label>Team</OptionPicker.Label>
		<OptionPicker.Description>SSO, audit logs, shared envs.</OptionPicker.Description>
		<OptionPicker.Meta>$96 / month</OptionPicker.Meta>
	</OptionPicker.Item>
</OptionPicker.Root>
