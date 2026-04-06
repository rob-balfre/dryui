import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface AutoUniforms {
	time?: boolean;
	resolution?: boolean;
	mouse?: boolean;
	scroll?: boolean;
}
interface Props extends HTMLAttributes<HTMLDivElement> {
	fragmentShader: string;
	vertexShader?: string;
	autoUniforms?: AutoUniforms;
	uniforms?: Record<string, number | number[]>;
	pixelRatio?: number;
	fps?: number;
	paused?: boolean;
	fallback?: Snippet;
	children?: Snippet;
}
declare const ShaderCanvas: import('svelte').Component<Props, {}, 'paused'>;
type ShaderCanvas = ReturnType<typeof ShaderCanvas>;
export default ShaderCanvas;
