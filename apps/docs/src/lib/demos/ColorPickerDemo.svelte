<script lang="ts">
	import { ColorPicker, Field, Label } from '@dryui/ui';

	let brand = $state('#ff7a45');
</script>

<div class="panel">
	<div class="context">
		<p class="eyebrow">Theme tokens</p>
		<p class="title">Brand accent</p>
		<p class="note">
			Drives <code>--dry-color-primary</code> across buttons, focus rings, and active states.
			Current value: <strong>{brand.toUpperCase()}</strong>.
		</p>
	</div>

	<Field.Root>
		<Label>Primary hue</Label>
		<ColorPicker.Root bind:value={brand}>
			<ColorPicker.Area />
			<ColorPicker.HueSlider />
			<ColorPicker.AlphaSlider />
			<ColorPicker.Input format="hex" />
			<ColorPicker.EyeDropper>Pick from screen</ColorPicker.EyeDropper>
		</ColorPicker.Root>
	</Field.Root>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.context {
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

	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	code,
	strong {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		font-weight: 500;
		color: var(--dry-color-text-strong);
	}
</style>
