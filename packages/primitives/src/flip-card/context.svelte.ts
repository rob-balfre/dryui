import { createContext } from '../utils/create-context.js';

export interface FlipCardContext {
	readonly flipped: boolean;
	readonly direction: 'horizontal' | 'vertical';
}

export const [setFlipCardCtx, getFlipCardCtx] = createContext<FlipCardContext>('flip-card');
