import type { TransitionConfig } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

export interface EnterOptions {
	index?: number;
	delay?: number;
	duration?: number;
	translate?: number;
	blur?: number;
	easing?: (t: number) => number;
}

function resolveMs(value: string | undefined, fallback: number): number {
	if (!value) return fallback;
	const trimmed = value.trim();
	if (trimmed.endsWith('ms')) return parseFloat(trimmed);
	if (trimmed.endsWith('s')) return parseFloat(trimmed) * 1000;
	return parseFloat(trimmed) || fallback;
}

export function enter(node: Element, opts: EnterOptions = {}): TransitionConfig {
	if (typeof window === 'undefined') {
		return { duration: 0, css: () => '' };
	}
	const styles = getComputedStyle(node as HTMLElement);
	const duration = opts.duration ?? resolveMs(styles.getPropertyValue('--dry-enter-duration'), 800);
	const stagger = resolveMs(styles.getPropertyValue('--dry-enter-stagger-section'), 100);
	const index = opts.index ?? 0;
	const max = parseFloat(styles.getPropertyValue('--dry-enter-stagger-max') || '16') || 16;
	const delay = opts.delay ?? Math.min(index, max) * stagger;
	const translate =
		opts.translate ?? (parseFloat(styles.getPropertyValue('--dry-enter-translate') || '8') || 8);
	const blur = opts.blur ?? (parseFloat(styles.getPropertyValue('--dry-enter-blur') || '5') || 5);
	const easing = opts.easing ?? cubicOut;
	return {
		duration,
		delay,
		easing,
		css: (t) => {
			const eased = t;
			const y = (1 - eased) * translate;
			const b = (1 - eased) * blur;
			return `transform: translateY(${y}px); filter: blur(${b}px); opacity: ${eased};`;
		}
	};
}
