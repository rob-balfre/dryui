export {
	getReducedMotionPreference,
	observeReducedMotionPreference,
	supportsIntersectionObservers,
	supportsPointerTracking,
	supportsPropertyRegistration,
	registerPropertyOnce,
	supportsWebGL2
} from '@dryui/primitives/internal/motion';

export declare function supportsViewTransitions(): boolean;
export declare function supportsScrollTimelines(): boolean;
export declare function extractThemeColor(
	property: string,
	element?: HTMLElement
): [number, number, number];
