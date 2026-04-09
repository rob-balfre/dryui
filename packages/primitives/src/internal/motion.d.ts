interface RegisteredPropertyDefinition {
	name: string;
	syntax: string;
	inherits: boolean;
	initialValue: string;
}
export declare function getReducedMotionPreference(): boolean;
export declare function observeReducedMotionPreference(
	onChange: (matches: boolean) => void
): () => void;
export declare function supportsIntersectionObservers(): boolean;
export declare function supportsPointerTracking(): boolean;
export declare function supportsPropertyRegistration(): boolean;
export declare function registerPropertyOnce(definition: RegisteredPropertyDefinition): boolean;
export declare function supportsWebGL2(): boolean;
export {};
