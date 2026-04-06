<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		threshold?: number;
		target?: HTMLElement | undefined;
		behavior?: ScrollBehavior;
		children: Snippet<[{ visible: boolean; scrollToTop: () => void }]>;
	}

	let { threshold = 300, target, behavior = 'smooth', children }: Props = $props();

	let visible = $state(false);

	function scrollToTop() {
		if (target) {
			target.scrollTo({ top: 0, behavior });
		} else {
			window.scrollTo({ top: 0, behavior });
		}
	}

	$effect(() => {
		const el = target ?? window;

		function handleScroll() {
			if (target) {
				visible = target.scrollTop > threshold;
			} else {
				visible = window.scrollY > threshold;
			}
		}

		handleScroll();
		el.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			el.removeEventListener('scroll', handleScroll);
		};
	});
</script>

{@render children({ visible, scrollToTop })}
