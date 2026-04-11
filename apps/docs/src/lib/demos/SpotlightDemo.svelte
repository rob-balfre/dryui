<script lang="ts">
	import { Spotlight, Text } from '@dryui/ui';
</script>

<div class="demo">
	<div class="surface">
		<Spotlight radius={320} intensity={38} color="rgba(96, 165, 250, 0.32)">
			<div class="content">
				<div class="intro">
					<p class="eyebrow">Pointer tracking</p>
					<h3>Move across the panel to pull the light toward the cursor.</h3>
					<Text color="secondary">
						This is the point of Spotlight: a hover signal that pulls attention toward the active
						area without adding a shader runtime.
					</Text>
				</div>

				<div class="matrix" aria-label="Interactive spotlight summary">
					<div class="tile">
						<p class="label">Radius</p>
						<p class="value">320px</p>
					</div>
					<div class="tile">
						<p class="label">Blend</p>
						<p class="value">Soft focus over dark glass</p>
					</div>
					<div class="tile">
						<p class="label">Motion</p>
						<p class="value">Pointer-following highlight</p>
					</div>
					<div class="tile">
						<p class="label">Fallback</p>
						<p class="value">Still reads when motion is reduced</p>
					</div>
				</div>
			</div>
		</Spotlight>
	</div>

	<div class="surface">
		<Spotlight radius={240} intensity={52} color="rgba(244, 114, 182, 0.26)" followPointer={false}>
			<div class="content">
				<div class="intro">
					<p class="eyebrow">Static focus</p>
					<h3>A centered glow that stays visible without pointer movement.</h3>
					<Text color="secondary">
						Use the static variant when a card needs built-in focal contrast before the user even
						hovers it.
					</Text>
				</div>

				<div class="matrix matrix-tight" aria-label="Static spotlight summary">
					<div class="tile">
						<p class="label">Intensity</p>
						<p class="value">52%</p>
					</div>
					<div class="tile">
						<p class="label">Color</p>
						<p class="value">Warm editorial pink</p>
					</div>
					<div class="tile">
						<p class="label">Purpose</p>
						<p class="value">Demo that reads instantly in screenshots</p>
					</div>
				</div>
			</div>
		</Spotlight>
	</div>
</div>

<style>
	.demo {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--dry-space-4);
	}

	.surface {
		border-radius: var(--dry-radius-lg);
		border: 1px solid var(--dry-color-stroke-weak);
		background:
			radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08), transparent 28%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01)),
			var(--dry-color-bg-raised);
		min-block-size: 20rem;
	}

	.content {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-6);
	}

	.intro {
		display: grid;
		gap: var(--dry-space-2);
	}

	.eyebrow,
	.label,
	.value,
	h3 {
		margin: 0;
	}

	.eyebrow,
	.label {
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.72rem;
		color: var(--dry-color-text-weak);
	}

	h3 {
		font-size: clamp(1.4rem, 2.8vw, 1.85rem);
		line-height: 1.02;
		color: var(--dry-color-text-strong);
	}

	.matrix {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		gap: var(--dry-space-3);
	}

	.matrix-tight {
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
	}

	.tile {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-4);
		border-radius: var(--dry-radius-md);
		border: 1px solid rgba(255, 255, 255, 0.08);
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
			color-mix(in srgb, var(--dry-color-bg-raised) 82%, transparent);
	}

	.value {
		color: var(--dry-color-text-strong);
	}
</style>
