import { createContext } from '@dryui/primitives';

export interface FileSelectContext {
	readonly value: string | null;
	readonly loading: boolean;
	readonly disabled: boolean;
	request: () => void;
	clear: () => void;
}
export const [setFileSelectCtx, getFileSelectCtx] = createContext<FileSelectContext>('file-select');
