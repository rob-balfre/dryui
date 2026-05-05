<script lang="ts">
	import { RelativeTime } from '@dryui/ui';

	const now = Date.now();
	const oneHourAgo = now - 60 * 60 * 1000;
	const oneDayAgo = now - 24 * 60 * 60 * 1000;
	const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
</script>

<div class="stack">
	<RelativeTime date={oneHourAgo} />
	<RelativeTime date={oneDayAgo} />
	<RelativeTime date={oneWeekAgo} />
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: start;
	}
</style>
