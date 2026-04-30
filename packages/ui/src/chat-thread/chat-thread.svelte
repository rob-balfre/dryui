<script lang="ts">
	import { tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		messageCount: number;
		scrollKey?: number;
		children: Snippet<
			[
				{
					index: number;
					viewTransitionName: string;
					isLatest: boolean;
				}
			]
		>;
	}

	let { messageCount, scrollKey = 0, children, class: className, ...rest }: Props = $props();

	let viewport = $state<HTMLDivElement | null>(null);
	let renderedCount = $state(0);
	let prefersReducedMotion = $state(false);
	let syncSequence = 0;

	const visibleCount = $derived(Math.min(renderedCount, messageCount));

	type ViewTransitionStarter = (callback: () => void) => {
		ready: Promise<void>;
		finished: Promise<void>;
	};

	function getViewTransitionStarter(): ViewTransitionStarter | null {
		if (typeof document === 'undefined') return null;
		const doc = document as Document & { startViewTransition?: ViewTransitionStarter };
		return doc.startViewTransition ? doc.startViewTransition.bind(doc) : null;
	}

	function findScrollParent(el: HTMLElement | null): HTMLElement | null {
		let parent = el?.parentElement ?? null;
		while (parent) {
			const ov = getComputedStyle(parent).overflowY;
			if (ov === 'auto' || ov === 'scroll') return parent;
			parent = parent.parentElement;
		}
		return null;
	}

	function getVisibleIndices(): Set<number> {
		const visible = new Set<number>();
		if (!viewport) return visible;
		const scroller = findScrollParent(viewport);
		if (!scroller) {
			// No scroll container — all messages are visible
			for (let i = 0; i < viewport.children.length; i++) visible.add(i);
			return visible;
		}
		const rect = scroller.getBoundingClientRect();
		const children = viewport.children;
		for (let i = 0; i < children.length; i++) {
			const cr = children[i]?.getBoundingClientRect();
			if (!cr) continue;
			if (cr.bottom > rect.top && cr.top < rect.bottom) visible.add(i);
		}
		return visible;
	}

	function setTransitionNames(indices: Set<number> | null) {
		const children = viewport?.children;
		if (!children) return;
		for (let i = 0; i < children.length; i++) {
			const name = indices === null || indices.has(i) ? `chat-message-${i}` : 'none';
			(children[i] as HTMLElement).style.setProperty('view-transition-name', name);
		}
	}

	async function scrollToLatest(
		behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth'
	) {
		await tick();
		viewport?.lastElementChild?.scrollIntoView({ behavior, block: 'end' });
	}

	async function syncRenderedCount(nextCount: number) {
		if (nextCount === renderedCount) return;
		const sequence = ++syncSequence;
		const startViewTransition = getViewTransitionStarter();

		if (startViewTransition && !prefersReducedMotion && nextCount > renderedCount) {
			// Only visible messages participate in the view transition.
			// Messages scrolled out of view or newly added get view-transition-name: none
			// so they stay in the root capture (which respects overflow clipping).
			const visibleBefore = getVisibleIndices();

			// Strip names from non-visible messages BEFORE capture
			setTransitionNames(visibleBefore);

			const transition = startViewTransition(async () => {
				renderedCount = nextCount;
				await tick();
				// Keep only previously-visible messages named; new ones get none
				setTransitionNames(visibleBefore);
			});
			transition.ready?.catch(() => {});
			await transition.finished.catch(() => {});
			if (sequence !== syncSequence) return;
			// Restore all names for future transitions
			setTransitionNames(null);
			await scrollToLatest();
			return;
		}

		renderedCount = nextCount;
		if (sequence !== syncSequence) return;
		await scrollToLatest(prefersReducedMotion ? 'auto' : 'smooth');
	}

	$effect(() => {
		void syncRenderedCount(messageCount);
	});

	$effect(() => {
		if (scrollKey > 0) {
			void scrollToLatest();
		}
	});

	$effect(() => {
		void visibleCount;
		const children = viewport?.children;
		if (!children) return;
		for (let i = 0; i < children.length; i++) {
			const child = children[i] as HTMLElement;
			const name = child.dataset.viewTransitionName;
			if (name && child.style.getPropertyValue('view-transition-name') !== name) {
				child.style.setProperty('view-transition-name', name);
			}
		}
	});

	$effect(() => {
		const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mql.matches;
		const handler = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
		};
		mql.addEventListener('change', handler);

		renderedCount = messageCount;
		void scrollToLatest('auto');

		return () => mql.removeEventListener('change', handler);
	});
</script>

<section data-chat-thread class={className} {...rest}>
	<div
		bind:this={viewport}
		data-chat-thread-viewport
		role="log"
		aria-live="polite"
		aria-relevant="additions text"
	>
		{#each Array.from({ length: visibleCount }, (_, index) => index) as index (index)}
			{@const viewTransitionName = `chat-message-${index}`}
			<div data-chat-thread-message data-view-transition-name={viewTransitionName}>
				{@render children({
					index,
					viewTransitionName,
					isLatest: index === visibleCount - 1
				})}
			</div>
		{/each}
	</div>
</section>

<style>
	[data-chat-thread] {
		--dry-chat-thread-gap: var(--dry-space-4);
		--dry-chat-thread-message-gap: var(--dry-space-3);

		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-chat-thread-gap);
	}

	[data-chat-thread-viewport] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-chat-thread-message-gap);
	}

	@supports not (view-transition-name: chat-message-0) {
		[data-chat-thread-message] {
			animation: chat-message-enter 220ms ease-out;
		}
	}

	@keyframes chat-message-enter {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		[data-chat-thread-message] {
			animation: none;
		}
	}
</style>
