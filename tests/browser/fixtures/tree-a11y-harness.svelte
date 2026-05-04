<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Tree } from '../../../packages/ui/src/tree/index.js';
</script>

<Tree.Root defaultExpanded={['documents']}>
	<Tree.Item itemId="documents">
		<Tree.ItemLabel>Documents</Tree.ItemLabel>
		<Tree.ItemChildren>
			<Tree.Item itemId="report">
				<Tree.ItemLabel>Report.pdf</Tree.ItemLabel>
			</Tree.Item>
			<Tree.Item itemId="notes">
				<Tree.ItemLabel>Notes.md</Tree.ItemLabel>
			</Tree.Item>
		</Tree.ItemChildren>
	</Tree.Item>
</Tree.Root>
