import { getContext, setContext } from 'svelte';
import { createId } from './create-id.js';

const FORM_CONTROL_KEY = Symbol('form-control');

export interface FormControlContext {
	readonly id: string;
	readonly labelId: string;
	readonly descriptionId: string;
	readonly errorId: string;
	readonly describedBy: string | undefined;
	readonly errorMessageId: string | undefined;
	readonly error: string;
	readonly required: boolean;
	readonly disabled: boolean;
	readonly hasError: boolean;
	registerDescription: (mounted: boolean) => void;
	registerError: (mounted: boolean) => void;
}

export function setFormControlCtx(ctx: FormControlContext) {
	setContext(FORM_CONTROL_KEY, ctx);
	return ctx;
}

export function getFormControlCtx(): FormControlContext | undefined {
	try {
		return getContext<FormControlContext>(FORM_CONTROL_KEY);
	} catch {
		return undefined;
	}
}

export function generateFormId(prefix: string): string {
	return createId(prefix);
}
