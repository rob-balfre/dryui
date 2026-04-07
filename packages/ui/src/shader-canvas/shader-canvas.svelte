<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		ShaderCanvas as ShaderCanvasPrimitive,
		type ShaderCanvasProps as PrimitiveShaderCanvasProps
	} from '@dryui/primitives/shader-canvas';
	import { extractThemeColor } from '../internal/motion.js';
	import { PRESETS } from './presets.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		fragmentShader?: string;
		vertexShader?: PrimitiveShaderCanvasProps['vertexShader'];
		autoUniforms?: PrimitiveShaderCanvasProps['autoUniforms'];
		uniforms?: PrimitiveShaderCanvasProps['uniforms'];
		pixelRatio?: PrimitiveShaderCanvasProps['pixelRatio'];
		fps?: PrimitiveShaderCanvasProps['fps'];
		paused?: PrimitiveShaderCanvasProps['paused'];
		fallback?: PrimitiveShaderCanvasProps['fallback'];
		children: Snippet;
		preset?:
			| 'gradient-flow'
			| 'particle-field'
			| 'wave-distortion'
			| 'mesh-gradient'
			| 'liquid-metal';
		themeColors?: boolean;
		aspectRatio?: string;
	}

	let {
		fragmentShader,
		vertexShader,
		autoUniforms = { time: true, resolution: true },
		uniforms = {},
		pixelRatio,
		fps,
		paused = $bindable(false),
		fallback,
		children: childSnippet,
		preset,
		themeColors = false,
		aspectRatio,
		class: className,
		...rest
	}: Props = $props();

	let containerEl = $state<HTMLDivElement | null>(null);
	let themeUniforms = $state<Record<string, number[]>>({});

	function captureContainer(node: HTMLDivElement) {
		containerEl = node;
		return () => {
			if (containerEl === node) containerEl = null;
		};
	}

	const resolvedShader = $derived.by((): string => {
		if (fragmentShader) return fragmentShader;
		if (preset) {
			const presetShader = PRESETS[preset];
			if (presetShader) return presetShader;
		}
		return PRESETS['gradient-flow']!;
	});

	const mergedUniforms = $derived({ ...themeUniforms, ...uniforms });

	function setAspectRatio(node: HTMLDivElement) {
		$effect(() => {
			if (aspectRatio) {
				node.style.setProperty('aspect-ratio', aspectRatio);
			} else {
				node.style.removeProperty('aspect-ratio');
			}
		});
	}

	onMount(() => {
		if (themeColors && containerEl) {
			try {
				const primary = extractThemeColor('--dry-color-fill-brand', containerEl);
				const secondary = extractThemeColor('--dry-color-bg-raised', containerEl);
				themeUniforms = {
					u_color_primary: primary,
					u_color_secondary: secondary
				};
			} catch {
				// Fallback: no theme colors available
			}
		}
	});
</script>

<div {@attach captureContainer} {@attach setAspectRatio} data-shader-canvas-root class={className}>
	<ShaderCanvasPrimitive
		fragmentShader={resolvedShader}
		{autoUniforms}
		uniforms={mergedUniforms}
		bind:paused
		data-shader-canvas
		{...Object.fromEntries(
			Object.entries({ vertexShader, pixelRatio, fps, fallback }).filter(([, v]) => v !== undefined)
		)}
	>
		{#if childSnippet}
			{@render childSnippet()}
		{/if}
	</ShaderCanvasPrimitive>
</div>

<style>
	[data-shader-canvas-root] {
		display: grid;
		position: relative;
		overflow: hidden;
		border-radius: inherit;
	}

	[data-shader-canvas] {
		height: 100%;
	}
</style>
