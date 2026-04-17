export type Placement =
	| 'top'
	| 'top-start'
	| 'top-end'
	| 'bottom'
	| 'bottom-start'
	| 'bottom-end'
	| 'left'
	| 'left-start'
	| 'left-end'
	| 'right'
	| 'right-start'
	| 'right-end';

export interface AnchorPositionOptions {
	placement?: Placement;
	offset?: number;
}

type Side = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'end' | undefined;

let anchorCounter = 0;

const sides = new Set<string>(['top', 'bottom', 'left', 'right']);
const aligns = new Set<string>(['start', 'end']);

function isSide(value: string | undefined): value is Side {
	return value != null && sides.has(value);
}

function isAlign(value: string | undefined): value is Align {
	return value === undefined || aligns.has(value);
}

function parsePlacement(placement: string): [Side, Align] {
	const parts = placement.split('-');
	const side: Side = isSide(parts[0]) ? parts[0] : 'bottom';
	const align: Align = isAlign(parts[1]) ? parts[1] : undefined;
	return [side, align];
}

function getCSSStyles(
	placement: string,
	offset: number,
	anchorName: string
): Record<string, string> {
	const [side, align] = parsePlacement(placement);
	const styles: Record<string, string> = {
		position: 'fixed',
		inset: 'unset',
		margin: '0',
		'position-anchor': anchorName,
		'position-try-fallbacks': 'flip-block, flip-inline'
	};

	if (side === 'bottom') {
		styles.top = `anchor(bottom)`;
		styles['margin-top'] = `${offset}px`;
	} else if (side === 'top') {
		styles.bottom = `anchor(top)`;
		styles['margin-bottom'] = `${offset}px`;
	} else if (side === 'right') {
		styles.left = `anchor(right)`;
		styles['margin-left'] = `${offset}px`;
	} else if (side === 'left') {
		styles.right = `anchor(left)`;
		styles['margin-right'] = `${offset}px`;
	}

	if (side === 'top' || side === 'bottom') {
		if (align === 'start') {
			styles.left = `anchor(left)`;
		} else if (align === 'end') {
			styles.right = `anchor(right)`;
		} else {
			styles.left = `anchor(center)`;
			styles.translate = '-50% 0';
		}
	} else {
		if (align === 'start') {
			styles.top = `anchor(top)`;
		} else if (align === 'end') {
			styles.bottom = `anchor(bottom)`;
		} else {
			styles.top = `anchor(center)`;
			styles.translate = '0 -50%';
		}
	}

	return styles;
}

export function createAnchorPosition(
	referenceEl: () => HTMLElement | null,
	floatingEl: () => HTMLElement | null,
	options?: AnchorPositionOptions
): { readonly styles: Record<string, string> } {
	const placement = options?.placement ?? 'bottom';
	const offset = options?.offset ?? 8;
	const anchorName = `--dryui-anchor-${anchorCounter++}`;

	let styles = $state<Record<string, string>>({});

	$effect(() => {
		const ref = referenceEl();
		const floating = floatingEl();
		if (!ref || !floating) return;

		// @ts-ignore anchorName may not be in CSSStyleDeclaration depending on TS lib version
		const prev = ref.style.anchorName;
		// Preserve any existing anchor-name by appending, so shared-anchor scenarios
		// (multiple panels anchored to the same root) don't stomp each other.
		const names = new Set(
			(prev || '')
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
		);
		names.add(anchorName);
		// @ts-ignore anchorName may not be in CSSStyleDeclaration depending on TS lib version
		ref.style.anchorName = [...names].join(', ');
		styles = getCSSStyles(placement, offset, anchorName);

		return () => {
			const current = new Set(
				// @ts-ignore anchorName may not be in CSSStyleDeclaration depending on TS lib version
				(ref.style.anchorName || '')
					.split(',')
					.map((s: string) => s.trim())
					.filter(Boolean)
			);
			current.delete(anchorName);
			// @ts-ignore anchorName may not be in CSSStyleDeclaration depending on TS lib version
			ref.style.anchorName = current.size > 0 ? [...current].join(', ') : '';
		};
	});

	return {
		get styles() {
			return styles;
		}
	};
}
