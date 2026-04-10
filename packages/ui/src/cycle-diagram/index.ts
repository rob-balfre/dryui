import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { HTMLAttributes } from 'svelte/elements';

export interface CycleDiagramRootProps extends SVGAttributes<SVGSVGElement> {
	phaseCount: number;
	label?: string;
	children: Snippet;
}

export interface CycleDiagramPhaseProps extends SVGAttributes<SVGGElement> {
	color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
	children: Snippet;
}

import CycleDiagramRoot from './cycle-diagram-root.svelte';
import CycleDiagramPhase from './cycle-diagram-phase.svelte';

export const CycleDiagram: {
	Root: typeof CycleDiagramRoot;
	Phase: typeof CycleDiagramPhase;
} = {
	Root: CycleDiagramRoot,
	Phase: CycleDiagramPhase
};
