<script lang="ts">
	import { Halftone } from '@dryui/ui';

	const callouts = [
		{
			label: 'Paper texture',
			body: 'The dots show up when the backdrop has a bright tonal range to work against.'
		},
		{
			label: 'Angle',
			body: 'A slight rotation makes the pattern feel like print rather than a flat overlay.'
		},
		{
			label: 'Opacity',
			body: 'Enough contrast to read, not so much that it turns into noise.'
		}
	] as const;
</script>

<div class="demo-shell">
	<Halftone dotSize="coarse" angle={24} opacity={0.44} color="rgba(88, 51, 27, 0.94)">
		<section class="poster">
			<div class="header">
				<div class="eyebrow">Halftone print surface</div>
				<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
				<h3>Make the dots compete with tonal range.</h3>
				<p>
					Put the overlay over a bright poster, a lit paper card, and a few saturated blocks so the
					pattern and ink color are obvious instead of invisible.
				</p>
			</div>

			<div class="artboard" aria-hidden="true">
				<div class="art art-primary">
					<span>Sunrise</span>
					<strong>Print texture</strong>
				</div>
				<div class="art art-secondary">
					<span>Midday</span>
					<strong>Color field</strong>
				</div>
				<div class="art art-tertiary">
					<span>Night</span>
					<strong>Ink depth</strong>
				</div>
			</div>

			<div class="notes">
				{#each callouts as note (note.label)}
					<article class="note">
						<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
						<h4>{note.label}</h4>
						<p>{note.body}</p>
					</article>
				{/each}
			</div>
		</section>
	</Halftone>
</div>

<style>
	.demo-shell {
		display: grid;
		min-block-size: 36rem;
		padding: 1.5rem;
		border-radius: 1.5rem;
		background: linear-gradient(
			145deg,
			color-mix(in oklab, var(--dry-color-bg-raised) 90%, white 10%),
			color-mix(in oklab, var(--dry-color-bg-raised) 70%, var(--dry-color-fill-brand) 30%)
		);
	}

	.poster {
		display: grid;
		gap: 1.25rem;
		padding: 1.5rem;
		border-radius: 1.25rem;
		border: 1px solid color-mix(in oklab, var(--dry-color-stroke-weak) 72%, transparent);
		background: linear-gradient(
			155deg,
			color-mix(in oklab, var(--dry-color-bg-raised) 94%, white 6%),
			color-mix(in oklab, var(--dry-color-bg-raised) 82%, var(--dry-color-fill-brand) 18%)
		);
	}

	.header {
		display: grid;
		gap: 0.55rem;
	}

	.eyebrow {
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: color-mix(in oklab, var(--dry-color-text-strong) 58%, transparent);
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
		color: color-mix(in oklab, var(--dry-color-text-strong) 76%, transparent);
	}

	.artboard,
	.notes {
		display: grid;
		gap: 0.75rem;
	}

	.artboard {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.art {
		display: grid;
		align-content: end;
		gap: 0.4rem;
		min-block-size: 10rem;
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid color-mix(in oklab, var(--dry-color-stroke-weak) 68%, transparent);
		color: color-mix(in oklab, var(--dry-color-text-strong) 20%, black 80%);
	}

	.art span {
		font-size: 0.76rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: color-mix(in oklab, var(--dry-color-text-strong) 34%, black 66%);
	}

	.art strong {
		font-size: 1.25rem;
	}

	.art-primary {
		background: linear-gradient(145deg, #f9d39a, #f19aa5 54%, #a978f5);
	}

	.art-secondary {
		background: linear-gradient(145deg, #f7f0c1, #8dd6e8 52%, #5fa4ff);
	}

	.art-tertiary {
		background: linear-gradient(145deg, #e7edf8, #c6a7ef 54%, #7a60dd);
	}

	.notes {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.note {
		display: grid;
		gap: 0.35rem;
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid color-mix(in oklab, var(--dry-color-stroke-weak) 72%, transparent);
		background: color-mix(in oklab, var(--dry-color-bg-raised) 86%, white 14%);
	}

	.note h4 {
		font-size: 1rem;
	}

	.note p {
		font-size: 0.95rem;
	}
</style>
