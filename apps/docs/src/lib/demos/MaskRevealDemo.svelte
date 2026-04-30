<script lang="ts">
	import { MaskReveal } from '@dryui/ui';

	const highlights = [
		{
			label: 'shape',
			value: 'diamond'
		},
		{
			label: 'motion',
			value: 'center-out reveal'
		},
		{
			label: 'fallback',
			value: 'static when motion is reduced'
		}
	];

	const cards = [
		{
			title: 'Hero panel',
			body: 'Large type, layered fills, and enough surface area to make the mask read immediately.'
		},
		{
			title: 'Feature cards',
			body: 'Three independent blocks keep the clip path visible as the content opens.'
		},
		{
			title: 'Reveal note',
			body: 'Good for entrance moments. Bad for tiny text-only wrappers.'
		}
	];

	let mounted = $state(false);

	$effect(() => {
		mounted = true;
	});
</script>

{#snippet demoContent()}
	<section class="mask-demo">
		<header class="mask-header">
			<div class="mask-kicker">Mask Reveal</div>
			<h3>Open the surface from the center so the transition is unmistakable.</h3>
			<p>
				The demo uses a dense poster-style layout instead of a single line, which makes the clip
				path and masking feel like an actual effect instead of a missed render.
			</p>
		</header>

		<div class="mask-grid">
			<article class="mask-hero">
				<p class="mask-eyebrow">Entrance moment</p>
				<h4>Reveal content with a strong silhouette and clear interior structure.</h4>
				<p>
					The brighter center panel, hard edges, and layered chips give the mask something to shape
					while it animates.
				</p>
			</article>

			<div class="mask-cards">
				{#each cards as card (card.title)}
					<article class="mask-card">
						<h4>{card.title}</h4>
						<p>{card.body}</p>
					</article>
				{/each}
			</div>

			<div class="mask-highlights">
				{#each highlights as highlight (highlight.label)}
					<div class="mask-highlight">
						<span>{highlight.label}</span>
						<strong>{highlight.value}</strong>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/snippet}

{#if mounted}
	<MaskReveal shape="diamond" direction="in" threshold={0.12} duration={900} once={false}>
		{@render demoContent()}
	</MaskReveal>
{:else}
	{@render demoContent()}
{/if}

<style>
	.mask-demo {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-2xl);
		background:
			linear-gradient(135deg, var(--dry-color-fill-brand-weak), transparent 40%),
			linear-gradient(210deg, var(--dry-color-fill-accent-weak), transparent 38%),
			linear-gradient(180deg, var(--dry-color-bg-raised), var(--dry-color-bg-overlay));
		box-shadow: 0 24px 60px hsla(230, 100%, 5%, 0.16);
	}

	.mask-header {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-1) var(--dry-space-1) var(--dry-space-2);
	}

	.mask-kicker,
	.mask-eyebrow {
		color: var(--dry-color-text-brand);
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.mask-header h3 {
		margin: 0;
		color: var(--dry-color-text-strong);
		font-size: clamp(1.85rem, 3vw, 3.25rem);
		line-height: 0.98;
		letter-spacing: -0.04em;
	}

	.mask-header p {
		margin: 0;
		color: var(--dry-color-text-weak);
		font-size: 1rem;
		line-height: 1.55;
	}

	.mask-grid {
		display: grid;
		gap: var(--dry-space-3);
	}

	.mask-hero {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-xl);
		background:
			linear-gradient(145deg, var(--dry-color-fill-brand-weak), transparent 45%),
			linear-gradient(180deg, var(--dry-color-bg-floating), var(--dry-color-bg-raised));
		box-shadow: inset 0 1px 0 hsla(0, 0%, 100%, 0.08);
	}

	.mask-hero h4 {
		margin: 0;
		color: var(--dry-color-text-strong);
		font-size: clamp(1.2rem, 1.8vw, 1.65rem);
		line-height: 1.1;
		letter-spacing: -0.03em;
	}

	.mask-hero p {
		margin: 0;
		color: var(--dry-color-text-weak);
		line-height: 1.55;
	}

	.mask-cards,
	.mask-highlights {
		display: grid;
		gap: var(--dry-space-3);
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
	}

	.mask-card,
	.mask-highlight {
		display: grid;
		gap: var(--dry-space-1_5);
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-floating);
	}

	.mask-card h4,
	.mask-highlight strong {
		margin: 0;
		color: var(--dry-color-text-strong);
		font-size: 1rem;
		line-height: 1.2;
	}

	.mask-card p,
	.mask-highlight span {
		margin: 0;
		color: var(--dry-color-text-weak);
		line-height: 1.45;
	}

	.mask-highlight {
		background:
			linear-gradient(180deg, var(--dry-color-fill-weaker), transparent),
			var(--dry-color-bg-floating);
	}
</style>
