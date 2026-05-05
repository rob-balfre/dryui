<script lang="ts">
	import { FormatNumber } from '@dryui/ui';
</script>

<ul class="stack">
	<li><FormatNumber value={1284650} type="currency" currency="USD" maximumFractionDigits={0} /></li>
	<li><FormatNumber value={42680} notation="compact" /></li>
	<li><FormatNumber value={0.0042} type="percent" maximumFractionDigits={2} /></li>
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
