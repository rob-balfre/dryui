import { createContext } from '@dryui/primitives';

export interface FlipCardContext {
	readonly flipped: boolean;
	readonly direction: 'horizontal' | 'vertical';
}

export const [setFlipCardCtx, getFlipCardCtx] = createContext<FlipCardContext>('flip-card');
