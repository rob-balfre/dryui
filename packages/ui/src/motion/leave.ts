import type { TransitionConfig } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

export interface LeaveOptions {
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

export function leave(node: Element, opts: LeaveOptions = {}): TransitionConfig {
	if (typeof window === 'undefined') {
		return { duration: 0, css: () => '' };
	}
	const styles = getComputedStyle(node as HTMLElement);
	const duration = opts.duration ?? resolveMs(styles.getPropertyValue('--dry-exit-duration'), 360);
	const translate =
		opts.translate ?? (parseFloat(styles.getPropertyValue('--dry-exit-translate') || '12') || 12);
	const blur = opts.blur ?? (parseFloat(styles.getPropertyValue('--dry-exit-blur') || '4') || 4);
	const easing = opts.easing ?? cubicOut;
	return {
		duration,
		delay: opts.delay ?? 0,
		easing,
		css: (t) => {
			const eased = t;
			const y = (1 - eased) * translate;
			const b = (1 - eased) * blur;
			return `transform: translateY(${y}px); filter: blur(${b}px); opacity: ${eased};`;
		}
	};
}
