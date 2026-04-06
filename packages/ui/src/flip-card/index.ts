export type { FlipCardRootProps, FlipCardFrontProps, FlipCardBackProps } from '@dryui/primitives';

import FlipCardRoot from './flip-card-root.svelte';
import FlipCardFront from './flip-card-front.svelte';
import FlipCardBack from './flip-card-back.svelte';

export const FlipCard: {
	Root: typeof FlipCardRoot;
	Front: typeof FlipCardFront;
	Back: typeof FlipCardBack;
} = {
	Root: FlipCardRoot,
	Front: FlipCardFront,
	Back: FlipCardBack
};
