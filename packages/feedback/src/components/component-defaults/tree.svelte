<script lang="ts">
	import { Tree } from '@dryui/ui';
</script>

<Tree.Root>
	<Tree.Item itemId="src">
		<Tree.ItemLabel>src</Tree.ItemLabel>
		<Tree.ItemChildren>
			<Tree.Item itemId="src/components">
				<Tree.ItemLabel>components</Tree.ItemLabel>
			</Tree.Item>
			<Tree.Item itemId="src/routes">
				<Tree.ItemLabel>routes</Tree.ItemLabel>
			</Tree.Item>
		</Tree.ItemChildren>
	</Tree.Item>
	<Tree.Item itemId="package">
		<Tree.ItemLabel>package.json</Tree.ItemLabel>
	</Tree.Item>
</Tree.Root>
