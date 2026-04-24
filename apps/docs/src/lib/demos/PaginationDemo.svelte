<script lang="ts">
	import { Pagination } from '@dryui/ui';

	const totalPages = 12;
	let page = $state(3);
	const pageSize = 10;
	const total = 117;
	$effect(() => {
		if (page < 1) page = 1;
		if (page > totalPages) page = totalPages;
	});
</script>

<div class="wrap">
	<div class="status">
		<p class="eyebrow">Search: "deploy"</p>
		<p class="note">
			Showing <strong>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</strong> of
			<strong>{total}</strong> results
		</p>
	</div>

	<Pagination.Root bind:page {totalPages}>
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.Previous>Previous</Pagination.Previous>
			</Pagination.Item>
			<Pagination.Item><Pagination.Link page={1}>1</Pagination.Link></Pagination.Item>
			<Pagination.Item><Pagination.Link page={2}>2</Pagination.Link></Pagination.Item>
			<Pagination.Item><Pagination.Link page={3}>3</Pagination.Link></Pagination.Item>
			<Pagination.Item><Pagination.Link page={4}>4</Pagination.Link></Pagination.Item>
			<Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
			<Pagination.Item><Pagination.Link page={12}>12</Pagination.Link></Pagination.Item>
			<Pagination.Item>
				<Pagination.Next>Next</Pagination.Next>
			</Pagination.Item>
		</Pagination.Content>
	</Pagination.Root>
</div>

<style>
	.wrap {
		display: grid;
		gap: var(--dry-space-4);
		justify-items: start;
	}

	.status {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}

	.note strong {
		color: var(--dry-color-text-strong);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
</style>
