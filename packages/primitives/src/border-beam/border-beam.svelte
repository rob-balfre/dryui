<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { resolveBorderRadiusValue } from './radius.js';
	import { generateBeamCSS, sizePresets, sizeThemePresets } from './styles.js';
	import { observeOffscreenState } from '../internal/motion.js';

	type BorderBeamSize = 'sm' | 'md' | 'line';
	type BorderBeamTheme = 'auto' | 'light' | 'dark';
	type BorderBeamColorVariant = 'colorful' | 'mono' | 'ocean' | 'sunset';
	type ResolvedTheme = 'light' | 'dark';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		size?: BorderBeamSize;
		colorVariant?: BorderBeamColorVariant;
		theme?: BorderBeamTheme;
		staticColors?: boolean;
		duration?: number;
		active?: boolean;
		borderRadius?: number | string;
		brightness?: number;
		saturation?: number;
		hueRange?: number;
		strength?: number;
		onActivate?: () => void;
		onDeactivate?: () => void;
		children?: Snippet;
	}

	const uid = $props.id();
	const beamId = uid.replace(/:/g, '-');

	let {
		size = 'md',
		colorVariant = 'colorful',
		theme = 'dark',
		staticColors = false,
		duration,
		active = true,
		borderRadius,
		brightness = 1.3,
		saturation,
		hueRange = 30,
		strength = 1,
		onActivate,
		onDeactivate,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	function inferTheme(): ResolvedTheme {
		if (theme === 'light' || theme === 'dark') return theme;
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function applyBeam(node: HTMLElement) {
		let animationFrame = 0;
		let isActive = active;
		let isFading = false;
		const styleElement = document.createElement('style');
		styleElement.dataset.borderBeamStyle = beamId;
		document.head.appendChild(styleElement);

		const applyBeamState = () => {
			if (isActive && !isFading) {
				node.setAttribute('data-active', '');
				node.removeAttribute('data-fading');
			} else if (isFading) {
				node.removeAttribute('data-active');
				node.setAttribute('data-fading', '');
			} else {
				node.removeAttribute('data-active');
				node.removeAttribute('data-fading');
			}
		};

		const syncActiveState = () => {
			if (active && !isActive && !isFading) {
				isActive = true;
			} else if (!active && isActive && !isFading) {
				isFading = true;
			}

			applyBeamState();
		};

		const refresh = () => {
			const sizeConfig = sizePresets[size];
			const resolvedTheme = inferTheme();
			const themeConfig = sizeThemePresets[size][resolvedTheme];
			const finalDuration = duration ?? (size === 'line' ? 2.4 : 1.96);
			const finalSaturation = saturation ?? themeConfig.saturation;
			const finalHueRange = size === 'line' ? Math.min(hueRange, 13) : hueRange;
			const finalStaticColors = colorVariant === 'mono' ? true : staticColors;

			node.style.cssText = style || '';
			if (typeof borderRadius === 'number') {
				node.style.borderRadius = `${borderRadius}px`;
			} else if (typeof borderRadius === 'string' && borderRadius.trim().length > 0) {
				node.style.borderRadius = borderRadius;
			}
			node.style.setProperty('--beam-strength', `${Math.max(0, Math.min(1, strength))}`);

			const child = node.firstElementChild as HTMLElement | null;
			const finalBorderRadius = resolveBorderRadiusValue({
				borderRadius,
				presetRadius: sizeConfig.borderRadius,
				hostRadius: getComputedStyle(node).borderTopLeftRadius,
				childRadius: child ? getComputedStyle(child).borderTopLeftRadius : null
			});

			styleElement.textContent = generateBeamCSS({
				id: beamId,
				borderRadius: finalBorderRadius,
				borderWidth: sizeConfig.borderWidth,
				duration: finalDuration,
				strokeOpacity: themeConfig.strokeOpacity,
				innerOpacity: themeConfig.innerOpacity,
				bloomOpacity: themeConfig.bloomOpacity,
				innerShadow: themeConfig.innerShadow,
				size,
				colorVariant,
				staticColors: finalStaticColors,
				brightness,
				saturation: finalSaturation,
				hueRange: finalHueRange,
				theme: resolvedTheme
			});
		};

		const scheduleRefresh = () => {
			cancelAnimationFrame(animationFrame);
			animationFrame = requestAnimationFrame(refresh);
		};

		const resizeObserver = new ResizeObserver(scheduleRefresh);
		resizeObserver.observe(node);

		const childObserver = new MutationObserver(scheduleRefresh);
		childObserver.observe(node, { childList: true });

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', scheduleRefresh);

		const stopOffscreenState = observeOffscreenState(node, { rootMargin: '200px' });

		const handleAnimationEnd = (event: Event) => {
			const animationEvent = event as AnimationEvent;
			const animationName = animationEvent.animationName;
			if (!animationName.includes('fade-')) return;

			if (animationName.includes('fade-out')) {
				isActive = false;
				isFading = false;
				onDeactivate?.();
				syncActiveState();
			} else if (animationName.includes('fade-in')) {
				onActivate?.();
			}
		};

		node.addEventListener('animationend', handleAnimationEnd);

		$effect(() => {
			active;
			if (active && !isActive && !isFading) {
				isActive = true;
			} else if (!active && isActive && !isFading) {
				isFading = true;
			}

			applyBeamState();
		});

		$effect(() => {
			size;
			colorVariant;
			theme;
			staticColors;
			duration;
			borderRadius;
			brightness;
			saturation;
			hueRange;
			strength;
			style;

			scheduleRefresh();
		});

		return () => {
			cancelAnimationFrame(animationFrame);
			resizeObserver.disconnect();
			childObserver.disconnect();
			stopOffscreenState();
			mediaQuery.removeEventListener('change', scheduleRefresh);
			node.removeEventListener('animationend', handleAnimationEnd);
			styleElement.remove();
		};
	}
</script>

<div data-beam={beamId} data-size={size} class={className} {...rest} {@attach applyBeam}>
	{#if children}
		{@render children()}
	{/if}
	<div data-beam-bloom aria-hidden="true"></div>
</div>
