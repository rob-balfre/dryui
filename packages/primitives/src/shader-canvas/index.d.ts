import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface ShaderCanvasAutoUniforms {
    time?: boolean;
    resolution?: boolean;
    mouse?: boolean;
    scroll?: boolean;
}
export interface ShaderCanvasProps extends HTMLAttributes<HTMLDivElement> {
    fragmentShader: string;
    vertexShader?: string;
    autoUniforms?: ShaderCanvasAutoUniforms;
    uniforms?: Record<string, number | number[]>;
    pixelRatio?: number;
    fps?: number;
    paused?: boolean;
    fallback?: Snippet;
    children?: Snippet;
}
export { default as ShaderCanvas } from './shader-canvas.svelte';
export { createShaderProgram, setUniform, type ShaderProgram } from './webgl-context.js';
export { DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER } from './default-shaders.js';
