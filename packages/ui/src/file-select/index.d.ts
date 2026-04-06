import type {
	FileSelectTriggerProps as PrimitiveFileSelectTriggerProps,
	FileSelectClearProps as PrimitiveFileSelectClearProps
} from '@dryui/primitives';
export type { FileSelectRootProps, FileSelectValueProps } from '@dryui/primitives';
export interface FileSelectTriggerProps extends PrimitiveFileSelectTriggerProps {
	size?: 'sm' | 'md' | 'lg';
}
export interface FileSelectClearProps extends PrimitiveFileSelectClearProps {}
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
