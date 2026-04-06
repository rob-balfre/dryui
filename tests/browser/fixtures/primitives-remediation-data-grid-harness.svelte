<script lang="ts">
	import { DataGrid } from '../../../packages/primitives/src/data-grid/index.js';

	const items = [{ id: 'row-42', name: 'Ada Lovelace' }];
</script>

<DataGrid.Root {items} selectable>
	<DataGrid.Table>
		<thead>
			<tr>
				<DataGrid.SelectAll />
				<DataGrid.Column key="name" resizable data-testid="name-column">Name</DataGrid.Column>
			</tr>
		</thead>
		<tbody>
			<DataGrid.Row rowId="row-42">
				<DataGrid.SelectCell rowId="row-42" rowLabel="Ada Lovelace" />
				<DataGrid.Cell>Ada Lovelace</DataGrid.Cell>
			</DataGrid.Row>
		</tbody>
	</DataGrid.Table>
</DataGrid.Root>
