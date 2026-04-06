const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const registeredProperties = new Set<string>();

interface RegisteredPropertyDefinition {
	name: string;
	syntax: string;
	inherits: boolean;
	initialValue: string;
}

export function getReducedMotionPreference(): boolean {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		return false;
	}

	return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function observeReducedMotionPreference(onChange: (matches: boolean) => void): () => void {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		onChange(false);
		return () => {};
	}

	const media = window.matchMedia(REDUCED_MOTION_QUERY);
	const update = () => {
		onChange(media.matches);
	};

	update();

	if (typeof media.addEventListener === 'function') {
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	}

	media.addListener(update);
	return () => media.removeListener(update);
}

export function supportsIntersectionObservers(): boolean {
	return typeof IntersectionObserver !== 'undefined';
}

export function supportsPointerTracking(): boolean {
	return typeof window !== 'undefined' && 'PointerEvent' in window;
}

export function supportsPropertyRegistration(): boolean {
	return typeof CSS !== 'undefined' && typeof CSS.registerProperty === 'function';
}

export function registerPropertyOnce(definition: RegisteredPropertyDefinition): boolean {
	if (!supportsPropertyRegistration() || registeredProperties.has(definition.name)) {
		return false;
	}

	try {
		(
			CSS as typeof CSS & {
				registerProperty: (propertyDefinition: RegisteredPropertyDefinition) => void;
			}
		).registerProperty(definition);
		registeredProperties.add(definition.name);
		return true;
	} catch {
		return false;
	}
}

export function supportsWebGL2(): boolean {
	if (typeof document === 'undefined') return false;
	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2');
		return gl !== null;
	} catch {
		return false;
	}
}
