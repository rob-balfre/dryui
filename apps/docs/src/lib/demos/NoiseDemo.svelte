<script lang="ts">
	import { Noise } from '@dryui/ui';

	const samples = [
		{
			title: 'Poster stock',
			body: 'High contrast surfaces make the grain obvious without turning the demo into static.'
		},
		{
			title: 'Warm slate',
			body: 'The overlay keeps the surface from feeling flat while preserving the underlying tone.'
		},
		{
			title: 'Soft highlight',
			body: 'A brighter panel shows how the pattern reacts across different luminance levels.'
		}
	];
</script>

<div class="noise-frame">
	<Noise opacity={0.28} blend="overlay" grain="coarse">
		<section class="noise-demo">
			<header class="noise-header">
				<div class="noise-kicker">Noise overlay</div>
				<h3>Use grain to break up flat surfaces and keep dark UI from feeling plastic.</h3>
				<p>
					This demo uses a split-tone poster with multiple contrast bands so the texture is visible
					right away, even without animation.
				</p>
			</header>

			<div class="noise-panel">
				<article class="noise-hero">
					<p class="noise-eyebrow">Textured surface</p>
					<h4>Visible grain over layered color fields.</h4>
					<p>
						The overlay has enough area and contrast to read as a material treatment, not a faint
						system artifact.
					</p>
				</article>

				<div class="noise-grid">
					{#each samples as sample (sample.title)}
						<article class="noise-card">
							<h4>{sample.title}</h4>
							<p>{sample.body}</p>
						</article>
					{/each}
				</div>
			</div>
		</section>
	</Noise>
</div>

<style>
	.noise-frame {
		border-radius: var(--dry-radius-2xl);
		background:
			linear-gradient(135deg, var(--dry-color-fill-brand-weak), transparent 36%),
			linear-gradient(225deg, var(--dry-color-fill-accent-weak), transparent 30%),
			linear-gradient(180deg, var(--dry-color-bg-raised), var(--dry-color-bg-overlay));
	}

	.noise-demo {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-2xl);
		background:
			linear-gradient(120deg, var(--dry-color-fill-brand-weak), transparent 36%),
			linear-gradient(205deg, var(--dry-color-fill-accent-weak), transparent 32%),
			linear-gradient(180deg, var(--dry-color-bg-raised), var(--dry-color-bg-overlay));
		box-shadow: 0 24px 60px hsla(230, 100%, 5%, 0.14);
	}

	.noise-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.noise-kicker,
	.noise-eyebrow {
		color: var(--dry-color-text-brand);
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.noise-header h3 {
		margin: 0;
		color: var(--dry-color-text-strong);
		font-size: clamp(1.75rem, 2.8vw, 3rem);
		line-height: 1;
		letter-spacing: -0.04em;
	}

	.noise-header p {
		margin: 0;
		color: var(--dry-color-text-weak);
		line-height: 1.55;
	}

	.noise-panel {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(180deg, var(--dry-color-bg-floating), var(--dry-color-bg-raised));
		border: 1px solid var(--dry-color-stroke-weak);
	}

	.noise-hero {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5);
		border-radius: var(--dry-radius-xl);
		background:
			linear-gradient(135deg, var(--dry-color-fill-brand-weak), transparent 40%),
			linear-gradient(210deg, var(--dry-color-fill-accent-weak), transparent 28%),
			linear-gradient(180deg, var(--dry-color-bg-floating), var(--dry-color-bg-raised));
		border: 1px solid var(--dry-color-stroke-weak);
	}

	.noise-hero h4 {
		margin: 0;
		color: var(--dry-color-text-strong);
		font-size: clamp(1.2rem, 1.8vw, 1.6rem);
		line-height: 1.1;
		letter-spacing: -0.03em;
	}

	.noise-hero p {
		margin: 0;
		color: var(--dry-color-text-weak);
		line-height: 1.55;
	}

	.noise-grid {
		display: grid;
		gap: var(--dry-space-3);
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
	}

	.noise-card {
		display: grid;
		gap: var(--dry-space-1_5);
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background:
			linear-gradient(180deg, var(--dry-color-fill-weaker), transparent),
			var(--dry-color-bg-floating);
	}

	.noise-card h4 {
		margin: 0;
		color: var(--dry-color-text-strong);
		font-size: 1rem;
		line-height: 1.2;
	}

	.noise-card p {
		margin: 0;
		color: var(--dry-color-text-weak);
		line-height: 1.45;
	}
</style>
