<script lang="ts">
	import { ScrollToTop } from '@dryui/ui';

	let target = $state<HTMLDivElement>();

	$effect(() => {
		if (!target) return;
		target.scrollTop = 160;
	});
</script>

<div class="frame">
	<div bind:this={target} class="scroll">
		<div class="inner">
			<p>Scroll the contents of this frame to reveal the ScrollToTop button.</p>
			<p>Item 1</p>
			<p>Item 2</p>
			<p>Item 3</p>
			<p>Item 4</p>
			<p>Item 5</p>
			<p>Item 6</p>
			<p>Item 7</p>
			<p>Item 8</p>
			<p>Item 9</p>
			<p>Item 10</p>
		</div>
	</div>

	{#if target}
		<ScrollToTop {target} threshold={120} position="bottom-right" />
	{/if}
</div>

<style>
	.frame {
		position: relative;
		contain: paint;
		block-size: 16rem;
		overflow: hidden;
		border-radius: var(--dry-radius-lg);
	}

	.scroll {
		block-size: 100%;
		overflow: auto;
		padding: var(--dry-space-5);
	}

	.inner {
		display: grid;
		gap: var(--dry-space-3);
		min-block-size: 38rem;
		padding-right: var(--dry-space-10);
	}

	p {
		margin: 0;
		line-height: 1.6;
		color: var(--dry-color-text-strong);
	}
</style>
