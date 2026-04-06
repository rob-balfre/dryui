<script lang="ts">
	import {
		RearrangeOverlay,
		type RearrangeState
	} from '../../../packages/feedback/src/layout-mode';

	let rearrangeState = $state<RearrangeState>({
		sections: [
			{
				id: 's1',
				label: 'Navigation',
				tagName: 'nav',
				selector: '[data-source-nav]',
				role: 'navigation',
				className: null,
				textSnippet: 'Home About',
				originalRect: { x: 0, y: 0, width: 800, height: 56 },
				currentRect: { x: 0, y: 0, width: 800, height: 56 },
				originalIndex: 0
			}
		],
		originalOrder: ['s1'],
		detectedAt: Date.now()
	});

	let selectedCount = $state(0);

	function handleChange(next: RearrangeState) {
		rearrangeState = next;
	}

	function handleSelectionChange(selected: Set<string>) {
		selectedCount = selected.size;
	}
</script>

<nav data-source-nav aria-label="Source navigation" class="source-nav"></nav>

<RearrangeOverlay
	{rearrangeState}
	onChange={handleChange}
	onSelectionChange={handleSelectionChange}
/>

<output data-testid="sections">{rearrangeState.sections.length}</output>
<output data-testid="selected">{selectedCount}</output>
<output data-testid="first-size"
	>{rearrangeState.sections[0]
		? `${Math.round(rearrangeState.sections[0].currentRect.width)} x ${Math.round(rearrangeState.sections[0].currentRect.height)}`
		: ''}</output
>
<output data-testid="first-note">{rearrangeState.sections[0]?.note ?? ''}</output>

<style>
	.source-nav {
		position: fixed;
		left: 0;
		top: 0;
		display: block;
		width: 800px;
		height: 56px;
	}
</style>
