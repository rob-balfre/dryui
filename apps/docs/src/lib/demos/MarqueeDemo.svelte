<script lang="ts">
	import { Marquee } from '@dryui/ui';

	const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
</script>

<Marquee pauseOnHover fade gap="var(--dry-space-6)">
	<div class="lockup">
		{#each items as item (item)}
			<span>{item}</span>
		{/each}
	</div>
</Marquee>

<style>
	.lockup {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-6);
	}
</style>
