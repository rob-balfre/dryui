<script lang="ts">
	import { Badge } from '@dryui/ui/badge';
	import { Heading } from '@dryui/ui/heading';
	import { Table } from '@dryui/ui/table';
	import { Text } from '@dryui/ui/text';

	interface PropDef {
		type: string;
		required?: boolean;
		default?: string;
		bindable?: boolean;
		acceptedValues?: string[];
		description?: string;
		note?: string;
	}

	interface ForwardedPropsDef {
		note: string;
		examples?: string[];
		omitted?: string[];
	}

	interface PartDef {
		name: string;
		props: Record<string, PropDef>;
		forwardedProps?: ForwardedPropsDef | null;
	}

	interface Props {
		props?: Record<string, PropDef>;
		forwardedProps?: ForwardedPropsDef | null;
		groups?: { name: string; props: string[] }[] | null;
		parts?: PartDef[] | null;
	}

	let { props, forwardedProps = null, groups = null, parts = null }: Props = $props();

	function getGroupedSections(): { name: string | null; entries: [string, PropDef][] }[] {
		if (!props) return [];
		if (groups) {
			return groups
				.map((group) => ({
					name: group.name,
					entries: group.props
						.filter((p) => p in props)
						.map((p) => [p, props[p]] as [string, PropDef])
				}))
				.filter((section) => section.entries.length > 0);
		}
		return [{ name: null, entries: Object.entries(props) }];
	}
</script>

{#snippet propRows(entries: [string, PropDef][])}
	{#each entries as [name, def] (name)}
		<Table.Row>
			<Table.Cell>
				<Badge variant="soft" color="gray" size="sm"><span class="mono">{name}</span></Badge>
			</Table.Cell>
			<Table.Cell>
				<div class="type-stack">
					{#if def.acceptedValues?.length}
						<div class="accepted-values">
							{#each def.acceptedValues as value (value)}
								<span class="accepted-chip">
									<Badge variant="outline" color="gray" size="sm">{value}</Badge>
								</span>
							{/each}
						</div>
					{:else}
						<Text as="span" color="secondary" size="sm"><span class="mono">{def.type}</span></Text>
					{/if}
					{#if def.note}
						<Text as="span" size="xs" color="muted">{def.note}</Text>
					{/if}
				</div>
			</Table.Cell>
			<Table.Cell>
				{#if def.description}
					<Text as="span" color="muted">{def.description}</Text>
				{:else}
					<Text as="span" color="muted">—</Text>
				{/if}
			</Table.Cell>
			<Table.Cell>
				{#if def.default !== undefined}
					<Text as="span" color="secondary" size="sm"><span class="mono">{def.default}</span></Text>
				{:else}
					<Text as="span" color="muted">—</Text>
				{/if}
			</Table.Cell>
			<Table.Cell>
				{#if def.required}
					<Text as="span" color="secondary">✓</Text>
				{:else}
					<Text as="span" color="muted">—</Text>
				{/if}
			</Table.Cell>
			<Table.Cell>
				{#if def.bindable}
					<Text as="span" color="secondary">✓</Text>
				{:else}
					<Text as="span" color="muted">—</Text>
				{/if}
			</Table.Cell>
		</Table.Row>
	{/each}
{/snippet}

{#snippet singleTable(entries: [string, PropDef][])}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head scope="col">Prop</Table.Head>
				<Table.Head scope="col">Type</Table.Head>
				<Table.Head scope="col">Description</Table.Head>
				<Table.Head scope="col">Default</Table.Head>
				<Table.Head scope="col">Required</Table.Head>
				<Table.Head scope="col">Bindable</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{@render propRows(entries)}
		</Table.Body>
	</Table.Root>
{/snippet}

<div class="props-table-root">
	{#if parts}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head scope="col">Prop</Table.Head>
					<Table.Head scope="col">Type</Table.Head>
					<Table.Head scope="col">Description</Table.Head>
					<Table.Head scope="col">Default</Table.Head>
					<Table.Head scope="col">Required</Table.Head>
					<Table.Head scope="col">Bindable</Table.Head>
				</Table.Row>
			</Table.Header>
			{#each parts as part (part.name)}
				<Table.Body>
					<tr class="part-header-row">
						<td colspan="6">
							<Heading level={4}>{part.name}</Heading>
						</td>
					</tr>
					{@render propRows(Object.entries(part.props))}
				</Table.Body>
			{/each}
		</Table.Root>
	{:else}
		{#each getGroupedSections() as section (section.name ?? '__ungrouped')}
			{#if section.name}
				<div class="group-section">
					<span class="group-header-label">{section.name}</span>
					{@render singleTable(section.entries)}
				</div>
			{:else}
				{@render singleTable(section.entries)}
			{/if}
		{/each}
	{/if}
</div>

<style>
	.props-table-root {
		display: grid;
		gap: var(--dry-space-6);
	}

	.group-section {
		display: grid;
		gap: var(--dry-space-3);
	}

	.group-header-label {
		font-size: var(--dry-text-xs-size);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--dry-color-fill-brand);
		font-weight: 600;
	}

	.type-stack {
		display: grid;
		gap: var(--dry-space-1);
	}

	.accepted-chip {
		display: inline-block;
		margin: 0 var(--dry-space-1) var(--dry-space-1) 0;
	}

	.part-header-row td {
		padding: var(--dry-space-4) var(--dry-space-3) var(--dry-space-2);
		border-bottom: 1px solid var(--dry-color-stroke-weak);
	}

	.mono {
		font-family: var(--dry-font-mono);
		font-size: 0.9em;
	}
</style>
