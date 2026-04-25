<script lang="ts">
	import { SelectableTileGroup } from '@dryui/primitives';
</script>

<SelectableTileGroup.Root value="standard">
	<SelectableTileGroup.Item value="starter">
		<SelectableTileGroup.Label>Starter</SelectableTileGroup.Label>
		<SelectableTileGroup.Description
			>For solo projects and prototypes.</SelectableTileGroup.Description
		>
		<SelectableTileGroup.Meta>$0 / month</SelectableTileGroup.Meta>
	</SelectableTileGroup.Item>
	<SelectableTileGroup.Item value="standard">
		<SelectableTileGroup.Indicator />
		<SelectableTileGroup.Label>Standard</SelectableTileGroup.Label>
		<SelectableTileGroup.Description
			>For small teams shipping weekly.</SelectableTileGroup.Description
		>
		<SelectableTileGroup.Meta>$24 / month</SelectableTileGroup.Meta>
	</SelectableTileGroup.Item>
	<SelectableTileGroup.Item value="scale">
		<SelectableTileGroup.Label>Scale</SelectableTileGroup.Label>
		<SelectableTileGroup.Description
			>For production workloads with on-call.</SelectableTileGroup.Description
		>
		<SelectableTileGroup.Meta>$96 / month</SelectableTileGroup.Meta>
	</SelectableTileGroup.Item>
</SelectableTileGroup.Root>
