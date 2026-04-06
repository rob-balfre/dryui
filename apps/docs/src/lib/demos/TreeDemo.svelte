<script lang="ts">
	import { Tree } from '@dryui/ui';
</script>

<Tree.Root defaultExpanded={['documents']}>
	<Tree.Item itemId="documents">
		<Tree.ItemLabel>Documents</Tree.ItemLabel>
		<Tree.ItemChildren>
			<Tree.Item itemId="report">
				<Tree.ItemLabel>report.pdf</Tree.ItemLabel>
			</Tree.Item>
			<Tree.Item itemId="notes">
				<Tree.ItemLabel>notes.md</Tree.ItemLabel>
			</Tree.Item>
		</Tree.ItemChildren>
	</Tree.Item>
</Tree.Root>
