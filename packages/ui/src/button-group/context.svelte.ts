import { createContext } from '@dryui/primitives';

export interface ButtonGroupContext {
	readonly orientation: 'horizontal' | 'vertical';
}

const [_setButtonGroupCtx, _getButtonGroupCtx] = createContext<ButtonGroupContext>('button-group');

export function setButtonGroupCtx(ctx: ButtonGroupContext) {
	return _setButtonGroupCtx(ctx);
}

export function getButtonGroupCtx(): ButtonGroupContext | undefined {
	return _getButtonGroupCtx();
}
