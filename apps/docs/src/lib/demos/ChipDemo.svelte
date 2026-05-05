<script lang="ts">
	import { Chip } from '@dryui/ui';
</script>

<div class="row">
	<Chip color="blue">Default</Chip>
	<Chip color="green" variant="outline">Outline</Chip>
	<Chip color="orange">Tag</Chip>
	<Chip selected color="blue">Selected</Chip>
	<Chip color="gray" disabled>Disabled</Chip>
</div>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}
</style>
