import { createAnchorPosition } from './anchor-position.svelte.js';
import type { Placement } from './anchor-position.svelte.js';

export type { Placement };

interface AnchorStylesOptions {
	triggerEl: () => HTMLElement | null;
	contentEl: () => HTMLElement | null;
	placement: () => Placement;
	offset: () => number;
}

export function useAnchorStyles(options: AnchorStylesOptions) {
	const position = createAnchorPosition(options.triggerEl, options.contentEl, {
		get placement() {
			return options.placement();
		},
		get offset() {
			return options.offset();
		}
	});

	function applyPosition(node: HTMLElement, initialUserStyle?: string | null) {
		let userStyle = $state(initialUserStyle);

		$effect(() => {
			node.style.cssText = typeof userStyle === 'string' ? userStyle : '';
			const styles = position.styles;
			for (const [key, value] of Object.entries(styles)) {
				node.style.setProperty(key, value);
			}
		});

		return {
			update(newUserStyle?: string | null) {
				userStyle = newUserStyle;
			}
		};
	}

	return {
		get styles() {
			return position.styles;
		},
		applyPosition
	};
}
