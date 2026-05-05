<script lang="ts">
	import { ProgressRing } from '@dryui/ui';
</script>

<div class="row">
	<ProgressRing value={25} max={100} size={72} strokeWidth={6} />
	<ProgressRing value={62} max={100} color="green" size={72} strokeWidth={6} />
	<ProgressRing indeterminate color="primary" size={72} strokeWidth={6} />
</div>

<style>
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}
</style>
