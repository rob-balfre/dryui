import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { PinInputCell as PinInputCellType } from './context.svelte.js';
export type PinInputCell = PinInputCellType;
export interface PinInputRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	value?: string;
	length?: number;
	mask?: boolean;
	type?: 'numeric' | 'alphanumeric';
	pattern?: RegExp;
	placeholder?: string;
	disabled?: boolean;
	oncomplete?: (value: string) => void;
	pasteTransformer?: (text: string) => string;
	blurOnComplete?: boolean;
	name?: string;
	children?: Snippet<
		[
			{
				cells: PinInputCellType[];
			}
		]
	>;
}
export interface PinInputGroupProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
export interface PinInputCellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	cell: PinInputCellType;
	children?: Snippet<
		[
			{
				char: string | null;
				isActive: boolean;
				hasFakeCaret: boolean;
			}
		]
	>;
}
export interface PinInputSeparatorProps extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}
import PinInputRoot from './pin-input-root.svelte';
import PinInputGroup from './pin-input-group.svelte';
import PinInputCellComponent from './pin-input-cell.svelte';
import PinInputSeparator from './pin-input-separator.svelte';
export declare const PinInput: {
	Root: typeof PinInputRoot;
	Group: typeof PinInputGroup;
	Cell: typeof PinInputCellComponent;
	Separator: typeof PinInputSeparator;
};
