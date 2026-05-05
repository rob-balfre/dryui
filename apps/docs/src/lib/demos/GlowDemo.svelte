<script lang="ts">
	import { Button, Glow } from '@dryui/ui';
</script>

<div class="row">
	<Glow intensity={62} radius={18}>
		<Button variant="solid">Highlighted</Button>
	</Glow>
	<Button variant="outline">Default</Button>
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
