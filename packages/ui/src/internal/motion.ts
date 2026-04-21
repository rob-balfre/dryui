// Re-export shared motion utilities from primitives (single source of truth)
export {
	getReducedMotionPreference,
	observeReducedMotionPreference,
	supportsIntersectionObservers,
	supportsPointerTracking,
	supportsPropertyRegistration,
	registerPropertyOnce,
	supportsWebGL2
} from '@dryui/primitives/internal/motion';

// UI-only motion utilities

export function supportsViewTransitions(): boolean {
	return typeof document !== 'undefined' && 'startViewTransition' in document;
}

export function supportsScrollTimelines(): boolean {
	if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
		return false;
	}

	return (
		CSS.supports('animation-timeline: view()') || CSS.supports('scroll-timeline-name: --dry-scroll')
	);
}

export function extractThemeColor(
	property: string,
	element?: HTMLElement
): [number, number, number] {
	if (typeof document === 'undefined') {
		return [0, 0, 0];
	}

	const readComputedStyle =
		typeof getComputedStyle === 'function'
			? getComputedStyle
			: typeof window !== 'undefined' && typeof window.getComputedStyle === 'function'
				? window.getComputedStyle.bind(window)
				: null;
	if (!readComputedStyle) {
		return [0, 0, 0];
	}

	const el = element ?? document.documentElement;
	const value = readComputedStyle(el).getPropertyValue(property).trim();

	// Parse hex (#rgb, #rrggbb)
	const hexMatch = value.match(/^#([0-9a-f]{3,8})$/i);
	if (hexMatch) {
		const hex = hexMatch[1]!;
		if (hex.length === 3) {
			return [
				parseInt(hex[0]! + hex[0]!, 16) / 255,
				parseInt(hex[1]! + hex[1]!, 16) / 255,
				parseInt(hex[2]! + hex[2]!, 16) / 255
			];
		}
		return [
			parseInt(hex.slice(0, 2), 16) / 255,
			parseInt(hex.slice(2, 4), 16) / 255,
			parseInt(hex.slice(4, 6), 16) / 255
		];
	}

	// Parse rgb(r, g, b) or rgba(r, g, b, a)
	const rgbMatch = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
	if (rgbMatch) {
		return [
			parseFloat(rgbMatch[1]!) / 255,
			parseFloat(rgbMatch[2]!) / 255,
			parseFloat(rgbMatch[3]!) / 255
		];
	}

	// Fallback: black
	return [0, 0, 0];
}
