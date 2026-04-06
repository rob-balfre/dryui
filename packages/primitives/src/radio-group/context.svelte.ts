import { createContext } from '../utils/create-context.js';

export interface RadioGroupContext {
	readonly name: string;
	readonly value: string;
	readonly disabled: boolean;
	readonly required: boolean;
	select: (value: string) => void;
}
export const [setRadioGroupCtx, getRadioGroupCtx] = createContext<RadioGroupContext>('radio-group');
