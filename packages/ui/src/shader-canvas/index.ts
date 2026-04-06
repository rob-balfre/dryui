import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ShaderCanvasProps as PrimitiveShaderCanvasProps } from '@dryui/primitives/shader-canvas';

export type ShaderCanvasPreset =
	| 'gradient-flow'
	| 'particle-field'
	| 'wave-distortion'
	| 'mesh-gradient'
	| 'liquid-metal';

export interface ShaderCanvasProps extends HTMLAttributes<HTMLDivElement> {
	fragmentShader?: string;
	vertexShader?: PrimitiveShaderCanvasProps['vertexShader'];
	autoUniforms?: PrimitiveShaderCanvasProps['autoUniforms'];
	uniforms?: PrimitiveShaderCanvasProps['uniforms'];
	pixelRatio?: PrimitiveShaderCanvasProps['pixelRatio'];
	fps?: PrimitiveShaderCanvasProps['fps'];
	paused?: PrimitiveShaderCanvasProps['paused'];
	fallback?: PrimitiveShaderCanvasProps['fallback'];
	children: Snippet;
	preset?: ShaderCanvasPreset;
	themeColors?: boolean;
	aspectRatio?: string;
}

export { default as ShaderCanvas } from './shader-canvas.svelte';
export { PRESETS } from './presets.js';
