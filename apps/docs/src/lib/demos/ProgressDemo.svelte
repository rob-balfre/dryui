<script lang="ts">
	import { Progress } from '@dryui/ui';
</script>

<div class="stack">
	<Progress value={25} max={100} />
	<Progress value={60} max={100} color="blue" />
	<Progress value={88} max={100} color="green" />
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
	}
</style>
