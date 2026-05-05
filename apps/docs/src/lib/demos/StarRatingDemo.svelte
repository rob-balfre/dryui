<script lang="ts">
	import { StarRating } from '@dryui/ui';
</script>

<div class="stack">
	<StarRating.Root stars={5} label="5 out of 5 stars" />
	<StarRating.Root stars={4} label="4 out of 5 stars" />
	<StarRating.Root stars={3} label="3 out of 5 stars" />
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: start;
	}
</style>
