<script lang="ts">
	import { Checkbox, Fieldset } from '@dryui/ui';

	let cascade = $state(true);
	let preview = $state(false);
	let cron = $state(true);
	let analytics = $state(false);
</script>

<div class="panel">
	<Fieldset.Root>
		<Fieldset.Legend>Deploy permissions</Fieldset.Legend>
		<Fieldset.Description>
			Applies to API tokens created from this team. Changes take effect on the next rotation.
		</Fieldset.Description>
		<Fieldset.Content>
			<Checkbox bind:checked={cascade}>Cascade to downstream services</Checkbox>
			<Checkbox bind:checked={preview}>Allow preview environment deploys</Checkbox>
			<Checkbox bind:checked={cron}>Trigger scheduled cron jobs</Checkbox>
			<Checkbox bind:checked={analytics} disabled>
				Write to analytics warehouse (requires Pro plan)
			</Checkbox>
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
