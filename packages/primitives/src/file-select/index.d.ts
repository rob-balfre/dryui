import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export type { FileSelectContext } from './context.svelte.js';
export { getFileSelectCtx, setFileSelectCtx } from './context.svelte.js';
export interface FileSelectRootProps {
	value?: string | null;
	onrequest?: (() => Promise<string | null>) | undefined;
	onchange?: ((value: string | null) => void) | undefined;
	disabled?: boolean | undefined;
	children: Snippet;
}
export interface FileSelectTriggerProps extends HTMLButtonAttributes {
	children: Snippet;
}
export interface FileSelectValueProps extends HTMLAttributes<HTMLSpanElement> {
	placeholder?: string;
}
export interface FileSelectClearProps extends Omit<HTMLButtonAttributes, 'children'> {
	children?: Snippet | undefined;
}
import FileSelectRoot from './file-select-root.svelte';
import FileSelectTrigger from './file-select-trigger.svelte';
import FileSelectValue from './file-select-value.svelte';
import FileSelectClear from './file-select-clear.svelte';
export declare const FileSelect: {
	Root: typeof FileSelectRoot;
	Trigger: typeof FileSelectTrigger;
	Value: typeof FileSelectValue;
	Clear: typeof FileSelectClear;
};
