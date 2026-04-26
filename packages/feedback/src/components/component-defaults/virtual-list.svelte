<script lang="ts">
	import { VirtualList } from '@dryui/ui';

	const items = Array.from({ length: 80 }, (_, i) => ({ id: i, label: `Item ${i + 1}` }));
</script>

<div style="block-size: 200px; inline-size: 240px; overflow: hidden; border-radius: 8px;">
	<VirtualList {items} itemHeight={32}>
		{#snippet children({
			item,
			style
		}: {
			item: (typeof items)[number];
			index: number;
			style: string;
		})}
			<div {style}>
				<div style="padding: 8px 12px; border-bottom: 1px solid hsl(220 10% 22%);">
					{item.label}
				</div>
			</div>
		{/snippet}
	</VirtualList>
</div>
