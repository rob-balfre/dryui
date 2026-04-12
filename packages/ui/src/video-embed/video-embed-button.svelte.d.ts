import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	src: string;
	poster?: string;
	title?: string;
	provider?: 'youtube' | 'vimeo' | 'native';
	autoplay?: boolean;
	aspectRatio?: string;
	playButton?: Snippet;
	children?: Snippet;
}
declare const VideoEmbed: import('svelte').Component<Props, {}, ''>;
type VideoEmbed = ReturnType<typeof VideoEmbed>;
export default VideoEmbed;
