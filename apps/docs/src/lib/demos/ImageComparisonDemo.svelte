<script lang="ts">
	import { ImageComparison } from '@dryui/ui';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
</script>

{#snippet beforeScene()}
	<div class="comparison-scene before">
		<span>Before</span>
	</div>
{/snippet}

{#snippet afterScene()}
	<div class="comparison-scene after">
		<span>After</span>
	</div>
{/snippet}

{#snippet handleScene()}
	<div class="custom-handle" aria-hidden="true">
		<div class="custom-handle-button">
			<ChevronLeft size={16} strokeWidth={2.25} />
			<ChevronRight size={16} strokeWidth={2.25} />
		</div>
	</div>
{/snippet}

<div class="comparison">
	<ImageComparison
		before={beforeScene as any}
		after={afterScene as any}
		handle={handleScene as any}
	/>
</div>

<style>
	.comparison {
		aspect-ratio: 16 / 9;
		min-height: 16rem;
	}

	.comparison-scene {
		display: grid;
		height: 100%;
		align-content: start;
		padding: var(--dry-space-4);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--dry-color-on-brand);
		text-transform: uppercase;
	}

	.comparison-scene span {
		display: inline-grid;
		padding: var(--dry-space-2) var(--dry-space-3);
		/* dryui-allow solid-border-on-raised: docs demo keeps an explicit sample boundary. */
		border: 1px solid color-mix(in srgb, var(--dry-color-bg-overlay) 55%, transparent);
		border-radius: 9999px;
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 18%, transparent);
		box-shadow: var(--dry-shadow-sm);
	}

	.before {
		justify-items: start;
		background:
			radial-gradient(circle at top left, rgba(255, 255, 255, 0.45), transparent 35%),
			linear-gradient(135deg, #6f8cff, #4b63d1 55%, #22317a);
	}

	.after {
		justify-items: end;
		background:
			radial-gradient(circle at top right, rgba(255, 255, 255, 0.4), transparent 30%),
			linear-gradient(135deg, #ffbf6f, #ff8a47 45%, #6e2c16);
	}

	.custom-handle {
		position: relative;
		display: grid;
		place-items: center;
		min-block-size: 100%;
		background: linear-gradient(
			90deg,
			transparent calc(50% - 1px),
			var(--dry-color-bg-overlay) calc(50% - 1px),
			var(--dry-color-bg-overlay) calc(50% + 1px),
			transparent calc(50% + 1px)
		);
	}

	.custom-handle-button {
		position: relative;
		z-index: 1;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		place-items: center;
		gap: var(--dry-space-0_5);
		padding: var(--dry-space-3);
		/* dryui-allow solid-border-on-raised: docs demo keeps an explicit sample boundary. */
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-full);
		background: var(--dry-color-bg-overlay);
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-shadow-md);
	}
</style>
