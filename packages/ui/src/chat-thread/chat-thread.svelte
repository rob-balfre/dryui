<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		messageCount: number;
		scrollKey?: number;
		children: Snippet<[{ index: number; isLatest: boolean }]>;
	}

	let { messageCount, scrollKey = 0, children, class: className, ...rest }: Props = $props();

	let viewport = $state<HTMLDivElement | null>(null);
	let prefersReducedMotion = $state(false);
	let mounted = false;

	async function scrollToLatest(
		behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth'
	) {
		await new Promise((resolve) => requestAnimationFrame(resolve));
		viewport?.lastElementChild?.scrollIntoView({ behavior, block: 'end' });
	}

	$effect(() => {
		void messageCount;
		const behavior: ScrollBehavior = !mounted || prefersReducedMotion ? 'auto' : 'smooth';
		mounted = true;
		void scrollToLatest(behavior);
	});

	$effect(() => {
		if (scrollKey > 0) {
			void scrollToLatest();
		}
	});

	$effect(() => {
		const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mql.matches;
		const handler = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
		};
		mql.addEventListener('change', handler);
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
		{#each Array.from({ length: messageCount }, (_, index) => index) as index (index)}
			<div data-chat-thread-message>
				{@render children({ index, isLatest: index === messageCount - 1 })}
			</div>
		{/each}
	</div>
</section>

<style>
	[data-chat-thread] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-chat-thread-gap, var(--dry-space-4));
	}

	[data-chat-thread-viewport] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-chat-thread-message-gap, var(--dry-space-3));
	}

	[data-chat-thread-message] {
		animation: chat-message-enter var(--dry-duration-normal) var(--dry-ease-out);
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
