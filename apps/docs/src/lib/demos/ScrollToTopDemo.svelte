<script lang="ts">
	import { ScrollToTop } from '@dryui/ui';

	let target = $state<HTMLDivElement | undefined>();

	$effect(() => {
		if (target) {
			target.scrollTop = 160;
		}
	});
</script>

<div class="preview-frame">
	<div class="preview-scroll" bind:this={target}>
		<div class="preview-copy">
			<p>Scroll the trip brief to reveal the floating return action.</p>
			<p>
				DryUI keeps viewport-level affordances lean, but docs demos need a contained surface so they
				do not bleed into the rest of the page.
			</p>
			<p>This preview starts scrolled so the button is visible immediately.</p>
			<p>Use the local scroll container to verify the threshold and smooth return behavior.</p>
		</div>
	</div>

	{#if target}
		<ScrollToTop {target} threshold={80} />
	{/if}
</div>

<style>
	.preview-frame {
		position: relative;
		contain: paint;
		height: 14rem;
		overflow: hidden;
		/* dryui-allow solid-border-on-raised: docs demo keeps an explicit sample boundary. */
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-overlay);
	}

	.preview-scroll {
		height: 100%;
		overflow: auto;
		padding: var(--dry-space-4);
	}

	.preview-copy {
		display: grid;
		gap: var(--dry-space-3);
		min-height: 24rem;
		padding-right: var(--dry-space-10);
	}

	p {
		margin: 0;
		line-height: 1.6;
	}
</style>
