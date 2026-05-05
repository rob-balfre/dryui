<script lang="ts">
	import { Kbd } from '@dryui/ui';
</script>

<div class="row">
	<Kbd>Esc</Kbd>
	<Kbd>⌘</Kbd>
	<Kbd>K</Kbd>
	<Kbd>Shift</Kbd>
	<Kbd>Enter</Kbd>
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
