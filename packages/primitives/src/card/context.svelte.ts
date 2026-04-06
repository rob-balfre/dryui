import { createContext } from '../utils/create-context.js';

const [_setCardCtx, getCardCtx] = createContext<{ isCard: boolean }>('card');

export function setCardCtx() {
	const ctx = { isCard: true };
	return _setCardCtx(ctx);
}

export { getCardCtx };
