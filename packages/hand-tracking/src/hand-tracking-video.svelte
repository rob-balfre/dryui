<script lang="ts">
	import { getHandTrackingContext } from './context.svelte.js';

	interface Props {
		autoplay?: boolean;
		muted?: boolean;
		playsinline?: boolean;
		visible?: boolean;
		class?: string;
		onready?: (video: HTMLVideoElement) => void;
	}

	let {
		autoplay = true,
		muted = true,
		playsinline = true,
		visible = true,
		class: className,
		onready
	}: Props = $props();
	const context = getHandTrackingContext();

	function bindVideo(node: HTMLVideoElement): void | (() => void) {
		context.attachVideo?.(node);
		onready?.(node);

		return () => {
			context.attachVideo?.(null);
		};
	}
</script>

<video
	class={[className, !visible && 'hand-tracking-video-hidden']}
	{autoplay}
	{muted}
	{playsinline}
	{@attach bindVideo}
></video>

<style>
	.hand-tracking-video-hidden.hand-tracking-video-hidden {
		position: fixed;
		top: -9999px;
		left: -9999px;
		width: 320px;
		height: 240px;
		min-height: 0;
		margin: 0;
		padding: 0;
		border: 0;
		opacity: 0;
		pointer-events: none;
		overflow: hidden;
		transform: none;
	}
</style>
