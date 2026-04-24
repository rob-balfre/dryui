<script lang="ts">
	import { Shimmer, Text } from '@dryui/ui';
	import { Activity } from 'lucide-svelte';

	const spark = Array.from({ length: 10 }, (_, i) => i);
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Loading state</p>
		<Text color="secondary" size="sm">
			Shimmer sweeps a warm highlight across the wrapped text and icons so a skeleton card reads as
			"fetching" instead of "broken".
		</Text>
	</div>

	<article class="card" aria-busy="true">
		<header class="card-head">
			<div class="icon" aria-hidden="true">
				<Activity size={16} strokeWidth={2.25} />
			</div>
			<Shimmer color="#ffc27a" duration={2.4}>
				<span class="card-title">Checkout throughput</span>
			</Shimmer>
			<span class="pill">Live</span>
		</header>

		<div class="skeleton-grid" aria-hidden="true">
			<span class="sk sk-value"></span>
			<span class="sk sk-caption"></span>
		</div>

		<div class="spark" aria-hidden="true">
			{#each spark as i (i)}
				<span class="spark-bar" data-step={i}></span>
			{/each}
		</div>
	</article>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
	}

	.head {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.card {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-xl);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 54%, transparent);
	}

	.card-head {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.icon {
		display: grid;
		place-items: center;
		block-size: 2rem;
		aspect-ratio: 1;
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 22%, var(--dry-color-bg-base));
		color: var(--dry-color-text-strong);
	}

	.card-title {
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.pill {
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-fill-success) 22%, var(--dry-color-bg-base));
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.06em;
		color: var(--dry-color-text-strong);
	}

	.skeleton-grid {
		display: grid;
		gap: var(--dry-space-2);
	}

	.sk {
		display: block;
		block-size: 0.75rem;
		border-radius: 4px;
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--dry-color-bg-base) 82%, transparent),
			color-mix(in srgb, var(--dry-color-bg-overlay) 94%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 82%, transparent)
		);
		background-size: 200% 100%;
		animation: shimmer-slide 2.4s linear infinite;
	}

	.sk-value {
		block-size: 1.75rem;
		padding-inline: 6rem;
		justify-self: start;
	}

	.sk-caption {
		padding-inline: 12rem;
		justify-self: start;
	}

	.spark {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		align-items: end;
		gap: var(--dry-space-0_5);
		block-size: 4rem;
	}

	.spark-bar {
		display: block;
		border-radius: 2px;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-fill-brand) 80%, transparent),
			color-mix(in srgb, var(--dry-color-fill-brand) 24%, transparent)
		);
	}

	.spark-bar[data-step='0'] {
		block-size: 32%;
	}
	.spark-bar[data-step='1'] {
		block-size: 48%;
	}
	.spark-bar[data-step='2'] {
		block-size: 28%;
	}
	.spark-bar[data-step='3'] {
		block-size: 64%;
	}
	.spark-bar[data-step='4'] {
		block-size: 56%;
	}
	.spark-bar[data-step='5'] {
		block-size: 72%;
	}
	.spark-bar[data-step='6'] {
		block-size: 62%;
	}
	.spark-bar[data-step='7'] {
		block-size: 84%;
	}
	.spark-bar[data-step='8'] {
		block-size: 74%;
	}
	.spark-bar[data-step='9'] {
		block-size: 92%;
	}

	@keyframes shimmer-slide {
		from {
			background-position: 100% 0;
		}
		to {
			background-position: -100% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sk {
			animation: none;
		}
	}
</style>
