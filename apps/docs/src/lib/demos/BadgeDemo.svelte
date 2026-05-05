<script lang="ts">
	import { Badge } from '@dryui/ui';
</script>

<div class="row">
	<Badge variant="soft">Default</Badge>
	<Badge variant="soft" color="green">Active</Badge>
	<Badge variant="soft" color="red" pulse>Live</Badge>
	<Badge variant="outline" color="orange">Pending</Badge>
	<Badge variant="outline" color="gray">Annual</Badge>
</div>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}
</style>
