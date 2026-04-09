import type { Placement } from './anchor-position.svelte.js';
export type { Placement };
interface AnchorStylesOptions {
	triggerEl: () => HTMLElement | null;
	contentEl: () => HTMLElement | null;
	placement: () => Placement;
	offset: () => number;
}
export declare function useAnchorStyles(options: AnchorStylesOptions): {
	readonly styles: Record<string, string>;
	applyPosition: (
		node: HTMLElement,
		initialUserStyle?: string | null
	) => {
		update(newUserStyle?: string | null): void;
	};
};
