<script lang="ts">
	import { SegmentedControl } from '@dryui/ui';
	import { CANVAS_WIDTHS, type CanvasWidth } from './types.js';

	interface Props {
		value: CanvasWidth;
		onchange: (width: CanvasWidth) => void;
	}

	let { value, onchange }: Props = $props();

	const stringValue = $derived(String(value));

	function handleChange(next: string) {
		const num = Number(next) as CanvasWidth;
		if (num !== value) onchange(num);
	}
</script>

<div class="responsive-bar" data-dryui-feedback>
	<SegmentedControl.Root value={stringValue} onValueChange={handleChange}>
		{#each CANVAS_WIDTHS as option (option.value)}
			<SegmentedControl.Item value={String(option.value)}>
				{option.label}
			</SegmentedControl.Item>
		{/each}
	</SegmentedControl.Root>
</div>

<style>
	.responsive-bar {
		position: fixed;
		inset-block-start: 0.75rem;
		inset-inline-start: 50%;
		transform: translateX(-50%);
		z-index: 10001;
		pointer-events: auto;
	}
</style>
