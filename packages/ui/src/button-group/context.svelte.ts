import { getContext, setContext, hasContext } from 'svelte';

const KEY = Symbol('button-group');

export interface ButtonGroupContext {
	readonly orientation: 'horizontal' | 'vertical';
}

export function setButtonGroupCtx(ctx: ButtonGroupContext) {
	setContext(KEY, ctx);
	return ctx;
}

export function getButtonGroupCtx(): ButtonGroupContext | undefined {
	if (!hasContext(KEY)) return undefined;
	return getContext<ButtonGroupContext>(KEY);
}
