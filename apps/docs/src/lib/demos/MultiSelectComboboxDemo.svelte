<script lang="ts">
	import { MultiSelectCombobox, Field, Label } from '@dryui/ui';

	const events = [
		'deployment.created',
		'deployment.succeeded',
		'deployment.failed',
		'build.started',
		'build.canceled',
		'incident.opened',
		'incident.resolved'
	];

	let selected = $state<string[]>(['deployment.failed', 'incident.opened']);
	let query = $state('');

	const filteredEvents = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return events;
		return events.filter((event) => event.toLowerCase().includes(q));
	});
</script>

<div class="panel">
	<Field.Root>
		<Label>Webhook events</Label>
		<MultiSelectCombobox.Root bind:value={selected} bind:query name="events">
			<MultiSelectCombobox.SelectionList>
				{#each selected as item (item)}
					<MultiSelectCombobox.SelectionItem value={item}>
						{item}
						<MultiSelectCombobox.SelectionRemove value={item} label={item} />
					</MultiSelectCombobox.SelectionItem>
				{/each}
			</MultiSelectCombobox.SelectionList>

			<MultiSelectCombobox.Input placeholder="Filter events..." />
			<MultiSelectCombobox.Content>
				{#each filteredEvents as event (event)}
					<MultiSelectCombobox.Item value={event}>{event}</MultiSelectCombobox.Item>
				{:else}
					<MultiSelectCombobox.Empty>No events match "{query}".</MultiSelectCombobox.Empty>
				{/each}
			</MultiSelectCombobox.Content>
		</MultiSelectCombobox.Root>
		<Field.Description>
			Delivers {selected.length} event types to <code>https://hooks.dryui.dev/zapier</code>.
		</Field.Description>
	</Field.Root>
</div>

<style>
	.panel {
		display: grid;
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-strong);
	}
</style>
