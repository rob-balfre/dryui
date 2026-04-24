<script lang="ts">
	import { Listbox, Field, Label } from '@dryui/ui';

	let scopes = $state<string[]>(['deployments:read', 'projects:read']);
</script>

<div class="panel">
	<Field.Root>
		<Label>API token scopes</Label>
		<Listbox.Root multiple bind:value={scopes}>
			<Listbox.Item value="deployments:read">deployments:read</Listbox.Item>
			<Listbox.Item value="deployments:write">deployments:write</Listbox.Item>
			<Listbox.Item value="projects:read">projects:read</Listbox.Item>
			<Listbox.Item value="projects:write">projects:write</Listbox.Item>
			<Listbox.Item value="secrets:read">secrets:read</Listbox.Item>
			<Listbox.Item value="secrets:write" disabled>secrets:write (requires 2FA)</Listbox.Item>
		</Listbox.Root>
		<Field.Description>
			Granting {scopes.length} of 6 scopes. Tokens inherit team membership.
		</Field.Description>
	</Field.Root>
</div>

<style>
	.panel {
		display: grid;
	}
</style>
