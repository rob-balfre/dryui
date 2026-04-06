<script lang="ts">
	import { ScrollArea } from '@dryui/ui';
</script>

<div class="container">
	<ScrollArea>
		<div class="content">
			<p>
				Svelte 5 introduces runes, a powerful set of primitives for controlling reactivity inside
				your components and across your application. Runes replace the magic let declarations and $
				syntax of Svelte 4, offering a more explicit and flexible approach to state management. With
				$state, $derived, and $effect, you gain fine-grained control over how data flows through
				your component tree.
			</p>
			<p>
				Components built on native browser APIs like the Popover API and CSS Anchor Positioning
				reduce bundle size while improving accessibility. The dialog element handles focus trapping
				and backdrop rendering natively, eliminating the need for third-party modal libraries.
			</p>
			<p>
				The styling system uses CSS custom properties with a two-tier token architecture. Semantic
				tokens like --dry-color-text-strong map to component-level variables, enabling consistent
				theming while allowing per-component overrides. Container queries replace media queries for
				responsive layouts, scoping breakpoints to the component rather than the viewport.
			</p>
			<p>
				Zero-dependency means exactly that — no runtime packages beyond Svelte itself. Every
				component ships only the code it needs, keeping bundle sizes small and avoiding the
				dependency churn that plagues larger UI libraries.
			</p>
		</div>
	</ScrollArea>
</div>

<style>
	.container {
		display: grid;
		height: 10rem;
		overflow: hidden;
	}

	.content {
		display: grid;
		gap: var(--dry-space-3);
	}

	p {
		margin: 0;
		line-height: 1.6;
	}
</style>
