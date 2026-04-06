import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface VideoEmbedProps extends HTMLAttributes<HTMLDivElement> {
	src: string;
	poster?: string;
	title?: string;
	provider?: 'youtube' | 'vimeo' | 'native';
	autoplay?: boolean;
	aspectRatio?: string;
	playButton?: Snippet;
	children?: Snippet;
}

export { default as VideoEmbed } from './video-embed.svelte';
