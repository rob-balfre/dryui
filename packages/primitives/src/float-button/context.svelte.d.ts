interface FloatButtonContext {
	readonly open: boolean;
	toggle: () => void;
}
export declare function setFloatButtonCtx(ctx: FloatButtonContext): FloatButtonContext;
export declare function getFloatButtonCtx(): FloatButtonContext;
export {};
