<script lang="ts">
	import { BorderBeam, CodeBlock, NumberInput, Slider, ToggleGroup } from '@dryui/ui';
	import { isDarkTheme } from '$lib/theme.svelte';

	type BeamSize = 'md' | 'sm' | 'line';
	type BeamColor = 'colorful' | 'mono' | 'ocean' | 'sunset';

	let playgroundActive = $state(true);
	let sizeValue = $state(['md']);
	let colorValue = $state(['sunset']);
	let playgroundDuration = $state<number | undefined>(1.96);
	let playgroundStrength = $state(100);

	let playgroundSize = $derived((sizeValue[0] ?? 'md') as BeamSize);
	let playgroundColorVariant = $derived((colorValue[0] ?? 'sunset') as BeamColor);

	let demoTheme = $derived<'light' | 'dark'>(isDarkTheme() ? 'dark' : 'light');
	let previewCardClass = $derived(
		playgroundSize === 'sm' ? 'preview-card preview-card-sm' : 'preview-card preview-card-md'
	);
	let previewShellClass = $derived(
		playgroundSize === 'sm' ? 'preview-shell preview-shell-sm' : 'preview-shell preview-shell-md'
	);
	let previewText = $derived(playgroundSize === 'sm' ? '' : 'Build anything...');
	let previewActionLabel = $derived(playgroundActive ? 'Pause animation' : 'Play animation');
	let beamStrength = $derived(playgroundStrength / 100);
	let normalizedDuration = $derived<number>(
		typeof playgroundDuration === 'number' &&
			Number.isFinite(playgroundDuration) &&
			playgroundDuration > 0
			? playgroundDuration
			: 1.96
	);
	let codeStrength = $derived(Number(beamStrength.toFixed(2)));
	let codeDuration = $derived(Number(normalizedDuration.toFixed(2)));
	let playgroundCode = $derived.by(() => {
		const strengthProp = codeStrength < 1 ? ` strength={${codeStrength}}` : '';

		return `<BorderBeam size="${playgroundSize}" colorVariant="${playgroundColorVariant}" duration={${codeDuration}}${strengthProp}>
  <Card>Content</Card>
</BorderBeam>`;
	});

	function togglePreview() {
		playgroundActive = !playgroundActive;
	}

	function handlePreviewKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			togglePreview();
		}
	}
</script>

<section class="playground" aria-label="Interactive Border Beam playground">
	<div class="playground-header">
		<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
		<h3 class="playground-title">Playground</h3>
		<p class="playground-copy">
			The docs theme toggle drives the preview, so the same controls show both dark and light mode.
		</p>
	</div>

	<div class="playground-controls">
		<div class="control-group">
			<span class="control-label">Type</span>
			<ToggleGroup.Root type="single" size="sm" bind:value={sizeValue} aria-label="Beam size">
				<ToggleGroup.Item value="md">Large</ToggleGroup.Item>
				<ToggleGroup.Item value="sm">Small</ToggleGroup.Item>
				<ToggleGroup.Item value="line">Line</ToggleGroup.Item>
			</ToggleGroup.Root>
		</div>

		<div class="control-group">
			<span class="control-label">Color</span>
			<ToggleGroup.Root type="single" size="sm" bind:value={colorValue} aria-label="Beam color">
				<ToggleGroup.Item value="colorful">Colorful</ToggleGroup.Item>
				<ToggleGroup.Item value="mono">Mono</ToggleGroup.Item>
				<ToggleGroup.Item value="ocean">Ocean</ToggleGroup.Item>
				<ToggleGroup.Item value="sunset">Sunset</ToggleGroup.Item>
			</ToggleGroup.Root>
		</div>

		<label class="control-group">
			<span class="control-label">Duration</span>
			<div class="duration-shell">
				<NumberInput
					size="sm"
					bind:value={playgroundDuration}
					min={0.5}
					max={10}
					step={0.1}
					aria-label="Animation duration in seconds"
				/>
			</div>
		</label>

		<label class="control-group">
			<span class="control-label">Strength</span>
			<Slider
				variant="pill"
				size="sm"
				bind:value={playgroundStrength}
				min={0}
				max={100}
				step={1}
				aria-label="Beam strength"
			/>
		</label>
	</div>

	<div
		class="playground-preview"
		role="button"
		tabindex="0"
		aria-pressed={playgroundActive}
		aria-label={previewActionLabel}
		onclick={togglePreview}
		onkeydown={handlePreviewKeydown}
	>
		<div class={previewShellClass}>
			<BorderBeam
				size={playgroundSize}
				colorVariant={playgroundColorVariant}
				theme={demoTheme}
				active={playgroundActive}
				duration={normalizedDuration}
				strength={beamStrength}
			>
				<div class={previewCardClass}>
					{#if previewText}
						<p class="preview-text">{previewText}</p>
					{/if}
				</div>
			</BorderBeam>
		</div>
	</div>

	<CodeBlock code={playgroundCode} language="svelte" />
</section>

<style>
	.playground {
		display: grid;
		gap: var(--dry-space-3);
		container-type: inline-size;
	}

	.playground-header {
		display: grid;
		gap: var(--dry-space-1);
	}

	.playground-title {
		margin: 0;
		font-size: var(--dry-text-lg-size, 1.25rem);
		line-height: var(--dry-text-lg-line-height, 1.4);
	}

	.playground-copy {
		margin: 0;
		color: var(--dry-color-text-weak);
		font-size: var(--dry-text-sm-size, 0.875rem);
		line-height: 1.6;
	}

	.playground-controls,
	.playground-preview {
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 92%, var(--dry-color-text-strong) 8%);
	}

	.playground-controls {
		display: grid;
		grid-template-columns: auto auto auto minmax(0, 1fr);
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
	}

	.control-group {
		display: grid;
		gap: var(--dry-space-2);
		align-content: start;
	}

	.control-label {
		font-size: var(--dry-text-sm-size, 0.875rem);
		line-height: 1.4;
		color: var(--dry-color-text-weak);
	}

	.playground-preview:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--dry-color-fill-brand) 50%, transparent);
		outline-offset: 2px;
	}

	.duration-shell {
		display: grid;
		justify-self: start;
	}

	.playground-preview {
		display: grid;
		place-items: center;
		min-block-size: 19rem;
		padding: var(--dry-space-8);
		cursor: pointer;
		transition:
			background-color 150ms ease,
			border-color 150ms ease;
		background:
			radial-gradient(
				circle at top,
				color-mix(in srgb, var(--dry-color-fill-brand) 10%, transparent),
				transparent 42%
			),
			color-mix(in srgb, var(--dry-color-bg-base) 96%, var(--dry-color-text-strong) 4%);
	}

	.playground-preview:hover {
		border-color: color-mix(in srgb, var(--dry-color-fill-brand) 24%, var(--dry-color-stroke-weak));
	}

	.preview-shell {
		display: grid;
	}

	.preview-shell-sm {
		grid-template-columns: 80px;
	}

	.preview-shell-md {
		grid-template-columns: 348px;
	}

	.preview-card {
		display: grid;
		box-sizing: border-box;
		align-items: center;
		padding: 24px;
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-raised) 96%, white 4%),
			color-mix(in srgb, var(--dry-color-bg-base) 94%, black 6%)
		);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-strong) 58%, transparent);
		box-shadow:
			/* dryui-allow inset-shadow: intentional top highlight rail on preview card. */
			inset 0 1px 0 color-mix(in srgb, white 10%, transparent),
			0 1.5rem 3rem color-mix(in srgb, black 14%, transparent);
	}

	.preview-card-sm {
		grid-template-columns: 80px;
		block-size: 36px;
		border-radius: 999px;
		padding: 0;
	}

	.preview-card-md {
		grid-template-columns: 348px;
		block-size: 66px;
	}

	.preview-text {
		margin: 0;
		color: color-mix(in srgb, var(--dry-color-text-weak) 86%, var(--dry-color-text-strong) 14%);
		font-size: 0.8125rem;
		line-height: 1.2308;
	}

	@container (max-width: 52rem) {
		.playground-controls {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@container (max-width: 35rem) {
		.playground-controls {
			grid-template-columns: 1fr;
		}

		.playground-preview {
			padding: var(--dry-space-5);
		}
	}
</style>
