<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTableOfContentsCtx, type TocHeading } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		selector?: string;
		headingSelector?: string;
		rootMargin?: string;
		autoId?: boolean;
		children: Snippet;
	}

	let {
		selector = 'main',
		headingSelector = 'h2, h3, h4',
		rootMargin = '0px 0px -80% 0px',
		autoId = true,
		class: className,
		children,
		...rest
	}: Props = $props();

	let headings = $state<TocHeading[]>([]);
	let activeId = $state<string | null>(null);

	$effect(() => {
		const container = document.querySelector(selector);
		if (!container) return;

		const elements = container.querySelectorAll(headingSelector);
		const scanned: TocHeading[] = [];
		elements.forEach((el) => {
			if (!el.id && autoId)
				el.id =
					el.textContent
						?.trim()
						.toLowerCase()
						.replace(/\s+/g, '-')
						.replace(/[^\w-]/g, '') ?? '';
			if (el.id)
				scanned.push({
					id: el.id,
					text: el.textContent?.trim() ?? '',
					level: parseInt(el.tagName[1] ?? '0')
				});
		});
		headings = scanned;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				}
			},
			{ rootMargin }
		);

		elements.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});

	setTableOfContentsCtx({
		get headings() {
			return headings;
		},
		get activeId() {
			return activeId;
		}
	});
</script>

<nav aria-label="Table of contents" data-part="root" class={className} {...rest}>
	{@render children()}
</nav>

<style>
	[data-part='root'] {
		padding: var(--dry-toc-padding, var(--dry-space-4));
		background: var(--dry-toc-bg, var(--dry-color-bg-overlay));
		border: 1px solid var(--dry-toc-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-toc-radius, var(--dry-radius-xl));
		box-shadow: var(--dry-toc-shadow, var(--dry-shadow-sm));
		font-family: var(--dry-font-sans);
	}
</style>
