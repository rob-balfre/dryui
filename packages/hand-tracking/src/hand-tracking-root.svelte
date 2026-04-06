<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy, onMount } from 'svelte';
	import {
		createHandTrackingContext,
		setHandTrackingContext,
		type HandTrackingContextOptions
	} from './context.svelte.js';
	import HandTrackingVideo from './hand-tracking-video.svelte';
	import HandTrackingOverlay from './hand-tracking-overlay.svelte';
	import HandTrackingCalibrator from './hand-tracking-calibrator.svelte';

	interface Props extends HandTrackingContextOptions {
		children?: Snippet;
		class?: string;
		overlayWidth?: number;
		overlayHeight?: number;
		showVideo?: boolean;
		showCalibrator?: boolean;
		autoStart?: boolean;
	}

	let {
		children,
		class: className,
		overlayWidth = 320,
		overlayHeight = 240,
		showVideo = true,
		showCalibrator = true,
		autoStart = false,
		calibration = null,
		ongesture,
		onhanddetected,
		onhandlost,
		oncalibrated,
		oncalibrationlost
	}: Props = $props();

	function createInitialContextOptions(): HandTrackingContextOptions {
		const contextOptions: HandTrackingContextOptions = {
			frameSize: {
				width: overlayWidth,
				height: overlayHeight
			}
		};

		if (calibration !== null) {
			contextOptions.calibration = calibration;
		}

		if (typeof ongesture === 'function') {
			contextOptions.ongesture = ongesture;
		}

		if (typeof onhanddetected === 'function') {
			contextOptions.onhanddetected = onhanddetected;
		}

		if (typeof onhandlost === 'function') {
			contextOptions.onhandlost = onhandlost;
		}

		if (typeof oncalibrated === 'function') {
			contextOptions.oncalibrated = oncalibrated;
		}

		if (typeof oncalibrationlost === 'function') {
			contextOptions.oncalibrationlost = oncalibrationlost;
		}

		return contextOptions;
	}

	const context = createHandTrackingContext(createInitialContextOptions());
	setHandTrackingContext(context);

	let isStarting = false;

	onMount(() => {
		if (!autoStart) {
			return;
		}

		let cancelled = false;
		let frame = 0;

		const startWhenReady = () => {
			if (cancelled || context.isTracking) {
				return;
			}

			if (!context.video || isStarting) {
				frame = requestAnimationFrame(startWhenReady);
				return;
			}

			isStarting = true;
			void context
				.start()
				.catch((error) => {
					console.error('Failed to start hand tracking.', error);
				})
				.finally(() => {
					isStarting = false;
				});
		};

		frame = requestAnimationFrame(startWhenReady);

		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
		};
	});

	onDestroy(() => {
		context.stop();
	});
</script>

<div class={className} data-hand-tracking-root>
	<HandTrackingVideo visible={showVideo} />
	<HandTrackingOverlay width={overlayWidth} height={overlayHeight} />
	{#if showCalibrator}
		<HandTrackingCalibrator />
	{/if}
	{@render children?.()}
</div>
