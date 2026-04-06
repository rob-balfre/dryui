import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type GradientMeshSpeed = 'slow' | 'normal' | 'fast' | number;
export interface GradientMeshProps extends HTMLAttributes<HTMLDivElement> {
    colors?: readonly [string, string, string, string];
    speed?: GradientMeshSpeed;
    interactive?: boolean;
    children?: Snippet;
}
export { default as GradientMesh } from './gradient-mesh.svelte';
