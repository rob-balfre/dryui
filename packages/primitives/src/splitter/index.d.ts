import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface SplitterRootProps extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'horizontal' | 'vertical';
	sizes?: number[];
	children: Snippet;
}
export interface SplitterPanelProps extends HTMLAttributes<HTMLDivElement> {
	index: number;
	children: Snippet;
}
export interface SplitterHandleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	index: number;
	children?: Snippet | undefined;
}
import SplitterRoot from './splitter-root.svelte';
import SplitterPanel from './splitter-panel.svelte';
import SplitterHandle from './splitter-handle.svelte';
export declare const Splitter: {
	Root: typeof SplitterRoot;
	Panel: typeof SplitterPanel;
	Handle: typeof SplitterHandle;
};
