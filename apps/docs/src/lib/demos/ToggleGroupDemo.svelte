<script lang="ts">
	import { ToggleGroup, Field, Label } from '@dryui/ui';

	let events = $state<string[]>(['push', 'release']);
</script>

<div class="panel">
	<Field.Root>
		<Label>Webhook events</Label>
		<ToggleGroup.Root type="multiple" bind:value={events}>
			<ToggleGroup.Item value="push">push</ToggleGroup.Item>
			<ToggleGroup.Item value="pull_request">pull_request</ToggleGroup.Item>
			<ToggleGroup.Item value="release">release</ToggleGroup.Item>
			<ToggleGroup.Item value="deployment">deployment</ToggleGroup.Item>
			<ToggleGroup.Item value="issue">issue</ToggleGroup.Item>
		</ToggleGroup.Root>
	</Field.Root>
	<p class="note">
		Delivering {events.length} event {events.length === 1 ? 'type' : 'types'} to
		<code>https://hooks.dryui.dev/gh</code>.
	</p>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-strong);
	}
</style>
