<script lang="ts">
	import { Carousel } from '@dryui/ui';

	const slides = [
		{
			id: 'launch',
			eyebrow: 'Launch Week',
			title: 'Turn feature updates into a guided story',
			description:
				'Use the carousel for release notes, onboarding, or changelog callouts when a single surface needs more narrative structure.',
			points: [
				'Snap-scrolling keeps the sequence legible',
				'Arrow controls work for touch, mouse, and keyboard'
			],
			stats: [
				{ label: 'Mode', value: 'Looping' },
				{ label: 'Best for', value: 'Tours' },
				{ label: 'Input', value: 'Touch + keys' },
				{ label: 'Density', value: 'Editorial' }
			]
		},
		{
			id: 'editorial',
			eyebrow: 'Content Rail',
			title: 'Mix copy, metrics, and visual hierarchy per slide',
			description:
				'Each panel can carry a different emphasis without changing the API, which makes the component useful for docs, showcases, and media rails.',
			points: [
				'Slides can hold short-form promos or richer summaries',
				'The layout stays stable while content emphasis changes'
			],
			stats: [
				{ label: 'Surface', value: 'Docs' },
				{ label: 'Pattern', value: 'Highlights' },
				{ label: 'Focus', value: 'Context' },
				{ label: 'Rhythm', value: 'Paced' }
			]
		},
		{
			id: 'commerce',
			eyebrow: 'Merchandising',
			title: 'Fill wide layouts with useful decisions, not dead space',
			description:
				'Wide carousels benefit from summary blocks and strong typography so the active slide still feels purposeful on large screens.',
			points: [
				'Support comparison-style content inside the slide body',
				'Add compact stats to anchor the next action'
			],
			stats: [
				{ label: 'Format', value: 'Panels' },
				{ label: 'Signal', value: 'Strong' },
				{ label: 'Scale', value: 'Responsive' },
				{ label: 'Use case', value: 'Featured sets' }
			]
		}
	];
</script>

<div class="demo">
	<Carousel.Root loop>
		<Carousel.Viewport>
			{#each slides as slide (slide.id)}
				<Carousel.Slide>
					<article class="panel" data-slide={slide.id}>
						<div class="copy">
							<span class="eyebrow">{slide.eyebrow}</span>
							<div class="headline">
								<h3>{slide.title}</h3>
								<p>{slide.description}</p>
							</div>
							<ul class="points" aria-label={`${slide.eyebrow} highlights`}>
								{#each slide.points as point (point)}
									<li>{point}</li>
								{/each}
							</ul>
						</div>

						<div class="summary">
							<span class="summary-label">At a glance</span>
							<div class="stats">
								{#each slide.stats as stat (stat.label)}
									<div class="stat">
										<span>{stat.label}</span>
										<strong>{stat.value}</strong>
									</div>
								{/each}
							</div>
						</div>
					</article>
				</Carousel.Slide>
			{/each}
		</Carousel.Viewport>

		<div class="controls">
			<div class="nav">
				<Carousel.Prev />
				<Carousel.Next />
			</div>
			<Carousel.Dots />
		</div>
	</Carousel.Root>
</div>

<style>
	.demo {
		container-type: inline-size;
		--dry-carousel-gap: var(--dry-space-3);
		display: grid;
		gap: var(--dry-space-4);
	}

	.panel {
		--panel-accent: var(--dry-color-fill-brand);

		display: grid;
		grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
		gap: var(--dry-space-5);
		padding: var(--dry-space-5);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: calc(var(--dry-radius-xl) + var(--dry-space-1));
		background:
			radial-gradient(
				circle at top right,
				color-mix(in srgb, var(--panel-accent) 22%, transparent),
				transparent 42%
			),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--dry-color-bg-raised) 94%, var(--panel-accent) 6%),
				var(--dry-color-bg)
			);
	}

	.panel[data-slide='editorial'] {
		--panel-accent: var(--dry-color-fill-hover);
	}

	.panel[data-slide='commerce'] {
		--panel-accent: var(--dry-color-fill);
	}

	.copy {
		display: grid;
		gap: var(--dry-space-4);
		align-content: start;
	}

	.eyebrow {
		display: inline-grid;
		justify-self: start;
		padding: var(--dry-space-1_5) var(--dry-space-2_5);
		border: 1px solid color-mix(in srgb, var(--panel-accent) 44%, var(--dry-color-stroke-weak));
		border-radius: 9999px;
		background: color-mix(in srgb, var(--panel-accent) 16%, transparent);
		color: var(--dry-color-text-strong);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.headline {
		display: grid;
		gap: var(--dry-space-2);
	}

	h3 {
		margin: 0;
		font-size: clamp(1.5rem, 2vw, 2rem);
		line-height: 1.05;
		letter-spacing: -0.03em;
	}

	p {
		margin: 0;
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-body-size, var(--dry-text-md-size));
		line-height: 1.6;
	}

	.points {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.points li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--dry-space-2);
		align-items: start;
		color: var(--dry-color-text);
		line-height: 1.5;
	}

	.points li::before {
		content: '';
		display: inline-grid;
		height: var(--dry-space-2);
		aspect-ratio: 1;
		margin-top: 0.45em;
		border-radius: 9999px;
		background: var(--panel-accent);
	}

	.summary {
		display: grid;
		gap: var(--dry-space-3);
		align-content: end;
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 86%, var(--panel-accent) 14%);
		border-radius: var(--dry-radius-xl);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 88%, var(--panel-accent) 12%);
	}

	.summary-label {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-2);
	}

	.stat {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-3);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 82%, var(--panel-accent) 18%);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg) 76%, var(--panel-accent) 24%);
	}

	.stat span {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-text-xs-size, 0.75rem);
		line-height: 1.2;
		text-transform: uppercase;
	}

	.stat strong {
		color: var(--dry-color-text-strong);
		font-size: var(--dry-type-body-size, var(--dry-text-md-size));
		line-height: 1.2;
	}

	.controls {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
	}

	.nav {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-2);
	}

	@container (max-width: 840px) {
		.panel {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
