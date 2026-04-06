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
export declare function setTagsInputCtx(ctx: TagsInputContext): TagsInputContext;
export declare function getTagsInputCtx(): TagsInputContext;
