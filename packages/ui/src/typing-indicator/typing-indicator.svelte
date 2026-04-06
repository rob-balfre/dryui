<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();
</script>

<div
	data-typing-indicator
	class={className}
	role="status"
	aria-live="polite"
	aria-label="Typing"
	{...rest}
>
	<span data-dot></span>
	<span data-dot></span>
	<span data-dot></span>
</div>

<style>
	[data-typing-indicator] {
		--dry-typing-indicator-gap: var(--dry-space-1_5);
		--dry-typing-indicator-dot-size: 0.5rem;
		--dry-typing-indicator-dot-color: var(--dry-color-text-weak);

		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-typing-indicator-gap);
		min-height: calc(var(--dry-typing-indicator-dot-size) + var(--dry-space-1));
	}

	[data-dot] {
		height: var(--dry-typing-indicator-dot-size);
		aspect-ratio: 1;
		border-radius: var(--dry-radius-full);
		background: var(--dry-typing-indicator-dot-color);
		opacity: 0.75;
		animation: typing-dot 1s ease-in-out infinite;
	}

	[data-dot]:nth-child(2) {
		animation-delay: 0.15s;
	}

	[data-dot]:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes typing-dot {
		0%,
		80%,
		100% {
			transform: translateY(0);
			opacity: 0.5;
		}

		40% {
			transform: translateY(-0.2rem);
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		[data-dot] {
			animation: none;
		}
	}
</style>
