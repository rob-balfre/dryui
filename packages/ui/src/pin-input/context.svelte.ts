import { createContext } from '@dryui/primitives';

export interface PinInputCell {
	readonly char: string | null;
	readonly isActive: boolean;
	readonly hasFakeCaret: boolean;
	readonly index: number;
}

export interface PinInputContext {
	readonly cells: PinInputCell[];
	readonly value: string;
	readonly disabled: boolean;
	readonly hasError: boolean;
	readonly mask: boolean;
	readonly placeholder: string;
}
export const [setPinInputCtx, getPinInputCtx] = createContext<PinInputContext>('pin-input');
