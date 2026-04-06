export type {
	LinkPreviewRootProps,
	LinkPreviewTriggerProps,
	LinkPreviewContentProps
} from '@dryui/primitives';

import LinkPreviewRoot from './link-preview-root.svelte';
import LinkPreviewTrigger from './link-preview-trigger.svelte';
import LinkPreviewContent from './link-preview-content.svelte';

export const LinkPreview: {
	Root: typeof LinkPreviewRoot;
	Trigger: typeof LinkPreviewTrigger;
	Content: typeof LinkPreviewContent;
} = {
	Root: LinkPreviewRoot,
	Trigger: LinkPreviewTrigger,
	Content: LinkPreviewContent
};
