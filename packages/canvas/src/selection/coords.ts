export interface ViewportTransform {
	scale: number;
	offsetX: number;
	offsetY: number;
}

export function screenToCanvas(
	point: { x: number; y: number },
	transform: ViewportTransform
): { x: number; y: number } {
	return {
		x: (point.x - transform.offsetX) / transform.scale,
		y: (point.y - transform.offsetY) / transform.scale
	};
}

export function canvasToScreen(
	point: { x: number; y: number },
	transform: ViewportTransform
): { x: number; y: number } {
	return {
		x: point.x * transform.scale + transform.offsetX,
		y: point.y * transform.scale + transform.offsetY
	};
}
