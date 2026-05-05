<script lang="ts">
	import { Button } from '@dryui/ui';
</script>

<div class="row">
	<Button variant="solid">Solid</Button>
	<Button variant="outline">Outline</Button>
	<Button variant="ghost">Ghost</Button>
	<Button variant="solid" color="danger">Danger</Button>
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
