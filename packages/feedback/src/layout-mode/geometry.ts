import type { DetectedSection, Rect, DesignPlacement } from './types.js';

export type Guide = { axis: 'x' | 'y'; pos: number };
export type SnapRect = Rect;

export const MIN_SIZE = 24;
export const SNAP_THRESHOLD = 5;
export const MIN_CAPTURE_SIZE = 16;

function snapAxes(
	rect: SnapRect,
	targets: readonly SnapRect[],
	activeEdges?: { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean },
	extraRects?: readonly SnapRect[]
): { dx: number; dy: number; guides: Guide[] } {
	let bestDx = Infinity;
	let bestDy = Infinity;

	const middleLeft = rect.x;
	const middleRight = rect.x + rect.width;
	const middleCenterX = rect.x + rect.width / 2;
	const middleTop = rect.y;
	const middleBottom = rect.y + rect.height;
	const middleCenterY = rect.y + rect.height / 2;

	const allTargets: SnapRect[] = [];
	for (const target of targets) {
		allTargets.push(target);
	}
	if (extraRects) {
		allTargets.push(...extraRects);
	}

	const fromX = activeEdges
		? [...(activeEdges.left ? [middleLeft] : []), ...(activeEdges.right ? [middleRight] : [])]
		: [middleLeft, middleRight, middleCenterX];
	const fromY = activeEdges
		? [...(activeEdges.top ? [middleTop] : []), ...(activeEdges.bottom ? [middleBottom] : [])]
		: [middleTop, middleBottom, middleCenterY];

	for (const target of allTargets) {
		const left = target.x;
		const right = target.x + target.width;
		const centerX = target.x + target.width / 2;
		const top = target.y;
		const bottom = target.y + target.height;
		const centerY = target.y + target.height / 2;

		for (const from of fromX) {
			for (const to of [left, right, centerX]) {
				const delta = to - from;
				if (Math.abs(delta) < SNAP_THRESHOLD && Math.abs(delta) < Math.abs(bestDx)) {
					bestDx = delta;
				}
			}
		}

		for (const from of fromY) {
			for (const to of [top, bottom, centerY]) {
				const delta = to - from;
				if (Math.abs(delta) < SNAP_THRESHOLD && Math.abs(delta) < Math.abs(bestDy)) {
					bestDy = delta;
				}
			}
		}
	}

	const dx = Math.abs(bestDx) < SNAP_THRESHOLD ? bestDx : 0;
	const dy = Math.abs(bestDy) < SNAP_THRESHOLD ? bestDy : 0;
	const guides: Guide[] = [];
	const seen = new Set<string>();

	const snappedLeft = middleLeft + dx;
	const snappedRight = middleRight + dx;
	const snappedCenterX = middleCenterX + dx;
	const snappedTop = middleTop + dy;
	const snappedBottom = middleBottom + dy;
	const snappedCenterY = middleCenterY + dy;

	for (const target of allTargets) {
		const left = target.x;
		const right = target.x + target.width;
		const centerX = target.x + target.width / 2;
		const top = target.y;
		const bottom = target.y + target.height;
		const centerY = target.y + target.height / 2;

		for (const xPos of [left, centerX, right]) {
			for (const snapped of [snappedLeft, snappedCenterX, snappedRight]) {
				if (Math.abs(snapped - xPos) < 0.5) {
					const key = `x:${Math.round(xPos)}`;
					if (!seen.has(key)) {
						seen.add(key);
						guides.push({ axis: 'x', pos: xPos });
					}
				}
			}
		}

		for (const yPos of [top, centerY, bottom]) {
			for (const snapped of [snappedTop, snappedCenterY, snappedBottom]) {
				if (Math.abs(snapped - yPos) < 0.5) {
					const key = `y:${Math.round(yPos)}`;
					if (!seen.has(key)) {
						seen.add(key);
						guides.push({ axis: 'y', pos: yPos });
					}
				}
			}
		}
	}

	return { dx, dy, guides };
}

export function computeSnap(
	rect: SnapRect,
	others: readonly DesignPlacement[],
	excludeIds: ReadonlySet<string>,
	activeEdges?: { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean },
	extraRects?: readonly SnapRect[]
): { dx: number; dy: number; guides: Guide[] } {
	const targets = others
		.filter((placement) => !excludeIds.has(placement.id))
		.map((placement) => ({
			x: placement.x,
			y: placement.y,
			width: placement.width,
			height: placement.height
		}));

	return snapAxes(rect, targets, activeEdges, extraRects);
}

export function computeSectionSnap(
	rect: SnapRect,
	sections: readonly DetectedSection[],
	excludeIds: ReadonlySet<string>,
	activeEdges?: { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean },
	extraRects?: readonly SnapRect[]
): { dx: number; dy: number; guides: Guide[] } {
	const targets = sections
		.filter((section) => !excludeIds.has(section.id))
		.map((section) => section.currentRect);
	return snapAxes(rect, targets, activeEdges, extraRects);
}

export function createRectFromPoint(
	start: { x: number; y: number },
	end: { x: number; y: number }
): Rect {
	return {
		x: Math.min(start.x, end.x),
		y: Math.min(start.y, end.y),
		width: Math.abs(end.x - start.x),
		height: Math.abs(end.y - start.y)
	};
}

export function isMeaningfulDrag(rect: Rect, threshold = MIN_SIZE): boolean {
	return rect.width >= threshold && rect.height >= threshold;
}

export function dedupeRects(rects: readonly Rect[]): Rect[] {
	const seen = new Set<string>();
	const result: Rect[] = [];
	for (const rect of rects) {
		const key = `${Math.round(rect.x)}:${Math.round(rect.y)}:${Math.round(rect.width)}:${Math.round(rect.height)}`;
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(rect);
	}
	return result;
}
