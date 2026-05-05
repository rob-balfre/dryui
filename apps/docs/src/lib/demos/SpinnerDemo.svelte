<script lang="ts">
	import { Spinner } from '@dryui/ui';
</script>

<div class="row">
	<Spinner size="sm" label="Loading" />
	<Spinner size="md" label="Loading" />
	<Spinner size="lg" label="Loading" />
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
