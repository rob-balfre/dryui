<script lang="ts">
	import { FormatBytes } from '@dryui/ui';
</script>

<ul class="stack">
	<li><FormatBytes value={980} /></li>
	<li><FormatBytes value={1_458_000} /></li>
	<li><FormatBytes value={812_400_000} /></li>
	<li><FormatBytes value={24_800_000_000} /></li>
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
