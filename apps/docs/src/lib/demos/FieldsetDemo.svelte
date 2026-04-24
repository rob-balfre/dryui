<script lang="ts">
	import { Fieldset, Checkbox } from '@dryui/ui';

	let releases = $state(true);
	let incidents = $state(true);
	let digests = $state(false);
	let marketing = $state(false);
</script>

<div class="panel">
	<Fieldset.Root>
		<Fieldset.Legend>Notification routing</Fieldset.Legend>
		<Fieldset.Description>
			Choose which product events reach your Slack (#acme-releases). You can route individual
			categories to other channels from the integration settings.
		</Fieldset.Description>
		<Fieldset.Content>
			<Checkbox bind:checked={releases}>Release tags and hotfixes</Checkbox>
			<Checkbox bind:checked={incidents}>Incidents (sev-1 and sev-2 only)</Checkbox>
			<Checkbox bind:checked={digests}>Weekly usage digests</Checkbox>
			<Checkbox bind:checked={marketing}>Marketing newsletters</Checkbox>
		</Fieldset.Content>
	</Fieldset.Root>
</div>

<style>
	.panel {
		display: grid;
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}
</style>
