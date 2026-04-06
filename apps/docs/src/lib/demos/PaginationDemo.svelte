<script lang="ts">
	import { Pagination } from '@dryui/ui';

	let page = $state(3);
</script>

<Pagination.Root bind:page totalPages={10}>
	<Pagination.Content>
		<Pagination.Item>
			<Pagination.Previous>Prev</Pagination.Previous>
		</Pagination.Item>
		<Pagination.Item>
			<Pagination.Link page={1}>1</Pagination.Link>
		</Pagination.Item>
		<Pagination.Item>
			<Pagination.Link page={2}>2</Pagination.Link>
		</Pagination.Item>
		<Pagination.Item>
			<Pagination.Link page={3}>3</Pagination.Link>
		</Pagination.Item>
		<Pagination.Item>
			<Pagination.Ellipsis />
		</Pagination.Item>
		<Pagination.Item>
			<Pagination.Link page={10}>10</Pagination.Link>
		</Pagination.Item>
		<Pagination.Item>
			<Pagination.Next>Next</Pagination.Next>
		</Pagination.Item>
	</Pagination.Content>
</Pagination.Root>
