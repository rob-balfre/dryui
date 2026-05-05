<script lang="ts">
	import { FormatDate } from '@dryui/ui';

	const date = new Date('2026-04-04T18:30:00Z');
</script>

<ul class="stack">
	<li><FormatDate {date} dateStyle="full" timeStyle="short" /></li>
	<li><FormatDate {date} dateStyle="medium" timeStyle="short" /></li>
	<li><FormatDate {date} weekday="short" month="short" day="numeric" /></li>
</ul>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding: 0;
		list-style: none;
		font-variant-numeric: tabular-nums;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
