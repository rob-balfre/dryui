<script lang="ts">
	import type { LayoutNode } from '../ast/types.js';
	import { buildNodeWrapperStyle } from './style.js';

	interface Props {
		node: LayoutNode;
	}

	let { node }: Props = $props();
</script>

<span
	class="text-node"
	data-studio-node-id={node.id}
	data-studio-component={node.component}
	style={buildNodeWrapperStyle(node)}
>
	{node.text ?? ''}
</span>

<style>
	.text-node {
		color: inherit;
		line-height: 1.4;
	}
</style>
