<script lang="ts">
	import { Spacer } from '@dryui/ui';

	const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
</script>

<div class="demo">
	{#each sizes as size (size)}
		<div class="row">
			<div class="block">Content above</div>
			<Spacer {size} />
			<div class="block">Content below</div>
			<div class="label">
				<code>size="{size}"</code>
			</div>
		</div>
	{/each}
</div>

<style>
	.demo {
		display: grid;
		gap: var(--dry-space-4);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		column-gap: var(--dry-space-4);
		align-items: center;
	}

	.block {
		grid-column: 1;
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-sm);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 80%, transparent);
		color: var(--dry-color-text-strong);
		font-size: var(--dry-text-sm-size);
	}

	.label {
		grid-column: 2;
		grid-row: 1 / span 3;
		align-self: center;
	}

	.label code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
</style>
