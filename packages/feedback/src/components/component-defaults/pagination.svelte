<script lang="ts">
	import { Pagination } from '@dryui/ui';
</script>

<Pagination.Root page={1} totalPages={5}>
	<Pagination.Content>
		<Pagination.Previous>Prev</Pagination.Previous>
		<Pagination.Item><Pagination.Link page={1}>1</Pagination.Link></Pagination.Item>
		<Pagination.Item><Pagination.Link page={2}>2</Pagination.Link></Pagination.Item>
		<Pagination.Item><Pagination.Link page={3}>3</Pagination.Link></Pagination.Item>
		<Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
		<Pagination.Item><Pagination.Link page={5}>5</Pagination.Link></Pagination.Item>
		<Pagination.Next>Next</Pagination.Next>
	</Pagination.Content>
</Pagination.Root>
