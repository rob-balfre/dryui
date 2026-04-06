<script lang="ts">
	import type { LayoutNode } from '../ast/types.js';
	import { resolveComponent } from '../registry/index.js';
	import TextNode from './TextNode.svelte';
	import { buildComponentProps, buildNodeWrapperStyle } from './style.js';

	interface Props {
		node: LayoutNode;
	}

	let { node }: Props = $props();
</script>

{#snippet renderNode(current: LayoutNode)}
	{#if current.component === '__text__'}
		<TextNode node={current} />
	{:else}
		{@const ResolvedComponent = resolveComponent(current.component, current.part)}
		{@const componentProps = buildComponentProps(current)}

		<div
			class="node-shell"
			data-studio-node-id={current.id}
			data-studio-component={current.component}
			data-studio-part={current.part ?? undefined}
			data-studio-locked={String(current.locked)}
			hidden={!current.visible}
			style={buildNodeWrapperStyle(current)}
		>
			{#if ResolvedComponent}
				<ResolvedComponent {...componentProps}>
					{#each current.children as child (child.id)}
						{@render renderNode(child)}
					{/each}
				</ResolvedComponent>
			{:else}
				<div class="missing-component">
					Missing renderer for {current.component}{current.part ? `.${current.part}` : ''}
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

{@render renderNode(node)}

<style>
	.node-shell {
		position: relative;
	}

	.missing-component {
		border: 1px dashed var(--dry-color-border);
		border-radius: var(--dry-radius-md);
		color: var(--dry-color-text-secondary);
		padding: var(--dry-space-4);
		background: color-mix(in srgb, var(--dry-color-surface) 80%, transparent);
	}
</style>
