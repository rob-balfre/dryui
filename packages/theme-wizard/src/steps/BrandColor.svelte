<script lang="ts">
	import { Button } from '@dryui/ui';
	import { ColorPicker } from '@dryui/ui/color-picker';
	import { Text } from '@dryui/ui/text';
	import { setBrandHsb, getDerivedTheme, wizardState } from '../state.svelte.js';
	import {
		PRESETS,
		generateTheme,
		hexToHsl,
		hslToHsb,
		hsbToHsl,
		hslToHex
	} from '../engine/index.js';
	import { bg } from '../actions';

	let { mode = 'light' }: { mode?: 'light' | 'dark' } = $props();

	let isDark = $derived(mode === 'dark');

	const SWATCH_TOKENS = [
		{ key: '--dry-color-fill', label: 'Fill' },
		{ key: '--dry-color-stroke-strong', label: 'Stroke' },
		{ key: '--dry-color-fill-brand', label: 'Brand' },
		{ key: '--dry-color-text-strong', label: 'Text' }
	] as const;

	const PRESET_THEMES = PRESETS.map((p) => generateTheme(p.brandInput));

	let activeTokens = $derived.by(() => {
		const t = getDerivedTheme();
		return isDark ? t.dark : t.light;
	});

	let themeSwatches = $derived(
		SWATCH_TOKENS.map(({ key, label }) => ({
			color: activeTokens[key] ?? '',
			label
		}))
	);

	let pickerColor = $derived.by(() => {
		const hsl = hsbToHsl(
			wizardState.brandHsb.h,
			wizardState.brandHsb.s / 100,
			wizardState.brandHsb.b / 100
		);
		return hslToHex(hsl.h, hsl.s, hsl.l);
	});

	const pickerModel = {
		get hex() {
			return pickerColor;
		},
		set hex(value: string) {
			if (!value || value === pickerColor) return;
			const hsl = hexToHsl(value);
			const hsb = hslToHsb(hsl.h, hsl.s, hsl.l);
			setBrandHsb(hsb.h, Math.round(hsb.s * 100), Math.round(hsb.b * 100));
		}
	};

	function selectPreset(preset: (typeof PRESETS)[number]) {
		setBrandHsb(preset.brandInput.h, preset.brandInput.s, preset.brandInput.b);
	}
</script>

<section class="brand-section">
	<div class="picker-wrap">
		<ColorPicker.Root bind:value={pickerModel.hex} areaHeight={160}>
			<ColorPicker.Area />
			<ColorPicker.HueSlider />
			<ColorPicker.Input format="hex" />
		</ColorPicker.Root>
	</div>

	<div class="swatch-and-presets">
		<div class="swatch-strip" use:bg={activeTokens['--dry-color-bg-base'] ?? '#ffffff'}>
			{#each themeSwatches as swatch (swatch.label)}
				<div class="swatch-col">
					<div class="swatch" use:bg={swatch.color}></div>
					<span class="swatch-label">{swatch.label}</span>
				</div>
			{/each}
		</div>

		<div class="presets">
			{#each PRESETS as preset, i (preset.name)}
				{@const presetTheme = PRESET_THEMES[i] ?? PRESET_THEMES[0]!}
				{@const presetTokens = isDark ? presetTheme.dark : presetTheme.light}
				<Button type="button" variant="bare" onclick={() => selectPreset(preset)}>
					<div
						class="preset-btn"
						data-selected={wizardState.brandHsb.h === preset.brandInput.h &&
						wizardState.brandHsb.s === preset.brandInput.s &&
						wizardState.brandHsb.b === preset.brandInput.b
							? ''
							: undefined}
					>
						<div class="preset-thumb">
							{#each SWATCH_TOKENS as { key } (key)}
								<div class="preset-swatch" use:bg={presetTokens[key] ?? ''}></div>
							{/each}
						</div>
						<Text as="span" size="xs" color="muted">{preset.name.toLowerCase()}</Text>
					</div>
				</Button>
			{/each}
		</div>
	</div>
</section>

<style>
	.brand-section {
		display: grid;
		gap: var(--dry-space-5);
		container-type: inline-size;
	}

	.swatch-and-presets {
		display: grid;
		gap: var(--dry-space-4);
	}

	.swatch-strip {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0;
		overflow: hidden;
		border-radius: var(--dry-radius-md);
		align-self: end;
		border: 1px solid var(--dry-color-stroke-weak);
	}

	.swatch-col {
		display: grid;
		gap: var(--dry-space-1);
	}

	.swatch {
		min-height: 3.5rem;
	}

	.swatch-label {
		text-align: center;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-type-xs-size, 0.7rem);
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding-block: var(--dry-space-1);
	}

	.presets {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
		gap: var(--dry-space-3);
	}

	.preset-btn {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2);
		border-radius: var(--dry-radius-md);
		border: 1px solid transparent;
		background: none;
		cursor: pointer;
		transition: border-color 0.15s;
		appearance: none;
		text-align: center;
	}

	.preset-btn:hover {
		border-color: var(--dry-color-stroke-weak);
	}

	.preset-btn[data-selected] {
		border-color: var(--dry-color-stroke-brand);
	}

	.preset-thumb {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		height: 2rem;
		overflow: hidden;
		border-radius: var(--dry-radius-sm);
	}

	.preset-swatch {
		height: 100%;
	}

	@container (min-width: 40rem) {
		.brand-section {
			grid-template-columns: auto minmax(0, 1fr);
			align-items: end;
		}

		.swatch {
			min-height: 5rem;
		}
	}

	@container (max-width: 30rem) {
		.swatch {
			min-height: 2rem;
		}

		.swatch-strip {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.presets {
			grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
		}
	}
</style>
