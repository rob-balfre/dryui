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
		'position-try-fallbacks': 'var(--dry-anchor-try-fallbacks, flip-block, flip-inline)'
	};

	if (side === 'bottom') {
		if (align === 'start') {
			styles['position-area'] = 'block-end span-inline-end';
			styles['justify-self'] = 'start';
		} else if (align === 'end') {
			styles['position-area'] = 'block-end span-inline-start';
			styles['justify-self'] = 'end';
		} else {
			styles['position-area'] = 'block-end';
			styles['justify-self'] = 'anchor-center';
		}
	} else if (side === 'top') {
		if (align === 'start') {
			styles['position-area'] = 'block-start span-inline-end';
			styles['justify-self'] = 'start';
		} else if (align === 'end') {
			styles['position-area'] = 'block-start span-inline-start';
			styles['justify-self'] = 'end';
		} else {
			styles['position-area'] = 'block-start';
			styles['justify-self'] = 'anchor-center';
		}
	} else if (side === 'right') {
		if (align === 'start') {
			styles['position-area'] = 'inline-end span-block-end';
			styles['align-self'] = 'start';
		} else if (align === 'end') {
			styles['position-area'] = 'inline-end span-block-start';
			styles['align-self'] = 'end';
		} else {
			styles['position-area'] = 'inline-end';
			styles['align-self'] = 'anchor-center';
		}
	} else {
		if (align === 'start') {
			styles['position-area'] = 'inline-start span-block-end';
			styles['align-self'] = 'start';
		} else if (align === 'end') {
			styles['position-area'] = 'inline-start span-block-start';
			styles['align-self'] = 'end';
		} else {
			styles['position-area'] = 'inline-start';
			styles['align-self'] = 'anchor-center';
		}
	}

	if (side === 'bottom') styles['margin-top'] = `${offset}px`;
	else if (side === 'top') styles['margin-bottom'] = `${offset}px`;
	else if (side === 'right') styles['margin-left'] = `${offset}px`;
	else if (side === 'left') styles['margin-right'] = `${offset}px`;

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
		ref.style.anchorName = [...names].join(', ');
		styles = getCSSStyles(placement, offset, anchorName);

		return () => {
			const current = new Set(
				(ref.style.anchorName || '')
					.split(',')
					.map((s: string) => s.trim())
					.filter(Boolean)
			);
			current.delete(anchorName);
			ref.style.anchorName = current.size > 0 ? [...current].join(', ') : '';
		};
	});

	return {
		get styles() {
			return styles;
		}
	};
}
