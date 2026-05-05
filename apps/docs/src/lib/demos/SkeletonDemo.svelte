<script lang="ts">
	import { Skeleton } from '@dryui/ui';
</script>

<div class="stack">
	<Skeleton variant="circular" width="2.25rem" height="2.25rem" />
	<Skeleton width="12rem" height="0.85rem" />
	<Skeleton width="100%" height="0.7rem" />
	<Skeleton width="80%" height="0.7rem" />
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-2);
	}
</style>
