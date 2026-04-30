<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference
	} from '../internal/motion.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		scale?: number;
		turbulence?: 'gentle' | 'medium' | 'rough';
		animated?: boolean;
		children?: Snippet;
	}

	let {
		scale = 12,
		turbulence = 'medium',
		animated = false,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	const uid = $props.id();
	const filterId = `displacement-${uid}`;
	let seed = $state(1);
	let prefersReducedMotion = $state(false);

	const baseFrequency = $derived.by(() => {
		if (turbulence === 'gentle') return '0.015';
		if (turbulence === 'rough') return '0.04';
		return '0.025';
	});

	const scaleValue = $derived(`${Math.max(0, scale)}`);
	const shouldAnimate = $derived(animated && !prefersReducedMotion);

	$effect(() => {
		const stopMotionObserver = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		});

		if (getReducedMotionPreference()) {
			prefersReducedMotion = true;
		}

		return stopMotionObserver;
	});

	$effect(() => {
		if (!shouldAnimate) return;

		let frameId: number | undefined;
		let lastTime = 0;
		const FPS_INTERVAL = 1000 / 12; // 12fps for SVG filter re-rasterization

		function animate(time: number) {
			if (time - lastTime >= FPS_INTERVAL) {
				seed = Math.floor(Math.random() * 9999) + 1;
				lastTime = time;
			}

			frameId = requestAnimationFrame(animate);
		}

		frameId = requestAnimationFrame(animate);

		return () => {
			if (frameId !== undefined) {
				cancelAnimationFrame(frameId);
				frameId = undefined;
			}
		};
	});

	function applyFilterStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('filter', `url(#${filterId})`);
		});
	}
</script>

<!-- Hidden SVG with displacement filter — must be inline for Safari compatibility -->
<svg width="0" height="0" class="displacement-svg" aria-hidden="true">
	<defs>
		<filter id={filterId}>
			<feTurbulence type="turbulence" {baseFrequency} numOctaves="3" {seed} result="turbulence" />
			<feDisplacementMap
				in="SourceGraphic"
				in2="turbulence"
				scale={scaleValue}
				xChannelSelector="R"
				yChannelSelector="G"
			/>
		</filter>
	</defs>
</svg>

<div
	class={['displacement', className]}
	data-turbulence={turbulence}
	data-animated={shouldAnimate || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	{...rest}
	use:applyFilterStyles
>
	{@render children?.()}
</div>

<style>
	.displacement-svg {
		position: absolute;
		pointer-events: none;
	}

	.displacement {
		position: relative;
	}
</style>
