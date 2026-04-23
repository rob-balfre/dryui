<script lang="ts">
	import { GradientMesh } from '@dryui/ui';

	const metrics = [
		{ label: 'Motion budget', value: '48s cycle' },
		{ label: 'Pointer mode', value: 'interactive' },
		{ label: 'Fallback', value: 'static' }
	] as const;

	const lanes = [
		{
			title: 'Launch board',
			body: 'The mesh needs a real foreground composition so the color fields read behind content.'
		},
		{
			title: 'Cursor chase',
			body: 'Interactive mode pulls the highlight toward the pointer instead of staying flat.'
		},
		{
			title: 'Reduced motion',
			body: 'Animation already backs off when the browser asks for less movement.'
		}
	] as const;
</script>

<div class="demo-shell">
	<GradientMesh colors={['#8b5cf6', '#38bdf8', '#f472b6', '#f59e0b']} interactive speed={0.25}>
		<section class="stage">
			<div class="eyebrow">Interactive gradient mesh</div>

			<div class="hero">
				<div class="hero-copy">
					<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
					<h3>Mesh as a background, not a thin strip</h3>
					<p>
						Give the effect real surface area, a strong foreground card, and a slow ambient drift so
						the mesh reads without turning the preview into a busy light show.
					</p>
				</div>

				<ul class="metrics" aria-label="Mesh stats">
					{#each metrics as metric (metric.label)}
						<li class="metric">
							<span>{metric.label}</span>
							<strong>{metric.value}</strong>
						</li>
					{/each}
				</ul>
			</div>

			<div class="lanes">
				{#each lanes as lane (lane.title)}
					<article class="lane">
						<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
						<h4>{lane.title}</h4>
						<p>{lane.body}</p>
					</article>
				{/each}
			</div>
		</section>
	</GradientMesh>
</div>

<style>
	.demo-shell {
		display: grid;
		min-block-size: 36rem;
		padding: 1.5rem;
		border-radius: 1.5rem;
	}

	.stage {
		display: grid;
		gap: 1.25rem;
		padding: 1.5rem;
		border: 1px solid color-mix(in oklab, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: 1.25rem;
		background: linear-gradient(
			135deg,
			color-mix(in oklab, var(--dry-color-bg-raised) 88%, black 12%),
			color-mix(in oklab, var(--dry-color-bg-raised) 76%, white 24%)
		);
	}

	.eyebrow {
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: color-mix(in oklab, var(--dry-color-text-strong) 58%, transparent);
	}

	.hero {
		display: grid;
		gap: 1rem;
	}

	.hero-copy {
		display: grid;
		gap: 0.5rem;
	}

	h3,
	h4,
	p {
		margin: 0;
	}

	h3 {
		font-size: clamp(2rem, 4vw, 3rem);
		line-height: 0.95;
	}

	p {
		color: color-mix(in oklab, var(--dry-color-text-strong) 78%, transparent);
	}

	.metrics,
	.lanes {
		display: grid;
		gap: 0.75rem;
	}

	.metrics {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.metric,
	.lane {
		display: grid;
		gap: 0.35rem;
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid color-mix(in oklab, var(--dry-color-stroke-weak) 76%, transparent);
		background: color-mix(in oklab, var(--dry-color-bg-raised) 82%, black 18%);
	}

	.metric span {
		font-size: 0.78rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: color-mix(in oklab, var(--dry-color-text-strong) 58%, transparent);
	}

	.metric strong {
		font-size: 1.4rem;
	}

	.lanes {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.lane h4 {
		font-size: 1rem;
	}

	.lane p {
		font-size: 0.95rem;
	}
</style>
