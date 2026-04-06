<script lang="ts">
	import { onMount } from 'svelte';
	import { getHandTrackingContext } from './context.svelte.js';

	interface Props {
		width?: number;
		height?: number;
		class?: string;
	}

	let { width = 320, height = 240, class: className }: Props = $props();
	const context = getHandTrackingContext();
	let canvas: HTMLCanvasElement | null = null;
	const skeletonChains = [
		[0, 1, 2, 3, 4],
		[0, 5, 6, 7, 8],
		[0, 9, 10, 11, 12],
		[0, 13, 14, 15, 16],
		[0, 17, 18, 19, 20]
	] as const;

	function initCanvas(node: HTMLCanvasElement): void | (() => void) {
		canvas = node;

		return () => {
			canvas = null;
		};
	}

	onMount(() => {
		let frame = 0;
		const BUFFER_SCALE = 2;

		const render = () => {
			if (canvas) {
				const sourceWidth = context.debug.frameWidth || context.video?.videoWidth || width;
				const sourceHeight = context.debug.frameHeight || context.video?.videoHeight || height;
				const bufferWidth = sourceWidth * BUFFER_SCALE;
				const bufferHeight = sourceHeight * BUFFER_SCALE;

				if (canvas.width !== bufferWidth) {
					canvas.width = bufferWidth;
				}
				if (canvas.height !== bufferHeight) {
					canvas.height = bufferHeight;
				}

				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.setTransform(BUFFER_SCALE, 0, 0, BUFFER_SCALE, 0, 0);
					ctx.clearRect(0, 0, bufferWidth, bufferHeight);
					ctx.strokeStyle = 'rgba(0, 200, 120, 0.95)';
					ctx.fillStyle = 'rgba(0, 200, 120, 0.45)';
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';
					ctx.lineWidth = 1.5;

					for (const hand of context.hands) {
						for (const chain of skeletonChains) {
							ctx.beginPath();

							chain.forEach((pointIndex, chainIndex) => {
								const point = hand.points[pointIndex];
								if (!point) {
									return;
								}

								if (chainIndex === 0) {
									ctx.moveTo(point.x, point.y);
								} else {
									ctx.lineTo(point.x, point.y);
								}
							});

							ctx.stroke();
						}

						for (const point of hand.points) {
							ctx.beginPath();
							ctx.arc(point.x, point.y, point === hand.wrist ? 2.5 : 1.75, 0, Math.PI * 2);
							ctx.fill();
						}

						ctx.beginPath();
						ctx.arc(hand.palmCenter.x, hand.palmCenter.y, 6, 0, Math.PI * 2);
						ctx.stroke();
					}

					if (context.cursor) {
						ctx.fillStyle = 'rgba(255, 99, 71, 0.9)';
						ctx.beginPath();
						ctx.arc(context.cursor.x, context.cursor.y, 2, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			}

			frame = requestAnimationFrame(render);
		};

		frame = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(frame);
		};
	});
</script>

<canvas class={className} {width} {height} aria-hidden="true" {@attach initCanvas}></canvas>

<style>
	canvas {
		object-fit: cover;
	}
</style>
