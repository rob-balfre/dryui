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
			},
			{
				id: 's2',
				label: 'Hero',
				tagName: 'section',
				selector: '[data-source-hero]',
				role: null,
				className: null,
				textSnippet: 'Welcome back',
				originalRect: { x: 0, y: 80, width: 800, height: 220 },
				currentRect: { x: 0, y: 104, width: 760, height: 220 },
				originalIndex: 1
			}
		],
		originalOrder: ['s1', 's2'],
		detectedAt: Date.now()
	});

	function handleChange(next: RearrangeState) {
		rearrangeState = next;
	}
</script>

<nav data-source-nav aria-label="Source navigation" class="source-nav"></nav>

<section data-source-hero aria-label="Source hero" class="source-hero"></section>

<RearrangeOverlay {rearrangeState} onChange={handleChange} />

<style>
	.source-nav {
		position: fixed;
		left: 0;
		top: 0;
		display: block;
		width: 800px;
		height: 56px;
	}

	.source-hero {
		position: fixed;
		left: 0;
		top: 80px;
		display: block;
		width: 800px;
		height: 220px;
	}
</style>
