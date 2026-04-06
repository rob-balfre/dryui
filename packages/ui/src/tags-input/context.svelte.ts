import { createContext } from '@dryui/primitives';

export interface TagsInputContext {
	readonly value: string[];
	readonly disabled: boolean;
	readonly maxTags: number;
	readonly allowDuplicates: boolean;
	readonly canAddMore: boolean;
	addTag: (tag: string) => boolean;
	removeTag: (index: number) => void;
	removeLastTag: () => void;
}
export const [setTagsInputCtx, getTagsInputCtx] = createContext<TagsInputContext>('tags-input');
