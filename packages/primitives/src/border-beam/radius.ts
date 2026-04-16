export function parsePixelRadius(value: string, fallback: number): number {
	const first = value.split(' ')[0]?.trim() ?? '';
	const parsed = Number.parseFloat(first);
	return Number.isFinite(parsed) ? parsed : fallback;
}

interface ResolveBorderRadiusOptions {
	borderRadius: number | string | undefined;
	presetRadius: number;
	hostRadius?: string | null;
	childRadius?: string | null;
}

export function resolveBorderRadiusValue({
	borderRadius,
	presetRadius,
	hostRadius,
	childRadius
}: ResolveBorderRadiusOptions): number {
	if (typeof borderRadius === 'number') return borderRadius;

	if (typeof borderRadius === 'string' && borderRadius.trim().length > 0) {
		return parsePixelRadius(hostRadius ?? '', presetRadius);
	}

	if (childRadius) {
		return parsePixelRadius(childRadius, presetRadius);
	}

	if (hostRadius) {
		return parsePixelRadius(hostRadius, presetRadius);
	}

	return presetRadius;
}
