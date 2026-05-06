// Widget-runtime data model for tracking layout state of moved or added
// elements. Used by the feedback widget at non-capture times (history,
// undo/redo, draft persistence) and consumed privately by Submission capture
// when it materializes the captured payload. Pure data utilities — no DOM
// snapshotting for capture annotations lives here.

export interface LayoutSnapshot {
	left: string;
	top: string;
	width: string;
	height: string;
	transform: string;
	rotation: string | undefined;
}

export function snapshotElementLayout(element: HTMLElement): LayoutSnapshot {
	return {
		left: element.style.left,
		top: element.style.top,
		width: element.style.width,
		height: element.style.height,
		transform: element.style.transform,
		rotation: element.dataset.dryuiLayoutRotation
	};
}

export function applyElementLayoutSnapshot(element: HTMLElement, snap: LayoutSnapshot): void {
	element.style.left = snap.left;
	element.style.top = snap.top;
	element.style.width = snap.width;
	element.style.height = snap.height;
	element.style.transform = snap.transform;
	if (snap.rotation === undefined) delete element.dataset.dryuiLayoutRotation;
	else element.dataset.dryuiLayoutRotation = snap.rotation;
}

export function sameLayoutSnapshot(a: LayoutSnapshot, b: LayoutSnapshot): boolean {
	return (
		a.left === b.left &&
		a.top === b.top &&
		a.width === b.width &&
		a.height === b.height &&
		a.transform === b.transform &&
		a.rotation === b.rotation
	);
}

export function sanitizeLayoutSnapshot(value: unknown): LayoutSnapshot | null {
	if (!isObject(value)) return null;
	return {
		left: typeof value.left === 'string' ? value.left : '',
		top: typeof value.top === 'string' ? value.top : '',
		width: typeof value.width === 'string' ? value.width : '',
		height: typeof value.height === 'string' ? value.height : '',
		transform: typeof value.transform === 'string' ? value.transform : '',
		rotation: typeof value.rotation === 'string' ? value.rotation : undefined
	};
}

function isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object';
}
