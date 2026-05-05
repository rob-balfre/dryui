<script lang="ts">
	import { Tag } from '@dryui/ui';
</script>

<div class="row">
	<Tag color="blue">Blue</Tag>
	<Tag color="green">Green</Tag>
	<Tag color="orange">Orange</Tag>
	<Tag color="purple">Purple</Tag>
	<Tag color="red">Red</Tag>
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
