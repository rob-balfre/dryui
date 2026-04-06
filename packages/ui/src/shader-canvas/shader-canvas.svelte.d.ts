import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type ShaderCanvasProps as PrimitiveShaderCanvasProps } from '@dryui/primitives/shader-canvas';
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
declare const ShaderCanvas: import('svelte').Component<Props, {}, 'paused'>;
type ShaderCanvas = ReturnType<typeof ShaderCanvas>;
export default ShaderCanvas;
