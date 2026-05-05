<script lang="ts">
	import { Pagination } from '@dryui/ui';

	let page = $state(3);
	const totalPages = 12;
</script>

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
